import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfWeek, startOfMonth, startOfYear, endOfWeek, endOfMonth, endOfYear, format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')
    const period = searchParams.get('period') || 'month' // week, month, year
    const userId = searchParams.get('userId') // optional, for admin views

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 })
    }

    // Verify user has access to this group
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          where: userId ? {} : { userId: session.user.id }
        }
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // If userId is specified, verify admin access
    if (userId && userId !== session.user.id) {
      const hasAdminAccess = group.members.some(member => 
        member.userId === session.user.id && (member.role === 'OWNER' || member.role === 'ADMIN')
      )
      if (!hasAdminAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
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

    // Get score records for the period
    const scoreRecords = await prisma.scoreRecord.findMany({
      where: {
        groupId,
        userId: targetUserId,
        recordedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        rule: {
          select: { id: true, name: true, points: true }
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

      const ruleKey = record.rule.id
      if (!ruleBreakdown[ruleKey]) {
        ruleBreakdown[ruleKey] = {
          name: record.rule.name,
          points: 0,
          count: 0
        }
      }
      ruleBreakdown[ruleKey].points += record.points
      ruleBreakdown[ruleKey].count += 1
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

    const previousScoreRecords = await prisma.scoreRecord.findMany({
      where: {
        groupId,
        userId: targetUserId,
        recordedAt: {
          gte: previousStartDate,
          lte: previousEndDate
        }
      }
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
        ruleBreakdown: ruleData
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}