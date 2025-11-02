import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth.service'
import { registerSchema } from '@/lib/validators/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const validationResult = registerSchema.safeParse(body)
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

    const { name, email, password } = validationResult.data

    // Create user via AuthService
    const result = await AuthService.createUser({
      name,
      email,
      password
    })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error
        },
        { status: 400 }
      )
    }

    // Return success response without password
    const { ...userData } = result.data!
    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        user: userData
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Database')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Registration failed. Please try again later.'
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Registration failed. Please try again.'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Registration endpoint - POST with name, email, and password to register',
      requiredFields: {
        name: 'string (min 1, max 100 chars)',
        email: 'string (valid email format)',
        password: 'string (min 8 chars, uppercase, lowercase, numbers, special chars)'
      }
    }
  )
}