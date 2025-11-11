import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-logger'
import { ActivityType } from '@/types'
import { API } from '@/lib/translations'
import { injectVirtualAdminMembership } from '@/lib/utils/global-admin-permissions'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: API.ERROR.UNAUTHORIZED }, { status: 401 })
    }

    // Fetch ALL groups - users can view all groups (read-only permission)
    const groups = await prisma.group.findMany({
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true, createdAt: true }
            }
          }
        },
        _count: {
          select: {
            groupRules: true,
            scoreRecords: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Inject virtual admin memberships for global administrators
    const groupsWithVirtualMembers = groups.map(group =>
      injectVirtualAdminMembership(group, session.user as any)
    )

    return NextResponse.json({ groups: groupsWithVirtualMembers })
  } catch (error) {
    console.error('API Error - Load groups list:', error)
    return NextResponse.json({ error: API.ERROR.INTERNAL_SERVER_ERROR }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: API.ERROR.UNAUTHORIZED }, { status: 401 })
    }

    // Only System ADMINs can create groups
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({
        error: API.ERROR.ONLY_ADMIN_CREATE_GROUP
      }, { status: 403 })
    }

    const { name, description } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: API.INFO.NAME_REQUIRED }, { status: 400 })
    }

    // Check if user already has a group with the same name
    const existingGroup = await prisma.group.findFirst({
      where: {
        name: name.trim(),
        createdById: session.user.id
      }
    })

    if (existingGroup) {
      return NextResponse.json({ error: API.ERROR.DUPLICATE_NAME }, { status: 400 })
    }

    // Verify user exists in database before creating group
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: API.ERROR.USER_NOT_FOUND }, { status: 404 })
    }

    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        createdById: user.id,
        members: {
          create: {
            userId: user.id,
            role: 'OWNER'
          }
        }
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        groupRules: {
          include: {
            rule: true
          },
          where: { isActive: true }
        },
        _count: {
          select: {
            scoreRecords: true,
            groupRules: true
          }
        }
      }
    })

    // Transform groupRules to scoringRules for backward compatibility
    const groupWithScoringRules = {
      ...group,
      scoringRules: group.groupRules?.map(gr => gr.rule) || []
    }

    // Log activity
    await logActivity({
      userId: session.user.id,
      groupId: group.id,
      action: ActivityType.GROUP_CREATED,
      description: API.SUCCESS.GROUP_CREATED.replace('{name}', group.name),
      metadata: { groupName: group.name }
    })

    return NextResponse.json({ group: groupWithScoringRules, success: true })
  } catch (error) {
    console.error('API Error - Create group:', error)
    return NextResponse.json({ error: API.ERROR.INTERNAL_SERVER_ERROR }, { status: 500 })
  }
}