import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-logger'
import { GroupRole, ActivityType } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has access to this group
    const group = await prisma.group.findUnique({
      where: { id: params.id },
      include: {
        members: {
          include: {
            user: {
              select: { 
                id: true, 
                name: true, 
                email: true,
                createdAt: true
              }
            }
          }
        }
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const hasAccess = group.createdById === session.user.id || 
                     group.members.some(member => member.userId === session.user.id)

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ 
      members: group.members.map(member => ({
        ...member,
        user: {
          ...member.user,
          // Don't expose sensitive info
          password: undefined
        }
      }))
    })
  } catch (error) {
    console.error('Error fetching group members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, role = GroupRole.MEMBER } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Verify user has admin permissions for this group
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

    // Find the user to add
    const userToAdd = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { 
        id: true, 
        name: true, 
        email: true,
        role: true 
      }
    })

    if (!userToAdd) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is already a member
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: userToAdd.id,
          groupId: params.id
        }
      }
    })

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member of this group' }, { status: 400 })
    }

    // Create the group member
    const groupMember = await prisma.groupMember.create({
      data: {
        userId: userToAdd.id,
        groupId: params.id,
        role: role as GroupRole
      },
      include: {
        user: {
          select: { 
            id: true, 
            name: true, 
            email: true,
            role: true,
            createdAt: true
          }
        }
      }
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      groupId: params.id,
      action: ActivityType.MEMBER_INVITED,
      description: `Added ${userToAdd.email} as ${role} to group "${group.name}"`,
      metadata: { 
        memberEmail: userToAdd.email, 
        memberId: userToAdd.id,
        role: role 
      }
    })

    return NextResponse.json({ 
      member: {
        ...groupMember,
        user: {
          ...groupMember.user,
          // Don't expose sensitive info
          password: undefined
        }
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error adding group member:', error)
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

    const { memberId, role } = await request.json()

    if (!memberId || !role) {
      return NextResponse.json({ error: 'Member ID and role are required' }, { status: 400 })
    }

    // Verify user has admin permissions for this group
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

    // Update member role
    const updatedMember = await prisma.groupMember.update({
      where: { id: memberId },
      data: { role: role as GroupRole },
      include: {
        user: {
          select: { 
            id: true, 
            name: true, 
            email: true,
            role: true,
            createdAt: true
          }
        }
      }
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      groupId: params.id,
      action: ActivityType.SCORING_RULE_UPDATED,
      description: `Updated ${updatedMember.user.email} role to ${role} in group "${group.name}"`,
      metadata: { 
        memberId: updatedMember.id,
        memberEmail: updatedMember.user.email,
        newRole: role 
      }
    })

    return NextResponse.json({ 
      member: {
        ...updatedMember,
        user: {
          ...updatedMember.user,
          // Don't expose sensitive info
          password: undefined
        }
      }
    })
  } catch (error) {
    console.error('Error updating group member:', error)
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

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    // Verify user has admin permissions for this group
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

    // Get the member to be removed
    const memberToRemove = await prisma.groupMember.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: { 
            id: true, 
            name: true, 
            email: true
          }
        }
      }
    })

    if (!memberToRemove) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Don't allow removing the group owner
    if (memberToRemove.role === 'OWNER') {
      return NextResponse.json({ error: 'Cannot remove group owner' }, { status: 403 })
    }

    // Remove the member
    await prisma.groupMember.delete({
      where: { id: memberId }
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      groupId: params.id,
      action: ActivityType.MEMBER_REMOVED,
      description: `Removed ${memberToRemove.user.email} from group "${group.name}"`,
      metadata: { 
        removedMemberId: memberToRemove.id,
        removedMemberEmail: memberToRemove.user.email
      }
    })

    return NextResponse.json({ message: 'Member removed successfully' })
  } catch (error) {
    console.error('Error removing group member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
