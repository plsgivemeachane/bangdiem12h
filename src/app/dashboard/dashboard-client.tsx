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
        throw new Error('Không thể tải danh sách nhóm')
      }
      const groupsData = await groupsResponse.json()
      setGroups(groupsData.groups || [])

      // Fetch analytics data for stats
      const analyticsResponse = await fetch('/api/analytics?period=month')
      if (!analyticsResponse.ok) {
        throw new Error('Không thể tải dữ liệu phân tích')
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
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu bảng điều khiển')
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
        <Loading text="Đang tải bảng điều khiển..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Yêu cầu xác thực</h2>
            <p className="text-muted-foreground mb-6">
              Vui lòng đăng nhập để truy cập bảng điều khiển.
            </p>
            <Button asChild>
              <Link href="/auth/signin">Đăng nhập</Link>
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
            <h2 className="text-2xl font-bold mb-4">Lỗi tải bảng điều khiển</h2>
            <p className="text-muted-foreground mb-6">
              {error}
            </p>
            <Button onClick={handleReload}>
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển</h1>
        <p className="text-muted-foreground">
          Chào mừng trở lại! Đây là tổng quan về các hoạt động chấm điểm của bạn.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số nhóm</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGroups}</div>
            <p className="text-xs text-muted-foreground">
              Nhóm đang hoạt động bạn tham gia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bản ghi điểm</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScoreRecords}</div>
            <p className="text-xs text-muted-foreground">
              Tổng số điểm đã ghi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng điểm</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPoints}</div>
            <p className="text-xs text-muted-foreground">
              Tất cả các hoạt động
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoạt động</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity.length}</div>
            <p className="text-xs text-muted-foreground">
              Hoạt động gần đây
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Groups */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Nhóm của bạn</CardTitle>
          </CardHeader>
          <CardContent>
            {groups.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  Bạn chưa tham gia nhóm nào.
                </p>
                <Button asChild>
                  <Link href="/groups">
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo nhóm
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
                        {group._count?.groupRules || 0} quy tắc
                      </p>
                    </div>
                    <Badge variant={group.isActive ? "default" : "secondary"}>
                      {group.isActive ? "Hoạt động" : "Không hoạt động"}
                    </Badge>
                  </div>
                ))}
                {groups.length > 5 && (
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/groups">
                      Xem tất cả {groups.length} nhóm
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start">
              <Link href="/groups">
                <Plus className="h-4 w-4 mr-2" />
                Tạo nhóm mới
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/groups">
                Quản lý nhóm
              </Link>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleQuickRulesAccess}
            >
              Xem quy tắc chấm điểm
            </Button>
          </CardContent>
        </Card>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
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
            <DialogTitle>Chọn nhóm cho quy tắc chấm điểm</DialogTitle>
            <DialogDescription>
              Chọn một nhóm để xem và quản lý quy tắc chấm điểm của nó.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="group-select" className="text-sm font-medium">
                Nhóm
              </label>
              <Select onValueChange={handleGroupSelectForRules}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhóm" />
                </SelectTrigger>
                <SelectContent>
                  {groups.filter(group => group.id && group.id.trim() !== '').map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{group.name}</span>
                        <Badge variant={group.isActive ? "default" : "secondary"} className="ml-2">
                          {group.isActive ? "Hoạt động" : "Không hoạt động"}
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
              Hủy
            </Button>
            <Button asChild>
              <Link href="/groups">
                Tạo nhóm mới
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}