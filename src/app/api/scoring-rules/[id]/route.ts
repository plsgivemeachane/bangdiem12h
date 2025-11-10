import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-logger'
import { ActivityType } from '@/types'
import { API } from '@/lib/translations'

// DELETE endpoint for deleting individual scoring rules
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: API.ERROR.UNAUTHORIZED }, { status: 401 })
    }

    const ruleId = params.id
    if (!ruleId) {
      return NextResponse.json({
        error: API.ERROR.NEED_RULE_ID
      }, { status: 400 })
    }

    // Get the existing rule
    const existingRule = await prisma.scoringRule.findUnique({
      where: { id: ruleId },
      include: {
        groupRules: {
          include: { group: true }
        },
        scoreRecords: true
      }
    })

    if (!existingRule) {
      return NextResponse.json({
        error: API.ERROR.RULE_NOT_FOUND
      }, { status: 404 })
    }

    // Check if user is ADMIN (only ADMIN can delete global rules)
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({
        error: API.ERROR.ONLY_ADMIN_DELETE_RULE
      }, { status: 403 })
    }

    // Check if rule has associated score records
    if (existingRule.scoreRecords.length > 0) {
      return NextResponse.json({
        error: API.ERROR.CANNOT_DELETE_RULE_WITH_RECORDS
      }, { status: 400 })
    }

    // Check if rule is in use by any groups
    if (existingRule.groupRules.length > 0) {
      const groupNames = existingRule.groupRules.map(gr => gr.group.name).join(', ')
      return NextResponse.json({
        error: API.ERROR.CANNOT_DELETE_RULE_IN_USE_BY_GROUPS.replace('{groupNames}', groupNames)
      }, { status: 400 })
    }

    // Delete the rule (cascade will handle related records)
    await prisma.scoringRule.delete({
      where: { id: ruleId }
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: ActivityType.SCORING_RULE_DELETED,
      description: API.SUCCESS.RULE_DELETED.replace('{ruleName}', existingRule.name),
      metadata: {
        ruleId,
        ruleName: existingRule.name,
        points: existingRule.points
      }
    })

    return NextResponse.json({ 
      message: API.SUCCESS.RULE_DELETED.replace('{ruleName}', existingRule.name) 
    })
  } catch (error) {
    console.error('API Error - Delete scoring rule:', error)
    return NextResponse.json({ error: API.ERROR.INTERNAL_SERVER_ERROR }, { status: 500 })
  }
}

// PATCH endpoint for partial updates (e.g., activation/deactivation)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: API.ERROR.UNAUTHORIZED }, { status: 401 })
    }

    const ruleId = params.id
    const { isActive, ...otherFields } = await request.json()

    if (!ruleId) {
      return NextResponse.json({
        error: API.ERROR.NEED_RULE_ID
      }, { status: 400 })
    }

    // Get the existing rule
    const existingRule = await prisma.scoringRule.findUnique({
      where: { id: ruleId }
    })

    if (!existingRule) {
      return NextResponse.json({
        error: API.ERROR.RULE_NOT_FOUND
      }, { status: 404 })
    }

    // Only ADMIN can update global rules
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({
        error: API.ERROR.ONLY_ADMIN_UPDATE_RULE
      }, { status: 403 })
    }

    // Build update data
    const updateData: any = {}
    
    // Handle isActive specifically
    if (isActive !== undefined) {
      updateData.isActive = isActive
    }

    // Handle other fields (name, description, points, criteria)
    if (otherFields.name !== undefined) {
      if (!otherFields.name.trim()) {
        return NextResponse.json({
          error: API.ERROR.RULE_NAME_REQUIRED
        }, { status: 400 })
      }
      // Check for duplicate names
      const existingWithName = await prisma.scoringRule.findFirst({
        where: {
          name: otherFields.name.trim(),
          id: { not: ruleId }
        }
      })
      if (existingWithName) {
        return NextResponse.json({
          error: API.ERROR.NAME_EXISTS
        }, { status: 400 })
      }
      updateData.name = otherFields.name.trim()
    }
    
    if (otherFields.description !== undefined) {
      updateData.description = otherFields.description.trim() || null
    }
    
    if (otherFields.points !== undefined) {
      if (isNaN(parseInt(otherFields.points.toString()))) {
        return NextResponse.json({
          error: API.ERROR.INVALID_POINTS
        }, { status: 400 })
      }
      updateData.points = parseInt(otherFields.points)
    }
    
    if (otherFields.criteria !== undefined) {
      updateData.criteria = otherFields.criteria
    }

    // Update the rule
    const updatedRule = await prisma.scoringRule.update({
      where: { id: ruleId },
      data: updateData
    })

    // Log activity
    const action = isActive !== undefined 
      ? ActivityType.SCORING_RULE_TOGGLED
      : ActivityType.SCORING_RULE_UPDATED

    const description = isActive !== undefined
      ? API.SUCCESS.RULE_STATUS_UPDATED
          .replace('{ruleName}', updatedRule.name)
          .replace('{status}', updatedRule.isActive ? 'activated' : 'deactivated')
      : API.SUCCESS.RULE_UPDATED.replace('{ruleName}', updatedRule.name)

    await logActivity({
      userId: session.user.id,
      action,
      description,
      metadata: {
        ruleId,
        changes: updateData
      }
    })

    return NextResponse.json({ scoringRule: updatedRule })
  } catch (error) {
    console.error('API Error - Update scoring rule:', error)
    return NextResponse.json({ error: API.ERROR.INTERNAL_SERVER_ERROR }, { status: 500 })
  }
}