import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-logger'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { groupId, ruleId, criteria, notes } = await request.json()

    if (!groupId || !ruleId) {
      return NextResponse.json({ 
        error: 'Group ID and rule ID are required' 
      }, { status: 400 })
    }

    // Verify user has access to this group
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          where: { userId: session.user.id }
        }
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    if (group.members.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get the scoring rule
    const rule = await prisma.scoringRule.findUnique({
      where: { id: ruleId },
      include: {
        group: {
          select: { id: true }
        }
      }
    })

    if (!rule) {
      return NextResponse.json({ error: 'Scoring rule not found' }, { status: 404 })
    }

    if (!rule.isActive) {
      return NextResponse.json({ error: 'This scoring rule is no longer active' }, { status: 400 })
    }

    if (rule.groupId !== groupId) {
      return NextResponse.json({ error: 'Scoring rule does not belong to this group' }, { status: 400 })
    }

    // Create score record
    const scoreRecord = await prisma.scoreRecord.create({
      data: {
        userId: session.user.id,
        groupId,
        ruleId,
        points: rule.points,
        criteria: criteria || rule.criteria,
        notes: notes?.trim() || null,
      },
      include: {
        rule: {
          select: { id: true, name: true, points: true }
        },
        group: {
          select: { id: true, name: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      groupId,
      action: 'SCORE_RECORDED',
      description: `Recorded ${rule.points} points for rule "${rule.name}"`,
      metadata: { 
        ruleName: rule.name, 
        points: rule.points, 
        scoreRecordId: scoreRecord.id,
        criteria 
      }
    })

    return NextResponse.json({ scoreRecord }, { status: 201 })
  } catch (error) {
    console.error('Error recording score:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 })
    }

    // Verify user has access to this group
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          where: { userId: session.user.id }
        }
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const whereClause: any = {
      groupId
    }

    // If userId is specified and different from current user, verify access
    if (userId && userId !== session.user.id) {
      if (group.members.length === 0 || (group.members[0].role === 'MEMBER')) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
      whereClause.userId = userId
    } else {
      whereClause.userId = session.user.id
    }

    // Add date filters
    if (startDate) {
      whereClause.recordedAt = { ...whereClause.recordedAt, gte: new Date(startDate) }
    }
    if (endDate) {
      whereClause.recordedAt = { ...whereClause.recordedAt, lte: new Date(endDate) }
    }

    const [scoreRecords, total] = await Promise.all([
      prisma.scoreRecord.findMany({
        where: whereClause,
        include: {
          rule: {
            select: { id: true, name: true, points: true }
          },
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { recordedAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.scoreRecord.count({ where: whereClause })
    ])

    return NextResponse.json({ 
      scoreRecords,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching score records:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}