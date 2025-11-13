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

    // Build where clause for score records
    const whereClause: any = {
      recordedAt: {
        gte: startDate,
        lte: endDate
      }
    }

    // Add userId filter if specified
    if (userId) {
      whereClause.userId = targetUserId
    }

    // Add groupId filter if specified
    if (groupId) {
      whereClause.groupId = groupId
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

    // Group by date for daily trend analysis (NO ACCUMULATION)
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

    // Convert to arrays for charts - return RAW DAILY POINTS (no accumulation)
    const trendData = Object.entries(dailyPoints)
      .map(([date, points]) => ({ date, points }))
      .sort((a, b) => a.date.localeCompare(b.date))

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

    // Build where clause for previous period
    const previousWhereClause: any = {
      recordedAt: {
        gte: previousStartDate,
        lte: previousEndDate
      }
    }
    
    if (userId) {
      previousWhereClause.userId = targetUserId
    }
    
    if (groupId) {
      previousWhereClause.groupId = groupId
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

    // Add group breakdown for multi-group view (when no specific group is selected)
    let groupBreakdownData: any[] = []
    if (!groupId) {
      // Get all groups with their score records
      const groupStats: { [key: string]: { name: string; points: number; count: number } } = {}
      
      // Initialize all groups
      const allGroups = await prisma.group.findMany({
        select: { id: true, name: true }
      })
      
      allGroups.forEach(group => {
        groupStats[group.id] = {
          name: group.name || 'Nhóm không xác định',
          points: 0,
          count: 0
        }
      })
      
      // Calculate stats for each group
      scoreRecords.forEach(record => {
        if (record.group && groupStats[record.groupId]) {
          groupStats[record.groupId].points += record.points
          groupStats[record.groupId].count += 1
        }
      })
      
      groupBreakdownData = Object.entries(groupStats)
        .filter(([_, data]) => data.count > 0) // Only include groups with actual data
        .map(([groupId, data]) => ({
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
    console.error('Lỗi tải dữ liệu phân tích hàng ngày:', error)
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 })
  }
}