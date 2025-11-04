import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-logger'
import { ActivityType } from '@/types'

// PUT endpoint for updating individual score records
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Chưa được xác thực' }, { status: 401 })
    }

    const { id, points, notes, recordedAt } = await request.json()

    if (!id) {
      return NextResponse.json({
        error: 'Cần cung cấp mã bản ghi điểm'
      }, { status: 400 })
    }

    // Get the existing score record
    const existingRecord = await prisma.scoreRecord.findUnique({
      where: { id },
      include: {
        group: {
          include: {
            members: {
              where: { userId: session.user.id }
            }
          }
        }
      }
    })

    if (!existingRecord) {
      return NextResponse.json({
        error: 'Không tìm thấy bản ghi điểm'
      }, { status: 404 })
    }

    // Verify current user is ADMIN/OWNER of the group
    const currentUserMember = existingRecord.group.members[0]
    if (!currentUserMember) {
      return NextResponse.json({
        error: 'Bạn không phải thành viên của nhóm này'
      }, { status: 403 })
    }

    if (!['OWNER', 'ADMIN'].includes(currentUserMember.role)) {
      return NextResponse.json({
        error: 'Chỉ quản trị viên hoặc chủ nhóm mới có thể chỉnh sửa bản ghi điểm'
      }, { status: 403 })
    }

    // Build update data
    const updateData: any = {}
    if (points !== undefined) {
      if (isNaN(parseFloat(points.toString()))) {
        return NextResponse.json({
          error: 'Điểm phải là một số hợp lệ'
        }, { status: 400 })
      }
      updateData.points = parseFloat(points)
    }
    if (notes !== undefined) {
      updateData.notes = notes.trim() || null
    }
    if (recordedAt !== undefined) {
      try {
        updateData.recordedAt = new Date(recordedAt)
      } catch (error) {
        return NextResponse.json({
          error: 'Định dạng ngày không hợp lệ'
        }, { status: 400 })
      }
    }

    // Update the score record
    const updatedRecord = await prisma.scoreRecord.update({
      where: { id },
      data: updateData,
      include: {
        rule: {
          select: { id: true, name: true, points: true }
        },
        group: {
          select: { id: true, name: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      groupId: existingRecord.groupId,
      action: ActivityType.SCORE_UPDATED,
      description: `Đã cập nhật bản ghi điểm cho ${updatedRecord.user.name || updatedRecord.user.email}: ${updateData.points || existingRecord.points} điểm`,
      metadata: {
        scoreRecordId: id,
        changes: updateData
      }
    })

    return NextResponse.json({ scoreRecord: updatedRecord })
  } catch (error) {
    console.error('Lỗi cập nhật bản ghi điểm:', error)
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Chưa được xác thực' }, { status: 401 })
    }

    const { groupId, ruleId, criteria, notes, targetUserId, points: customPoints, recordedAt } = await request.json()

    if (!groupId || !ruleId || !targetUserId) {
      return NextResponse.json({
        error: 'Cần cung cấp mã nhóm, mã quy tắc và mã người nhận điểm'
      }, { status: 400 })
    }

    // Verify current user is ADMIN/OWNER of this group
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          where: { userId: session.user.id }
        }
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'Không tìm thấy nhóm' }, { status: 404 })
    }

    const currentUserMember = group.members[0]
    if (!currentUserMember) {
      return NextResponse.json({
        error: 'Bạn không phải thành viên của nhóm này'
      }, { status: 403 })
    }

    // Only Group ADMINs can record scores
    if (!['OWNER', 'ADMIN'].includes(currentUserMember.role)) {
      return NextResponse.json({
        error: 'Chỉ quản trị viên hoặc chủ nhóm mới có thể ghi điểm'
      }, { status: 403 })
    }

    // Verify target user is in the group
    const targetMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: targetUserId,
          groupId
        }
      }
    })

    if (!targetMember) {
      return NextResponse.json({
        error: 'Người dùng mục tiêu không thuộc nhóm này'
      }, { status: 404 })
    }

    // Get the scoring rule
    const rule = await prisma.scoringRule.findUnique({
      where: { id: ruleId }
    })

    if (!rule || !rule.isActive) {
      return NextResponse.json({
        error: 'Không tìm thấy quy tắc chấm điểm hoặc quy tắc đang bị vô hiệu'
      }, { status: 404 })
    }

    // Verify rule belongs to group
    const groupRule = await prisma.groupRule.findFirst({
      where: { ruleId, groupId, isActive: true }
    })

    if (!groupRule) {
      return NextResponse.json({
        error: 'Quy tắc chấm điểm này không thuộc về nhóm'
      }, { status: 400 })
    }

    // Use custom points if provided, otherwise use rule's default points
    const finalPoints = customPoints !== undefined ? customPoints : rule.points

    // Create score record for target user
    const scoreRecord = await prisma.scoreRecord.create({
      data: {
        userId: targetUserId,
        groupId,
        ruleId,
        points: finalPoints,
        criteria: criteria || rule.criteria,
        notes: notes?.trim() || null,
        recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
      },
      include: {
        rule: {
          select: { id: true, name: true, points: true }
        },
        group: {
          select: { id: true, name: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      groupId,
      action: ActivityType.SCORE_RECORDED,
      description: `Đã ghi ${finalPoints} điểm cho ${scoreRecord.user.name || scoreRecord.user.email} bằng quy tắc "${rule.name}"`,
      metadata: {
        ruleName: rule.name,
        points: finalPoints,
        scoreRecordId: scoreRecord.id,
        targetUserId,
        criteria
      }
    })

    return NextResponse.json({ scoreRecord }, { status: 201 })
  } catch (error) {
    console.error('Lỗi ghi điểm:', error)
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Chưa được xác thực' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause (no permission restrictions - users can view all scores)
    const whereClause: any = {}

    if (groupId) {
      whereClause.groupId = groupId
    }

    if (userId) {
      whereClause.userId = userId
    }

    // Date filters
    if (startDate) {
      whereClause.recordedAt = { ...whereClause.recordedAt, gte: new Date(startDate) }
    }
    if (endDate) {
      whereClause.recordedAt = { ...whereClause.recordedAt, lte: new Date(endDate) }
    }

    const [scoreRecords, total] = await Promise.all([
      prisma.scoreRecord.findMany({
        where: whereClause,
        include: {
          rule: {
            select: { id: true, name: true, points: true }
          },
          user: {
            select: { id: true, name: true, email: true }
          },
          group: {
            select: { id: true, name: true }
          }
        },
        orderBy: { recordedAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.scoreRecord.count({ where: whereClause })
    ])

    return NextResponse.json({ 
      scoreRecords,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Lỗi tải bản ghi điểm:', error)
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 })
  }
}