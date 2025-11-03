import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-logger'
import { ActivityType } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const group = await prisma.group.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        members: {
          select: {
            id: true,
            userId: true,
            role: true,
            joinedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        groupRules: {
          include: {
            rule: true
          },
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            scoreRecords: true,
            groupRules: true
          }
        }
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Check if user has access to this group
    const hasAccess = group.createdById === session.user.id || 
                     group.members.some(member => member.userId === session.user.id)

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Transform groupRules to scoringRules for backward compatibility
    const groupWithScoringRules = {
      ...group,
      scoringRules: group.groupRules?.map(gr => gr.rule) || []
    }

    return NextResponse.json({ group: groupWithScoringRules })
  } catch (error) {
    console.error('Error fetching group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, isActive } = await request.json()

    // Check if user is the creator or admin
    const group = await prisma.group.findUnique({
      where: { id: params.id },
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

    const updatedGroup = await prisma.group.update({
      where: { id: params.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        members: {
          select: {
            id: true,
            userId: true,
            role: true,
            joinedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      groupId: updatedGroup.id,
      action: ActivityType.GROUP_UPDATED,
      description: `Updated group "${updatedGroup.name}"`,
      metadata: { changes: { name, description, isActive } }
    })

    return NextResponse.json({ group: updatedGroup })
  } catch (error) {
    console.error('Error updating group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is the creator
    const group = await prisma.group.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        createdById: true,
        _count: {
          select: {
            scoreRecords: true,
            groupRules: true
          }
        }
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    if (group.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Only the creator can delete the group' }, { status: 403 })
    }

    // Warn if group has data
    if (group._count.scoreRecords > 0 || group._count.groupRules > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete group with existing score records or scoring rules' 
      }, { status: 400 })
    }

    const deletedGroup = await prisma.group.delete({
      where: { id: params.id }
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: ActivityType.GROUP_DELETED,
      description: `Deleted group "${group.name}"`,
      metadata: { groupId: params.id, groupName: group.name }
    })

    return NextResponse.json({ message: 'Group deleted successfully' })
  } catch (error) {
    console.error('Error deleting group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}