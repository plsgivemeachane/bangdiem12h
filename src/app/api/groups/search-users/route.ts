import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
    }

    const searchTerm = query.trim().toLowerCase()

    // Search users by email or name
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                email: {
                  contains: searchTerm,
                  mode: 'insensitive'
                }
              },
              {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive'
                }
              }
            ]
          },
          // Exclude current user from search results
          {
            id: {
              not: session.user.id
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: [
        {
          email: 'asc'
        },
        {
          name: 'asc'
        }
      ],
      // Limit search results to prevent abuse
      take: 20
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
