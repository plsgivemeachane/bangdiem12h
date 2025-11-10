import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-logger'
import { ActivityType } from '@/types'
import { API } from '@/lib/translations'

// PUT endpoint for updating individual scoring rules
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: API.ERROR.UNAUTHORIZED }, { status: 401 })
    }

    const { id, name, description, criteria, points, isActive } = await request.json()

    if (!id) {
      return NextResponse.json({
        error: API.ERROR.NEED_RULE_ID
      }, { status: 400 })
    }

    // Get the existing rule
    const existingRule = await prisma.scoringRule.findUnique({
      where: { id }
    })

    if (!existingRule) {
      return NextResponse.json({
        error: API.ERROR.RULE_NOT_FOUND
      }, { status: 404 })
    }

    // Build update data
    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description.trim() || null
    if (criteria !== undefined) updateData.criteria = criteria
    if (points !== undefined) {
      if (isNaN(parseInt(points.toString()))) {
        return NextResponse.json({
          error: API.ERROR.INVALID_POINTS
        }, { status: 400 })
      }
      updateData.points = parseInt(points)
    }
    if (isActive !== undefined) updateData.isActive = isActive

    // Check if name is being changed and if it would conflict
    if (updateData.name && updateData.name !== existingRule.name) {
      const existingWithName = await prisma.scoringRule.findFirst({
        where: {
          name: updateData.name,
          id: { not: id }
        }
      })

      if (existingWithName) {
        return NextResponse.json({
          error: API.ERROR.NAME_EXISTS
        }, { status: 400 })
      }
    }

    // Update the rule
    const updatedRule = await prisma.scoringRule.update({
      where: { id },
      data: updateData
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: ActivityType.SCORING_RULE_UPDATED,
      description: API.SUCCESS.RULE_UPDATED.replace('{ruleName}', updatedRule.name),
      metadata: {
        ruleId: id,
        changes: updateData
      }
    })

    return NextResponse.json({ scoringRule: updatedRule })
  } catch (error) {
    console.error('API Error - Update scoring rule:', error)
    return NextResponse.json({ error: API.ERROR.INTERNAL_SERVER_ERROR }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: API.ERROR.UNAUTHORIZED }, { status: 401 })
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
    console.error('API Error - Load scoring rules:', error)
    return NextResponse.json({ error: API.ERROR.INTERNAL_SERVER_ERROR }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: API.ERROR.UNAUTHORIZED }, { status: 401 })
    }

    const { name, description, criteria, points, groupId } = await request.json()

    if (!name || criteria === undefined || points === undefined) {
      return NextResponse.json({
        error: API.INFO.RULE_NAME_REQUIRED
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
        return NextResponse.json({ error: API.ERROR.GROUP_NOT_FOUND }, { status: 404 })
      }

      const member = group.members[0]
      if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
        return NextResponse.json({
          error: API.ERROR.ONLY_ADMIN_OWNER_MANAGE_RULES
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
          error: API.ERROR.NAME_EXISTS_IN_GROUP
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
        description: API.SUCCESS.RULE_CREATED.replace('{ruleName}', scoringRule.name).replace('{groupName}', group.name),
        metadata: { ruleName: scoringRule.name, points: scoringRule.points, criteria }
      })

      return NextResponse.json({ scoringRule }, { status: 201 })
    }

    // CASE 2: Global rule - System ADMIN only
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({
        error: API.ERROR.ONLY_ADMIN_CREATE_RULE
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
        error: API.ERROR.NAME_EXISTS_SYSTEM
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
      description: API.SUCCESS.RULE_CREATED_GLOBAL.replace('{ruleName}', scoringRule.name).replace('{points}', String(scoringRule.points)),
      metadata: { ruleName: scoringRule.name, points: scoringRule.points, criteria }
    })

    return NextResponse.json({ scoringRule }, { status: 201 })
  } catch (error) {
    console.error('API Error - Create scoring rule:', error)
    return NextResponse.json({ error: API.ERROR.INTERNAL_SERVER_ERROR }, { status: 500 })
  }
}