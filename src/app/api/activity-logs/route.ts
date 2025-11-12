import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ActivityType } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Chưa được xác thực' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const skip = (page - 1) * limit

    // Build filters - all authenticated users can view all activity logs
    const filters: any = {}

    // Apply group filter
    if (groupId) {
      filters.groupId = groupId
    }

    // Apply action filter
    if (action) {
      filters.action = action
    }

    // Apply user filter
    if (userId) {
      filters.userId = userId
    }

    // Apply date filters
    if (startDate) {
      filters.timestamp = {
        ...filters.timestamp,
        gte: new Date(startDate)
      }
    }
    if (endDate) {
      filters.timestamp = {
        ...filters.timestamp,
        lte: new Date(endDate + 'T23:59:59.999Z')
      }
    }

    // Get activity logs with pagination
    const [activityLogs, totalCount] = await Promise.all([
      prisma.activityLog.findMany({
        where: filters,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          group: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.activityLog.count({
        where: filters
      })
    ])

    // Format the response
    const formattedLogs = activityLogs.map(log => ({
      id: log.id,
      action: log.action,
      description: log.description,
      metadata: log.metadata,
      timestamp: log.timestamp,
      user: log.user ? {
        id: log.user.id,
        name: log.user.name,
        email: log.user.email
      } : null,
      group: log.group ? {
        id: log.group.id,
        name: log.group.name
      } : null
    }))

    return NextResponse.json({
      activityLogs: formattedLogs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: skip + limit < totalCount,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Không thể tải nhật ký hoạt động:', error)
    return NextResponse.json(
      { error: 'Không thể tải nhật ký hoạt động' },
      { status: 500 }
    )
  }
}

async function getUserGroupIds(userId: string): Promise<string[]> {
  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    select: { groupId: true }
  })
  return memberships.map(m => m.groupId)
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Chưa được xác thực' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { groupId, action, description, metadata } = body

    // Validate required fields
    if (!action || !description) {
      return NextResponse.json(
        { error: 'Cần cung cấp hành động và mô tả' },
        { status: 400 }
      )
    }

    // If groupId is provided, verify user has access to the group
    if (groupId) {
      const membership = await prisma.groupMember.findFirst({
        where: {
          groupId,
          userId: session.user.id
        }
      })

      if (!membership && session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Không có quyền truy cập nhóm này' },
          { status: 403 }
        )
      }
    }

    // Create activity log
    const activityLog = await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        groupId: groupId || null,
        action: action as ActivityType,
        description,
        metadata: metadata || undefined
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        group: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(activityLog)

  } catch (error) {
    console.error('Không thể tạo nhật ký hoạt động:', error)
    return NextResponse.json(
      { error: 'Không thể tạo nhật ký hoạt động' },
      { status: 500 }
    )
  }
}
