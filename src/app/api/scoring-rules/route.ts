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

    const { groupId, name, description, criteria, points } = await request.json()

    if (!groupId || !name || criteria === undefined || points === undefined) {
      return NextResponse.json({ 
        error: 'Group ID, name, criteria, and points are required' 
      }, { status: 400 })
    }

    // Verify user has admin permissions for this group
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

    const userMember = group.members[0]
    if (!userMember || (userMember.role !== 'OWNER' && userMember.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check for duplicate rules with same name in the group
    const existingRule = await prisma.scoringRule.findFirst({
      where: {
        groupId,
        name: name.trim()
      }
    })

    if (existingRule) {
      return NextResponse.json({ 
        error: 'A scoring rule with this name already exists in the group' 
      }, { status: 400 })
    }

    const scoringRule = await prisma.scoringRule.create({
      data: {
        groupId,
        name: name.trim(),
        description: description?.trim() || null,
        criteria,
        points: parseInt(points),
      },
      include: {
        group: {
          select: { id: true, name: true }
        }
      }
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      groupId,
      action: 'SCORING_RULE_CREATED',
      description: `Created scoring rule "${scoringRule.name}" with ${scoringRule.points} points`,
      metadata: { ruleName: scoringRule.name, points: scoringRule.points, criteria }
    })

    return NextResponse.json({ scoringRule }, { status: 201 })
  } catch (error) {
    console.error('Error creating scoring rule:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}