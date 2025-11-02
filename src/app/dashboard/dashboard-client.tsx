'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { DashboardStats, Group } from '@/types'
import { Users, Trophy, Target, Activity, Plus } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'

export default function DashboardClient() {
  const { isAuthenticated, isLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalGroups: 0,
    totalScoreRecords: 0,
    totalPoints: 0,
    recentActivity: []
  })
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchDashboardData()
    }
  }, [isLoading, isAuthenticated])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch groups
      const groupsResponse = await fetch('/api/groups')
      if (!groupsResponse.ok) {
        throw new Error('Failed to fetch groups')
      }
      const groupsData = await groupsResponse.json()
      setGroups(groupsData.groups || [])

      // Calculate basic stats
      setStats({
        totalGroups: groupsData.groups?.length || 0,
        totalScoreRecords: 0, // Would need additional API calls for this
        totalPoints: 0, // Would need additional API calls for this
        recentActivity: [] // Would need additional API calls for this
      })

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleReload = () => {
    fetchDashboardData()
  }

  if (isLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading text="Loading dashboard..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to access your dashboard.
            </p>
            <Button asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Error Loading Dashboard</h2>
            <p className="text-muted-foreground mb-6">
              {error}
            </p>
            <Button onClick={handleReload}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your scoring activities.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGroups}</div>
            <p className="text-xs text-muted-foreground">
              Active groups you're part of
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Records</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScoreRecords}</div>
            <p className="text-xs text-muted-foreground">
              Total points recorded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPoints}</div>
            <p className="text-xs text-muted-foreground">
              Across all activities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity.length}</div>
            <p className="text-xs text-muted-foreground">
              Recent activities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Groups */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Groups</CardTitle>
          </CardHeader>
          <CardContent>
            {groups.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  You're not part of any groups yet.
                </p>
                <Button asChild>
                  <Link href="/groups">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {groups.slice(0, 5).map((group) => (
                  <div key={group.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{group.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {group._count?.scoringRules || 0} rules
                      </p>
                    </div>
                    <Badge variant={group.isActive ? "default" : "secondary"}>
                      {group.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
                {groups.length > 5 && (
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/groups">
                      View all {groups.length} groups
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start">
              <Link href="/groups">
                <Plus className="h-4 w-4 mr-2" />
                Create New Group
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/groups">
                Manage Groups
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/groups">
                View Scoring Rules
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No recent activity to display.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <Activity className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}