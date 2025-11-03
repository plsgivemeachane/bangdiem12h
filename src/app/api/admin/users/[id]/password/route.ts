import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/middleware/auth.middleware'
import { prisma } from '@/lib/prisma'
import { hashPassword, validatePasswordStrength, isCommonPassword } from '@/lib/utils/password'
import { ActivityType } from '../../../../../../../node_modules/.prisma/client'

// PUT /api/admin/users/[id]/password - Reset user password
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authReq = await requireAdmin()
  if (!authReq) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { newPassword } = body

    if (!newPassword) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, email: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Validate password strength
    const validation = validatePasswordStrength(newPassword)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Password does not meet requirements', details: validation.errors },
        { status: 400 }
      )
    }

    // Check if password is common
    if (isCommonPassword(newPassword)) {
      return NextResponse.json(
        { error: 'This password is too common. Please choose a more secure password.' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update user password
    await prisma.user.update({
      where: { id: params.id },
      data: { password: hashedPassword }
    })

    // Log password reset
    await prisma.activityLog.create({
      data: {
        userId: params.id,
        action: ActivityType.ADMIN_PASSWORD_RESET_BY_ADMIN,
        description: `Password reset by admin ${authReq.user.email} for user ${user.email}`,
        metadata: {
          resetBy: authReq.user.id,
          resetByEmail: authReq.user.email,
          targetUser: {
            id: user.id,
            email: user.email,
            name: user.name
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    })
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}
