import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-logger'
import { ActivityType } from '@/types'

// GET /api/groups/[id]/rules - Get rules available to a specific group
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Chưa được xác thực' }, { status: 401 })
    }

    const groupId = params.id

    // Verify group exists and user has access
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

    // No access check for viewing - all users can view all groups

    // Get rules available to this group
    const availableRules = await prisma.scoringRule.findMany({
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

    return NextResponse.json({ rules: availableRules })
  } catch (error) {
    console.error('Lỗi tải quy tắc nhóm:', error)
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 })
  }
}

// POST /api/groups/[id]/rules - Add a rule to a specific group
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Chưa được xác thực' }, { status: 401 })
    }

    const groupId = params.id
    const { ruleId } = await request.json()

    if (!ruleId) {
      return NextResponse.json({ error: 'Cần cung cấp mã quy tắc' }, { status: 400 })
    }

    // Verify user has admin/owner permissions for this group
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

    const userMember = group.members[0]
    if (!userMember || !['OWNER', 'ADMIN'].includes(userMember.role)) {
      return NextResponse.json({ 
        error: 'Chỉ chủ nhóm hoặc quản trị viên mới có thể quản lý quy tắc' 
      }, { status: 403 })
    }

    // Verify rule exists and is active
    const rule = await prisma.scoringRule.findUnique({
      where: { id: ruleId }
    })

    if (!rule) {
      return NextResponse.json({ error: 'Không tìm thấy quy tắc chấm điểm' }, { status: 404 })
    }

    if (!rule.isActive) {
      return NextResponse.json({ error: 'Không thể thêm quy tắc đang bị vô hiệu hóa vào nhóm' }, { status: 400 })
    }

    // Check if rule is already available to this group
    const existingGroupRule = await prisma.groupRule.findUnique({
      where: {
        groupId_ruleId: {
          groupId,
          ruleId
        }
      }
    })

    if (existingGroupRule) {
      if (existingGroupRule.isActive) {
        return NextResponse.json({ 
          error: 'Quy tắc đã có sẵn cho nhóm này' 
        }, { status: 400 })
      } else {
        // Reactivate the rule if it was previously removed
        const reactivatedGroupRule = await prisma.groupRule.update({
          where: {
            groupId_ruleId: {
              groupId,
              ruleId
            }
          },
          data: { isActive: true }
        })
        
        // Log activity
        await logActivity({
          userId: session.user.id,
          action: ActivityType.RULE_ADDED_TO_GROUP,
          description: `Đã kích hoạt lại quy tắc "${rule.name}" cho nhóm "${group.name}"`,
          metadata: { 
            groupId, 
            ruleId, 
            groupName: group.name, 
            ruleName: rule.name 
          }
        })

        return NextResponse.json({ 
          groupRule: reactivatedGroupRule,
          message: 'Đã kích hoạt lại quy tắc cho nhóm'
        })
      }
    }

    // Create new group-rule association
    const groupRule = await prisma.groupRule.create({
      data: {
        groupId,
        ruleId,
        isActive: true
      }
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: ActivityType.RULE_ADDED_TO_GROUP,
      description: `Đã thêm quy tắc "${rule.name}" vào nhóm "${group.name}"`,
      metadata: { 
        groupId, 
        ruleId, 
        groupName: group.name, 
        ruleName: rule.name 
      }
    })

    return NextResponse.json({ groupRule }, { status: 201 })
  } catch (error) {
    console.error('Lỗi thêm quy tắc vào nhóm:', error)
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 })
  }
}

// DELETE /api/groups/[id]/rules - Remove a rule from a specific group
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Chưa được xác thực' }, { status: 401 })
    }

    const groupId = params.id
    const { searchParams } = new URL(request.url)
    const ruleId = searchParams.get('ruleId')

    if (!ruleId) {
      return NextResponse.json({ error: 'Cần cung cấp mã quy tắc' }, { status: 400 })
    }

    // Verify user has admin/owner permissions for this group
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

    const userMember = group.members[0]
    if (!userMember || !['OWNER', 'ADMIN'].includes(userMember.role)) {
      return NextResponse.json({ 
        error: 'Chỉ chủ nhóm hoặc quản trị viên mới có thể quản lý quy tắc' 
      }, { status: 403 })
    }

    // Verify rule exists
    const rule = await prisma.scoringRule.findUnique({
      where: { id: ruleId }
    })

    if (!rule) {
      return NextResponse.json({ error: 'Không tìm thấy quy tắc chấm điểm' }, { status: 404 })
    }

    // Check if rule is currently available to this group
    const existingGroupRule = await prisma.groupRule.findUnique({
      where: {
        groupId_ruleId: {
          groupId,
          ruleId
        }
      }
    })

    if (!existingGroupRule) {
      return NextResponse.json({ error: 'Quy tắc không tồn tại trong nhóm này' }, { status: 400 })
    }

    if (!existingGroupRule.isActive) {
      return NextResponse.json({ error: 'Quy tắc này đã bị vô hiệu trong nhóm' }, { status: 400 })
    }

    // Deactivate the rule for this group (soft delete)
    await prisma.groupRule.update({
      where: {
        groupId_ruleId: {
          groupId,
          ruleId
        }
      },
      data: { isActive: false }
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: ActivityType.RULE_REMOVED_FROM_GROUP,
      description: `Đã gỡ quy tắc "${rule.name}" khỏi nhóm "${group.name}"`,
      metadata: { 
        groupId, 
        ruleId, 
        groupName: group.name, 
        ruleName: rule.name 
      }
    })

    return NextResponse.json({ 
      message: 'Đã xóa quy tắc khỏi nhóm thành công' 
    })
  } catch (error) {
    console.error('Lỗi xóa quy tắc khỏi nhóm:', error)
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 })
  }
}
