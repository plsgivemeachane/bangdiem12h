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
          error: 'Xác thực dữ liệu thất bại',
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
        message: 'Đăng ký người dùng thành công',
        user: userData
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'DatabaseError') {
        return NextResponse.json(
          {
            success: false,
            error: 'Đăng ký thất bại. Vui lòng thử lại sau.'
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Đăng ký thất bại. Vui lòng thử lại.'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Endpoint đăng ký - gửi POST với name, email và password để đăng ký',
      requiredFields: {
        name: 'chuỗi (tối thiểu 1, tối đa 100 ký tự)',
        email: 'chuỗi (định dạng email hợp lệ)',
        password: 'chuỗi (tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt)'
      }
    }
  )
}