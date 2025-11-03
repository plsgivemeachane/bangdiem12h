import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-logger'
import { ActivityType } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { groupId, ruleId, criteria, notes, targetUserId, points: customPoints } = await request.json()

    if (!groupId || !ruleId || !targetUserId) {
      return NextResponse.json({ 
        error: 'Group ID, rule ID, and target user ID are required' 
      }, { status: 400 })
    }

    // Verify current user is ADMIN/OWNER of this group
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

    const currentUserMember = group.members[0]
    if (!currentUserMember) {
      return NextResponse.json({ 
        error: 'You are not a member of this group' 
      }, { status: 403 })
    }

    // Only Group ADMINs can record scores
    if (!['OWNER', 'ADMIN'].includes(currentUserMember.role)) {
      return NextResponse.json({ 
        error: 'Only group administrators can record scores' 
      }, { status: 403 })
    }

    // Verify target user is in the group
    const targetMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: targetUserId,
          groupId
        }
      }
    })

    if (!targetMember) {
      return NextResponse.json({ 
        error: 'Target user is not a member of this group' 
      }, { status: 404 })
    }

    // Get the scoring rule
    const rule = await prisma.scoringRule.findUnique({
      where: { id: ruleId }
    })

    if (!rule || !rule.isActive) {
      return NextResponse.json({ 
        error: 'Scoring rule not found or inactive' 
      }, { status: 404 })
    }

    // Verify rule belongs to group
    const groupRule = await prisma.groupRule.findFirst({
      where: { ruleId, groupId, isActive: true }
    })

    if (!groupRule) {
      return NextResponse.json({ 
        error: 'Scoring rule does not belong to this group' 
      }, { status: 400 })
    }

    // Use custom points if provided, otherwise use rule's default points
    const finalPoints = customPoints !== undefined ? customPoints : rule.points

    // Create score record for target user
    const scoreRecord = await prisma.scoreRecord.create({
      data: {
        userId: targetUserId,
        groupId,
        ruleId,
        points: finalPoints,
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
      action: ActivityType.SCORE_RECORDED,
      description: `Recorded ${finalPoints} points for ${scoreRecord.user.name || scoreRecord.user.email} using rule "${rule.name}"`,
      metadata: { 
        ruleName: rule.name, 
        points: finalPoints, 
        scoreRecordId: scoreRecord.id,
        targetUserId,
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

    // Build where clause (no permission restrictions - users can view all scores)
    const whereClause: any = {}

    if (groupId) {
      whereClause.groupId = groupId
    }

    if (userId) {
      whereClause.userId = userId
    }

    // Date filters
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
          },
          group: {
            select: { id: true, name: true }
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