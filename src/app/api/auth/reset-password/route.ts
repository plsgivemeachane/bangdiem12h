import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth.service'
import { resetPasswordRequestSchema } from '@/lib/validators/auth'
import { logPasswordResetRequested } from '@/lib/activity-logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const validationResult = resetPasswordRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
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
      message: 'If an account with that email exists, a password reset link has been sent.'
    }

    // If user exists, log the reset request
    if (userResult.success) {
      const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
      
      await logPasswordResetRequested(
        userResult.data!.id, 
        email, 
        clientIP
      )
      
      // TODO: Send actual password reset email
      // For now, just log the request
      console.log(`Password reset requested for: ${email} (IP: ${clientIP})`)
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Password reset error:', error)
    
    // Always return success to prevent information leakage
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    })
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Password reset endpoint - POST with email to request reset',
      requiredFields: {
        email: 'string (valid email format)'
      }
    }
  )
}