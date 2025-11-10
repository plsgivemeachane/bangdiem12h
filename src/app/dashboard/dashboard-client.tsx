'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { ActivityFeed } from '@/components/activity/ActivityFeed'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DashboardStats, Group } from '@/types'
import { Users, Trophy, Target, Activity, Plus } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import {
  DASHBOARD,
  ACTIONS,
  LABELS,
  MESSAGES,
  DESCRIPTIONS,
  PAGE_TITLES,
  USER_ROLES,
  GROUP_ROLES,
  NAV,
  PLACEHOLDERS
} from '@/lib/translations'

export default function DashboardClient() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalGroups: 0,
    totalScoreRecords: 0,
    totalPoints: 0,
    recentActivity: []
  })
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showScoringRulesDialog, setShowScoringRulesDialog] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')

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
        throw new Error(MESSAGES.ERROR.FAILED_TO_LOAD)
      }
      const groupsData = await groupsResponse.json()
      setGroups(groupsData.groups || [])

      // Fetch analytics data for stats
      const analyticsResponse = await fetch('/api/analytics?period=month')
      if (!analyticsResponse.ok) {
        throw new Error(MESSAGES.ERROR.FAILED_TO_LOAD)
      }
      const analyticsData = await analyticsResponse.json()

      // Fetch recent activity
      const activityResponse = await fetch('/api/activity-logs?limit=10&page=1')
      const activityData = activityResponse.ok ? await activityResponse.json() : { activityLogs: [] }

      // Calculate stats from real data
      setStats({
        totalGroups: groupsData.groups?.length || 0,
        totalScoreRecords: analyticsData.analytics?.summary?.recordCount || 0,
        totalPoints: analyticsData.analytics?.summary?.totalPoints || 0,
        recentActivity: activityData.activityLogs || []
      })

    } catch (err) {
      console.error(MESSAGES.ERROR.FAILED_TO_LOAD + ':', err)
      setError(err instanceof Error ? err.message : MESSAGES.ERROR.FAILED_TO_LOAD)
    } finally {
      setLoading(false)
    }
  }

  const handleReload = () => {
    fetchDashboardData()
  }

  const handleGroupSelectForRules = (groupId: string) => {
    setSelectedGroupId(groupId)
    setShowScoringRulesDialog(false)
    router.push(`/groups/${groupId}/rules`)
  }

  const handleQuickRulesAccess = () => {
    // If user has only one group, navigate directly
    if (groups.length === 1) {
      router.push(`/groups/${groups[0].id}/rules`)
    } else if (groups.length === 0) {
      // No groups - redirect to create group
      router.push('/groups')
    } else {
      // Multiple groups - show dialog
      setShowScoringRulesDialog(true)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading text={ACTIONS.LOADING_DASHBOARD} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">{DASHBOARD.OVERVIEW.AUTHENTICATION_REQUIRED}</h2>
            <p className="text-muted-foreground mb-6">
              {DASHBOARD.OVERVIEW.PLEASE_SIGNIN_ACCESS}
            </p>
            <Button asChild>
              <Link href="/auth/signin">{NAV.SIGN_IN}</Link>
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
            <h2 className="text-2xl font-bold mb-4">{DASHBOARD.OVERVIEW.DASHBOARD_LOAD_ERROR}</h2>
            <p className="text-muted-foreground mb-6">
              {error}
            </p>
            <Button onClick={handleReload}>
              {ACTIONS.RELOAD}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{PAGE_TITLES.DASHBOARD}</h1>
        <p className="text-muted-foreground">
          {DASHBOARD.OVERVIEW.WELCOME_BACK}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{DASHBOARD.OVERVIEW.TOTAL_GROUPS_STAT}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGroups}</div>
            <p className="text-xs text-muted-foreground">
              {DASHBOARD.OVERVIEW.TOTAL_GROUPS_DESC}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{DASHBOARD.OVERVIEW.SCORE_RECORDS_STAT}</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScoreRecords}</div>
            <p className="text-xs text-muted-foreground">
              {DASHBOARD.OVERVIEW.SCORE_RECORDS_DESC}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{DASHBOARD.OVERVIEW.TOTAL_POINTS_STAT}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPoints}</div>
            <p className="text-xs text-muted-foreground">
              {DASHBOARD.OVERVIEW.TOTAL_POINTS_DESC}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{DASHBOARD.OVERVIEW.ACTIVITY_STAT}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity.length}</div>
            <p className="text-xs text-muted-foreground">
              {DASHBOARD.OVERVIEW.ACTIVITY_DESC}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Groups */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{DASHBOARD.OVERVIEW.YOUR_GROUPS_SECTION}</CardTitle>
          </CardHeader>
          <CardContent>
            {groups.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  {DASHBOARD.OVERVIEW.NO_GROUPS_YET}
                </p>
                <Button asChild>
                  <Link href="/groups">
                    <Plus className="h-4 w-4 mr-2" />
                    {DASHBOARD.OVERVIEW.CREATE_GROUP}
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {groups.slice(0, 5).map((group) => (
                  <div key={group.id} className="flex items-center justify-between">
                    <div 
                      className="flex-1 cursor-pointer hover:bg-muted/50 p-2 -m-2 rounded transition-colors"
                      onClick={() => router.push(`/groups/${group.id}`)}
                    >
                      <p className="font-medium">{group.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {group._count?.groupRules || 0} {LABELS.RULES}
                      </p>
                    </div>
                    <Badge variant={group.isActive ? "default" : "secondary"}>
                      {group.isActive ? LABELS.ACTIVE : LABELS.INACTIVE}
                    </Badge>
                  </div>
                ))}
                {groups.length > 5 && (
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/groups">
                      {DASHBOARD.OVERVIEW.VIEW_ALL.replace('{count}', groups.length.toString())}
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{DASHBOARD.OVERVIEW.QUICK_ACTIONS}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start">
              <Link href="/groups">
                <Plus className="h-4 w-4 mr-2" />
                {DASHBOARD.OVERVIEW.CREATE_NEW_GROUP}
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/groups">
                {DASHBOARD.OVERVIEW.MANAGE_GROUPS}
              </Link>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleQuickRulesAccess}
            >
              {DASHBOARD.OVERVIEW.VIEW_SCORING_RULES}
            </Button>
          </CardContent>
        </Card>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{DASHBOARD.OVERVIEW.RECENT_ACTIVITY}</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto">
            <ActivityFeed limit={10} compact={true} showViewAll={true} />
          </CardContent>
        </Card>
      </div>

      {/* Group Selection Dialog for Scoring Rules */}
      <Dialog open={showScoringRulesDialog} onOpenChange={setShowScoringRulesDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{DASHBOARD.OVERVIEW.SCORING_RULES_GROUP_SELECT}</DialogTitle>
            <DialogDescription>
              {DASHBOARD.OVERVIEW.SCORING_RULES_GROUP_DESC}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="group-select" className="text-sm font-medium">
                {LABELS.GROUP}
              </label>
              <Select onValueChange={handleGroupSelectForRules}>
                <SelectTrigger>
                  <SelectValue placeholder={PLACEHOLDERS.CHOOSE_MEMBER} />
                </SelectTrigger>
                <SelectContent>
                  {groups.filter(group => group.id && group.id.trim() !== '').map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{group.name}</span>
                        <Badge variant={group.isActive ? "default" : "secondary"} className="ml-2">
                          {group.isActive ? LABELS.ACTIVE : LABELS.INACTIVE}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowScoringRulesDialog(false)}
            >
              {ACTIONS.CANCEL}
            </Button>
            <Button asChild>
              <Link href="/groups">
                {DASHBOARD.OVERVIEW.CREATE_NEW_GROUP}
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}