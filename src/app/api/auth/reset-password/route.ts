import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // This endpoint is disabled as password resets are admin-only
    return NextResponse.json(
      {
        success: false,
        error: 'Chức năng đặt lại mật khẩu đã bị vô hiệu hóa',
        message: 'Để đặt lại mật khẩu, vui lòng liên hệ với quản trị viên hệ thống.'
      },
      { status: 410 } // 410 Gone - indicates the service is no longer available
    )
  } catch (error) {
    console.error('Lỗi endpoint đặt lại mật khẩu:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Lỗi hệ thống',
        message: 'Chức năng đặt lại mật khẩu đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.'
      },
      { status: 500 }
    )
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