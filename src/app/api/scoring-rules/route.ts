import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-logger'
import { ActivityType } from '@/types'

// PUT endpoint for updating individual scoring rules
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Chưa được xác thực' }, { status: 401 })
    }

    const { id, name, description, criteria, points, isActive } = await request.json()

    if (!id) {
      return NextResponse.json({
        error: 'Cần cung cấp mã quy tắc'
      }, { status: 400 })
    }

    // Get the existing rule
    const existingRule = await prisma.scoringRule.findUnique({
      where: { id }
    })

    if (!existingRule) {
      return NextResponse.json({
        error: 'Không tìm thấy quy tắc chấm điểm'
      }, { status: 404 })
    }

    // Build update data
    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description.trim() || null
    if (criteria !== undefined) updateData.criteria = criteria
    if (points !== undefined) {
      if (isNaN(parseInt(points.toString()))) {
        return NextResponse.json({
          error: 'Điểm phải là một số hợp lệ'
        }, { status: 400 })
      }
      updateData.points = parseInt(points)
    }
    if (isActive !== undefined) updateData.isActive = isActive

    // Check if name is being changed and if it would conflict
    if (updateData.name && updateData.name !== existingRule.name) {
      const existingWithName = await prisma.scoringRule.findFirst({
        where: {
          name: updateData.name,
          id: { not: id }
        }
      })

      if (existingWithName) {
        return NextResponse.json({
          error: 'Tên quy tắc này đã tồn tại'
        }, { status: 400 })
      }
    }

    // Update the rule
    const updatedRule = await prisma.scoringRule.update({
      where: { id },
      data: updateData
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: ActivityType.SCORING_RULE_UPDATED,
      description: `Đã cập nhật quy tắc chấm điểm "${updatedRule.name}"`,
      metadata: {
        ruleId: id,
        changes: updateData
      }
    })

    return NextResponse.json({ scoringRule: updatedRule })
  } catch (error) {
    console.error('Lỗi cập nhật quy tắc chấm điểm:', error)
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
    const groupId = searchParams.get('groupId') // Optional: filter rules for a specific group

    // No permission check - all users can view all rules
    let scoringRules

    if (groupId) {
      // Get rules for a specific group (through GroupRule junction table)
      scoringRules = await prisma.scoringRule.findMany({
        where: {
          AND: [
            { isActive: true },
            {
              groupRules: {
                some: {
                  groupId,
                  isActive: true
                }
              }
            }
          ]
        },
        include: {
          groupRules: {
            where: { groupId }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // Get all active rules
      scoringRules = await prisma.scoringRule.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json({ scoringRules })
  } catch (error) {
    console.error('Lỗi tải quy tắc chấm điểm:', error)
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Chưa được xác thực' }, { status: 401 })
    }

    const { name, description, criteria, points, groupId } = await request.json()

    if (!name || criteria === undefined || points === undefined) {
      return NextResponse.json({
        error: 'Cần cung cấp tên, tiêu chí và điểm'
      }, { status: 400 })
    }

    // CASE 1: Group-scoped rule (NEW feature)
    if (groupId) {
      // Verify user is ADMIN/OWNER of the group
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

      const member = group.members[0]
      if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
        return NextResponse.json({
          error: 'Chỉ quản trị viên hoặc chủ nhóm mới có thể tạo quy tắc cho nhóm này'
        }, { status: 403 })
      }

      // Check for duplicate rule name within the group
      const existingGroupRule = await prisma.groupRule.findFirst({
        where: {
          groupId,
          rule: {
            name: name.trim()
          }
        },
        include: { rule: true }
      })

      if (existingGroupRule) {
        return NextResponse.json({
          error: 'Tên quy tắc này đã tồn tại trong nhóm'
        }, { status: 400 })
      }

      // Create the rule and auto-assign to the group
      const scoringRule = await prisma.scoringRule.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          criteria,
          points: parseInt(points),
        }
      })

      // Create group-rule association
      await prisma.groupRule.create({
        data: {
          groupId,
          ruleId: scoringRule.id,
          isActive: true
        }
      })

      // Log activity
      await logActivity({
        userId: session.user.id,
        groupId,
        action: ActivityType.SCORING_RULE_CREATED,
        description: `Đã tạo quy tắc chấm điểm "${scoringRule.name}" cho nhóm "${group.name}"`,
        metadata: { ruleName: scoringRule.name, points: scoringRule.points, criteria }
      })

      return NextResponse.json({ scoringRule }, { status: 201 })
    }

    // CASE 2: Global rule - System ADMIN only
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({
        error: 'Cần quyền quản trị viên để tạo quy tắc toàn cục'
      }, { status: 403 })
    }

    // Check for duplicate global rule names
    const existingRule = await prisma.scoringRule.findFirst({
      where: {
        name: name.trim()
      }
    })

    if (existingRule) {
      return NextResponse.json({
        error: 'Tên quy tắc này đã tồn tại trên toàn hệ thống'
      }, { status: 400 })
    }

    const scoringRule = await prisma.scoringRule.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        criteria,
        points: parseInt(points),
      }
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: ActivityType.SCORING_RULE_CREATED,
      description: `Đã tạo quy tắc chấm điểm toàn cục "${scoringRule.name}" với ${scoringRule.points} điểm`,
      metadata: { ruleName: scoringRule.name, points: scoringRule.points, criteria }
    })

    return NextResponse.json({ scoringRule }, { status: 201 })
  } catch (error) {
    console.error('Lỗi tạo quy tắc chấm điểm:', error)
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 })
  }
}