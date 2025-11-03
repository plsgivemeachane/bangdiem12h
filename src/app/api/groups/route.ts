import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-logger'
import { ActivityType } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const groups = await prisma.group.findMany({
      where: {
        OR: [
          { createdById: session.user.id },
          { 
            members: {
              some: { userId: session.user.id }
            }
          }
        ]
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
        _count: {
          select: {
            groupRules: true,
            scoreRecords: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ groups })
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 })
    }

    // Check if user already has a group with the same name
    const existingGroup = await prisma.group.findFirst({
      where: {
        name: name.trim(),
        createdById: session.user.id
      }
    })

    if (existingGroup) {
      return NextResponse.json({ error: 'You already have a group with this name' }, { status: 400 })
    }

    // Verify user exists in database before creating group
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
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
      description: `Created group "${group.name}"`,
      metadata: { groupName: group.name }
    })

    return NextResponse.json({ group: groupWithScoringRules, success: true })
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}