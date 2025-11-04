import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-logger'
import { ActivityType } from '@/types'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Chưa được xác thực' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { currentPassword, newPassword } = body

    // Validation
    if (!currentPassword || typeof currentPassword !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Mật khẩu hiện tại là bắt buộc' },
        { status: 400 }
      )
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Mật khẩu mới là bắt buộc' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Mật khẩu mới phải có ít nhất 8 ký tự' },
        { status: 400 }
      )
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        password: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy người dùng' },
        { status: 404 }
      )
    }

    // Check if user has a password (not OAuth user)
    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Không thể đổi mật khẩu cho tài khoản đăng nhập bằng OAuth',
        },
        { status: 400 }
      )
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      // Log failed attempt
      await logActivity({
        userId: session.user.id,
        action: ActivityType.LOGIN_FAILED,
        description: 'Đổi mật khẩu thất bại - mật khẩu hiện tại không chính xác',
        metadata: {
          reason: 'Mật khẩu hiện tại không hợp lệ',
        },
      })

      return NextResponse.json(
        { success: false, message: 'Mật khẩu hiện tại không chính xác' },
        { status: 401 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    })

    // Log successful password change
    await logActivity({
      userId: session.user.id,
      action: ActivityType.PASSWORD_RESET_COMPLETED,
      description: 'Người dùng đã đổi mật khẩu thành công',
      metadata: {
        timestamp: new Date().toISOString(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Đổi mật khẩu thành công',
    })
  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Không thể đổi mật khẩu',
      },
      { status: 500 }
    )
  }
}
