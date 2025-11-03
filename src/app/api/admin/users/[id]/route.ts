import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/middleware/auth.middleware'
import { prisma } from '@/lib/prisma'
import { UserRole, ActivityType } from '../../../../../../node_modules/.prisma/client'

// GET /api/admin/users/[id] - Get single user details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authReq = await requireAdmin()
  if (!authReq) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        image: true,
        _count: {
          select: {
            groups: true,
            groupMemberships: true,
            scoreRecords: true,
            activityLogs: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/users/[id] - Update user details and role
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authReq = await requireAdmin()
  if (!authReq) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { name, email, role } = body

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, email: true, name: true, role: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent admin from updating their own role
    if (params.id === authReq.user.id && role && role !== currentUser.role) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      )
    }

    // If changing role from ADMIN to USER, check if this is the last admin
    if (currentUser.role === 'ADMIN' && role === 'USER') {
      const adminCount = await prisma.user.count({
        where: { role: UserRole.ADMIN }
      })

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot demote the last admin. Promote another user to admin first.' },
          { status: 400 }
        )
      }
    }

    // Check if email is already taken by another user
    if (email && email !== currentUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser && existingUser.id !== params.id) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        )
      }
    }

    // Validate role if provided
    if (role && role !== 'USER' && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Invalid role. Must be USER or ADMIN' },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (role !== undefined) updateData.role = role

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        image: true
      }
    })

    // Log role change if role was updated
    if (role && role !== currentUser.role) {
      await prisma.activityLog.create({
        data: {
          userId: params.id,
          action: ActivityType.ADMIN_USER_ROLE_UPDATED,
          description: `User role updated from ${currentUser.role} to ${role} by admin ${authReq.user.email}`,
          metadata: {
            previousRole: currentUser.role,
            newRole: role,
            updatedBy: authReq.user.id,
            updatedByEmail: authReq.user.email
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      user: updatedUser
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authReq = await requireAdmin()
  if (!authReq) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    // Prevent admin from deleting themselves
    if (params.id === authReq.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Get user to check if they're an admin
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, email: true, name: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If deleting an admin, check if this is the last admin
    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: UserRole.ADMIN }
      })

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last admin' },
          { status: 400 }
        )
      }
    }

    // Log deletion before deleting
    await prisma.activityLog.create({
      data: {
        userId: params.id,
        action: ActivityType.ADMIN_USER_DELETED,
        description: `User ${user.email} (${user.name || 'No name'}) deleted by admin ${authReq.user.email}`,
        metadata: {
          deletedUser: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          deletedBy: authReq.user.id,
          deletedByEmail: authReq.user.email
        }
      }
    })

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
