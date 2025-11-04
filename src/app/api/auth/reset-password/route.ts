import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth.service'
import { resetPasswordRequestSchema } from '@/lib/validators/auth'
import { logPasswordResetRequested } from '@/lib/activity-logger'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const validationResult = resetPasswordRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dữ liệu không hợp lệ',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const { email } = validationResult.data

    // Check if user exists
    const userResult = await AuthService.findUserByEmail(email)
    
    // Always return success to prevent email enumeration
    const response = {
      success: true,
      message: 'Nếu tài khoản với email này tồn tại, một liên kết đặt lại mật khẩu đã được gửi.'
    }

    // If user exists, log the reset request and send email
    if (userResult.success) {
      const clientIP = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'unknown'
      
      await logPasswordResetRequested(
        userResult.data!.id,
        email,
        clientIP
      )
      
      // Generate a secure reset token
      const resetToken = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 3600000) // 1 hour from now

      // Store the reset token in the database
      await prisma.passwordResetToken.create({
        data: {
          userId: userResult.data!.id,
          token: resetToken,
          expiresAt
        }
      })

      // Send password reset email
      try {
        await sendPasswordResetEmail({
          to: email,
          resetToken
        })
        console.log(`Email đặt lại mật khẩu đã được gửi tới: ${email}`)
      } catch (emailError) {
        console.error('Gửi email đặt lại mật khẩu thất bại:', emailError)
        // Still return success to prevent enumeration
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Lỗi đặt lại mật khẩu:', error)
    
    // Always return success to prevent information leakage
    return NextResponse.json({
      success: true,
      message: 'Nếu tài khoản với email này tồn tại, một liên kết đặt lại mật khẩu đã được gửi.'
    })
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Endpoint đặt lại mật khẩu - gửi POST với email để yêu cầu đặt lại',
      requiredFields: {
        email: 'chuỗi (định dạng email hợp lệ)'
      }
    }
  )
}