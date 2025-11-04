import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfWeek, startOfMonth, startOfYear, endOfWeek, endOfMonth, endOfYear, format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Chưa được xác thực' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')
    const period = searchParams.get('period') || 'month' // week, month, year
    const userId = searchParams.get('userId') // optional, for admin views

    let groups: any[] = []
    let isAllGroups = false

    // Handle empty/missing groupId as "all user's groups"
    if (!groupId || groupId === '') {
      isAllGroups = true
      // Fetch all groups where user is a member
      const userMemberships = await prisma.groupMember.findMany({
        where: { userId: session.user.id },
        include: {
          group: {
            include: {
              members: true
            }
          }
        }
      })
      
      groups = userMemberships.map(membership => membership.group)
      
      if (groups.length === 0) {
        // User has no groups, return empty analytics
        return NextResponse.json({
          analytics: {
            period,
            dateRange: { start: new Date().toISOString(), end: new Date().toISOString() },
            summary: {
              totalPoints: 0,
              recordCount: 0,
              averagePoints: 0,
              previousPeriod: { totalPoints: 0, recordCount: 0, pointsChange: 0, pointsChangePercent: 0 }
            },
            trendData: [],
            ruleBreakdown: [],
            groupBreakdown: []
          }
        })
      }
    } else {
      // Single group mode - verify user has access to this group
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
          members: {
            where: userId ? {} : { userId: session.user.id }
          }
        }
      })

      if (!group) {
        return NextResponse.json({ error: 'Không tìm thấy nhóm' }, { status: 404 })
      }

      // If userId is specified, verify admin access
      if (userId && userId !== session.user.id) {
        const hasAdminAccess = group.members.some(member => 
          member.userId === session.user.id && (member.role === 'OWNER' || member.role === 'ADMIN')
        )
        if (!hasAdminAccess) {
          return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
        }
      }
      
      groups = [group]
    }

    const targetUserId = userId || session.user.id
    const now = new Date()
    let startDate: Date
    let endDate: Date

    // Set date range based on period
    switch (period) {
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 })
        endDate = endOfWeek(now, { weekStartsOn: 1 })
        break
      case 'year':
        startDate = startOfYear(now)
        endDate = endOfYear(now)
        break
      case 'month':
      default:
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
    }

    // Get score records for the period (across all groups or single group)
    const groupIds = groups.map(g => g.id)
    
    // Build where clause - only filter by userId if explicitly requested (for admin views)
    const whereClause: any = {
      groupId: { in: groupIds },
      recordedAt: {
        gte: startDate,
        lte: endDate
      }
    }
    
    // Only add userId filter if explicitly viewing a specific user's stats
    if (userId) {
      whereClause.userId = targetUserId
    }
    
    const scoreRecords = await prisma.scoreRecord.findMany({
      where: whereClause,
      include: {
        rule: {
          select: { id: true, name: true, points: true }
        },
        group: {
          select: { id: true, name: true }
        }
      },
      orderBy: { recordedAt: 'desc' }
    })

    // Calculate analytics
    const totalPoints = scoreRecords.reduce((sum, record) => sum + record.points, 0)
    const averagePoints = scoreRecords.length > 0 ? totalPoints / scoreRecords.length : 0

    // Group by date for trend analysis
    const dailyPoints: { [key: string]: number } = {}
    const ruleBreakdown: { [key: string]: { name: string; points: number; count: number } } = {}

    scoreRecords.forEach(record => {
      const dateKey = format(record.recordedAt, 'yyyy-MM-dd')
      dailyPoints[dateKey] = (dailyPoints[dateKey] || 0) + record.points

      // Only process if rule exists (not deleted)
      if (record.rule) {
        const ruleKey = record.rule.id
        if (!ruleBreakdown[ruleKey]) {
          ruleBreakdown[ruleKey] = {
            name: record.rule.name || 'Quy tắc không xác định',
            points: 0,
            count: 0
          }
        }
        ruleBreakdown[ruleKey].points += record.points
        ruleBreakdown[ruleKey].count += 1
      }
    })

    // Convert to arrays for charts
    const trendData = Object.entries(dailyPoints).map(([date, points]) => ({
      date,
      points
    })).sort((a, b) => a.date.localeCompare(b.date))

    const ruleData = Object.entries(ruleBreakdown).map(([ruleId, data]) => ({
      ruleId,
      name: data.name,
      totalPoints: data.points,
      count: data.count,
      averagePoints: data.points / data.count
    })).sort((a, b) => b.totalPoints - a.totalPoints)

    // Get comparison with previous period
    let previousPeriodData = null
    const periodDuration = endDate.getTime() - startDate.getTime()
    const previousStartDate = new Date(startDate.getTime() - periodDuration)
    const previousEndDate = new Date(startDate.getTime() - 1)

    // Build where clause for previous period (same logic as current period)
    const previousWhereClause: any = {
      groupId: { in: groupIds },
      recordedAt: {
        gte: previousStartDate,
        lte: previousEndDate
      }
    }
    
    if (userId) {
      previousWhereClause.userId = targetUserId
    }

    const previousScoreRecords = await prisma.scoreRecord.findMany({
      where: previousWhereClause
    })

    const previousTotalPoints = previousScoreRecords.reduce((sum, record) => sum + record.points, 0)
    const pointsChange = totalPoints - previousTotalPoints
    const pointsChangePercent = previousTotalPoints > 0 ? (pointsChange / previousTotalPoints) * 100 : 0

    previousPeriodData = {
      totalPoints: previousTotalPoints,
      recordCount: previousScoreRecords.length,
      pointsChange,
      pointsChangePercent
    }

    // Add group breakdown for multi-group view
    let groupBreakdownData: any[] = []
    if (isAllGroups && groups.length > 1) {
      const groupStats: { [key: string]: { name: string; points: number; count: number } } = {}
      
      groups.forEach(group => {
        groupStats[group.id] = {
          name: group.name || 'Nhóm không xác định',
          points: 0,
          count: 0
        }
      })
      
      scoreRecords.forEach(record => {
        if (record.group && groupStats[record.groupId]) {
          groupStats[record.groupId].points += record.points
          groupStats[record.groupId].count += 1
        }
      })
      
      groupBreakdownData = Object.entries(groupStats).map(([groupId, data]) => ({
        groupId,
        name: data.name,
        totalPoints: data.points,
        recordCount: data.count,
        averagePoints: data.count > 0 ? Math.round((data.points / data.count) * 100) / 100 : 0
      })).sort((a, b) => b.totalPoints - a.totalPoints)
    }

    return NextResponse.json({
      analytics: {
        period,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        summary: {
          totalPoints,
          recordCount: scoreRecords.length,
          averagePoints: Math.round(averagePoints * 100) / 100,
          previousPeriod: previousPeriodData
        },
        trendData,
        ruleBreakdown: ruleData,
        groupBreakdown: groupBreakdownData
      }
    })
  } catch (error) {
    console.error('Lỗi tải dữ liệu phân tích:', error)
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 })
  }
}