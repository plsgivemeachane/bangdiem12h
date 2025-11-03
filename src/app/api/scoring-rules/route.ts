import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-logger'
import { ActivityType } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId') // Optional: filter rules for a specific group

    // No permission check - all users can view all rules
    let scoringRules

    if (groupId) {
      // Get rules for a specific group (through GroupRule junction table)
      scoringRules = await prisma.scoringRule.findMany({
        where: {
          AND: [
            { isActive: true },
            {
              groupRules: {
                some: {
                  groupId,
                  isActive: true
                }
              }
            }
          ]
        },
        include: {
          groupRules: {
            where: { groupId }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // Get all active rules
      scoringRules = await prisma.scoringRule.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json({ scoringRules })
  } catch (error) {
    console.error('Error fetching scoring rules:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, criteria, points, groupId } = await request.json()

    if (!name || criteria === undefined || points === undefined) {
      return NextResponse.json({ 
        error: 'Name, criteria, and points are required' 
      }, { status: 400 })
    }

    // CASE 1: Group-scoped rule (NEW feature)
    if (groupId) {
      // Verify user is ADMIN/OWNER of the group
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

      const member = group.members[0]
      if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
        return NextResponse.json({ 
          error: 'Only group administrators can create rules for this group' 
        }, { status: 403 })
      }

      // Check for duplicate rule name within the group
      const existingGroupRule = await prisma.groupRule.findFirst({
        where: {
          groupId,
          rule: {
            name: name.trim()
          }
        },
        include: { rule: true }
      })

      if (existingGroupRule) {
        return NextResponse.json({ 
          error: 'A rule with this name already exists in this group' 
        }, { status: 400 })
      }

      // Create the rule and auto-assign to the group
      const scoringRule = await prisma.scoringRule.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          criteria,
          points: parseInt(points),
        }
      })

      // Create group-rule association
      await prisma.groupRule.create({
        data: {
          groupId,
          ruleId: scoringRule.id,
          isActive: true
        }
      })

      // Log activity
      await logActivity({
        userId: session.user.id,
        groupId,
        action: ActivityType.SCORING_RULE_CREATED,
        description: `Created scoring rule "${scoringRule.name}" for group "${group.name}"`,
        metadata: { ruleName: scoringRule.name, points: scoringRule.points, criteria }
      })

      return NextResponse.json({ scoringRule }, { status: 201 })
    }

    // CASE 2: Global rule - System ADMIN only
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Admin access required to create global rules' 
      }, { status: 403 })
    }

    // Check for duplicate global rule names
    const existingRule = await prisma.scoringRule.findFirst({
      where: {
        name: name.trim()
      }
    })

    if (existingRule) {
      return NextResponse.json({ 
        error: 'A scoring rule with this name already exists globally' 
      }, { status: 400 })
    }

    const scoringRule = await prisma.scoringRule.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        criteria,
        points: parseInt(points),
      }
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: ActivityType.SCORING_RULE_CREATED,
      description: `Created global scoring rule "${scoringRule.name}" with ${scoringRule.points} points`,
      metadata: { ruleName: scoringRule.name, points: scoringRule.points, criteria }
    })

    return NextResponse.json({ scoringRule }, { status: 201 })
  } catch (error) {
    console.error('Error creating scoring rule:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}