import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-logger'
import { ActivityType } from '@/types'

// GET /api/groups/[id]/rules - Get rules available to a specific group
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const groupId = params.id

    // Verify group exists and user has access
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

    // Get rules available to this group
    const availableRules = await prisma.scoringRule.findMany({
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

    return NextResponse.json({ rules: availableRules })
  } catch (error) {
    console.error('Error fetching group rules:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/groups/[id]/rules - Add a rule to a specific group
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const groupId = params.id
    const { ruleId } = await request.json()

    if (!ruleId) {
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 })
    }

    // Verify user has admin/owner permissions for this group
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          where: { 
            userId: session.user.id,
            role: { in: ['OWNER', 'ADMIN'] }
          }
        }
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    if (group.members.length === 0) {
      return NextResponse.json({ 
        error: 'Admin/Owner access required to manage group rules' 
      }, { status: 403 })
    }

    // Verify rule exists and is active
    const rule = await prisma.scoringRule.findUnique({
      where: { id: ruleId }
    })

    if (!rule) {
      return NextResponse.json({ error: 'Scoring rule not found' }, { status: 404 })
    }

    if (!rule.isActive) {
      return NextResponse.json({ error: 'Cannot add inactive rule to group' }, { status: 400 })
    }

    // Check if rule is already available to this group
    const existingGroupRule = await prisma.groupRule.findUnique({
      where: {
        groupId_ruleId: {
          groupId,
          ruleId
        }
      }
    })

    if (existingGroupRule) {
      if (existingGroupRule.isActive) {
        return NextResponse.json({ 
          error: 'Rule is already available to this group' 
        }, { status: 400 })
      } else {
        // Reactivate the rule if it was previously removed
        const reactivatedGroupRule = await prisma.groupRule.update({
          where: {
            groupId_ruleId: {
              groupId,
              ruleId
            }
          },
          data: { isActive: true }
        })
        
        // Log activity
        await logActivity({
          userId: session.user.id,
          action: ActivityType.RULE_ADDED_TO_GROUP,
          description: `Reactivated scoring rule "${rule.name}" for group "${group.name}"`,
          metadata: { 
            groupId, 
            ruleId, 
            groupName: group.name, 
            ruleName: rule.name 
          }
        })

        return NextResponse.json({ 
          groupRule: reactivatedGroupRule,
          message: 'Rule reactivated for group'
        })
      }
    }

    // Create new group-rule association
    const groupRule = await prisma.groupRule.create({
      data: {
        groupId,
        ruleId,
        isActive: true
      }
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: ActivityType.RULE_ADDED_TO_GROUP,
      description: `Added scoring rule "${rule.name}" to group "${group.name}"`,
      metadata: { 
        groupId, 
        ruleId, 
        groupName: group.name, 
        ruleName: rule.name 
      }
    })

    return NextResponse.json({ groupRule }, { status: 201 })
  } catch (error) {
    console.error('Error adding rule to group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/groups/[id]/rules - Remove a rule from a specific group
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const groupId = params.id
    const { searchParams } = new URL(request.url)
    const ruleId = searchParams.get('ruleId')

    if (!ruleId) {
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 })
    }

    // Verify user has admin/owner permissions for this group
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          where: { 
            userId: session.user.id,
            role: { in: ['OWNER', 'ADMIN'] }
          }
        }
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    if (group.members.length === 0) {
      return NextResponse.json({ 
        error: 'Admin/Owner access required to manage group rules' 
      }, { status: 403 })
    }

    // Verify rule exists
    const rule = await prisma.scoringRule.findUnique({
      where: { id: ruleId }
    })

    if (!rule) {
      return NextResponse.json({ error: 'Scoring rule not found' }, { status: 404 })
    }

    // Check if rule is currently available to this group
    const existingGroupRule = await prisma.groupRule.findUnique({
      where: {
        groupId_ruleId: {
          groupId,
          ruleId
        }
      }
    })

    if (!existingGroupRule) {
      return NextResponse.json({ error: 'Rule is not available to this group' }, { status: 400 })
    }

    if (!existingGroupRule.isActive) {
      return NextResponse.json({ error: 'Rule is already unavailable to this group' }, { status: 400 })
    }

    // Deactivate the rule for this group (soft delete)
    await prisma.groupRule.update({
      where: {
        groupId_ruleId: {
          groupId,
          ruleId
        }
      },
      data: { isActive: false }
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: ActivityType.RULE_REMOVED_FROM_GROUP,
      description: `Removed scoring rule "${rule.name}" from group "${group.name}"`,
      metadata: { 
        groupId, 
        ruleId, 
        groupName: group.name, 
        ruleName: rule.name 
      }
    })

    return NextResponse.json({ 
      message: 'Rule removed from group successfully' 
    })
  } catch (error) {
    console.error('Error removing rule from group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
