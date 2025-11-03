import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/middleware/auth.middleware'
import { prisma } from '@/lib/prisma'
import { hashPassword, validatePasswordStrength, isCommonPassword } from '@/lib/utils/password'
import { logAdminUserCreated } from '@/lib/activity-logger'
import { UserRole } from '@/generated/prisma'

// GET /api/admin/users - List all users with pagination and filtering
export async function GET(request: NextRequest) {
  const authReq = await requireAdmin()
  if (!authReq) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const roleFilter = searchParams.get('role') as UserRole | null

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (roleFilter && (roleFilter === 'USER' || roleFilter === 'ADMIN')) {
      where.role = roleFilter
    }

    // Get total count
    const total = await prisma.user.count({ where })

    // Get users
    const users = await prisma.user.findMany({
      where,
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
            scoreRecords: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    // Get role stats
    const roleStats = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    })

    const stats = {
      total,
      admins: roleStats.find(r => r.role === 'ADMIN')?._count || 0,
      users: roleStats.find(r => r.role === 'USER')?._count || 0
    }

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total
      },
      stats
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  const authReq = await requireAdmin()
  if (!authReq) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { email, name, password, role } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Validate password strength
    const validation = validatePasswordStrength(password)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Password does not meet requirements', details: validation.errors },
        { status: 400 }
      )
    }

    // Check if password is common
    if (isCommonPassword(password)) {
      return NextResponse.json(
        { error: 'This password is too common. Please choose a more secure password.' },
        { status: 400 }
      )
    }

    // Validate role
    const userRole = role && (role === 'USER' || role === 'ADMIN') ? role : 'USER'

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
        role: userRole
      },
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

    // Log activity
    await logAdminUserCreated(user.id, {
      email: user.email,
      name: user.name || '',
      createdBy: authReq.user.id
    })

    return NextResponse.json({
      success: true,
      user
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
