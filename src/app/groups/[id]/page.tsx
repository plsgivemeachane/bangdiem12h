'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Users, 
  Trophy, 
  TrendingUp, 
  Settings, 
  Plus,
  Edit,
  UserPlus,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { ActivityFeed } from '@/components/activity/ActivityFeed'
import { GroupForm } from '@/components/groups/GroupForm'
import { GroupsApi } from '@/lib/api/groups'
import { useAuth } from '@/hooks/use-auth'
import { Group, GroupMember } from '@/types'
import toast from 'react-hot-toast'

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Chủ nhóm',
  ADMIN: 'Quản trị viên',
  MEMBER: 'Thành viên',
  VIEWER: 'Người xem'
}

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [group, setGroup] = useState<Group | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)

  // Load group data on mount
  useEffect(() => {
    if (groupId && isAuthenticated) {
      loadGroup()
    }
  }, [groupId, isAuthenticated])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin')
      return
    }
  }, [isAuthenticated, authLoading, router])

  const loadGroup = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const groupData = await GroupsApi.getGroup(groupId)
      setGroup(groupData)
    } catch (error) {
      console.error('Failed to load group:', error)
      if (error instanceof Error) {
        if (error.message.includes('Group not found')) {
          setError('Không tìm thấy nhóm hoặc bạn không có quyền truy cập vào nhóm này.')
        } else if (error.message.includes('Access denied')) {
          setError('Bạn không có quyền xem nhóm này.')
        } else {
          setError(error.message)
        }
      } else {
        setError('Không thể tải thông tin nhóm')
      }
      toast.error('Không thể tải thông tin nhóm')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToGroups = () => {
    router.push('/groups')
  }

  const handleManageMembers = () => {
    router.push(`/groups/${groupId}/members`)
  }

  const handleViewScoring = () => {
    router.push(`/groups/${groupId}/scoring`)
  }

  const handleViewRules = () => {
    router.push(`/groups/${groupId}/rules`)
  }

  const handleEditGroup = () => {
    setIsEditFormOpen(true)
  }

  const handleEditSuccess = (updatedGroup?: Group) => {
    setIsEditFormOpen(false)
    if (updatedGroup) {
      setGroup(updatedGroup)
      toast.success('Cập nhật nhóm thành công')
    } else {
      loadGroup()
    }
  }

  // Check if user has permission to manage group
  const canManageGroup = group?.members?.some(
    member => member.userId === user?.id && ['OWNER', 'ADMIN'].includes(member.role)
  ) || false

  // Show loading spinner during authentication check
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading text="Đang kiểm tra xác thực..." />
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Yêu cầu xác thực</h2>
            <p className="text-muted-foreground mb-6">
              Vui lòng đăng nhập để truy cập nhóm này.
            </p>
            <Button onClick={() => router.push('/auth/signin')}>
              Đăng nhập
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading text="Đang tải thông tin nhóm..." />
      </div>
    )
  }

  // Error state
  if (error || !group) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Không tìm thấy nhóm</h2>
            <p className="text-muted-foreground mb-6">
              {error || 'Nhóm bạn tìm kiếm không tồn tại.'}
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleBackToGroups} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại danh sách nhóm
              </Button>
              <Button onClick={loadGroup}>
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get user's role in the group
  const userRole = group.members?.find(member => member.userId === user?.id)?.role || 'VIEWER'
  const isOwner = userRole === 'OWNER'
  const isAdmin = userRole === 'ADMIN'

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button onClick={handleBackToGroups} variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách nhóm
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
              <Badge variant={group.isActive ? "default" : "secondary"}>
              {group.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
              </Badge>
            </div>
            {group.description && (
              <p className="text-muted-foreground mt-1">{group.description}</p>
            )}
          </div>
        </div>
        
        {canManageGroup && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEditGroup}>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa nhóm
            </Button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thành viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{group.members?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Thành viên đang hoạt động
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vai trò của bạn</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{ROLE_LABELS[userRole] || userRole}</div>
            <p className="text-xs text-muted-foreground">
              Mức quyền hạn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lượt ghi điểm</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{group._count?.scoreRecords || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tổng số lượt ghi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quy tắc chấm điểm</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{group.scoringRules?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Quy tắc đang hoạt động
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Members Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Thành viên
            </CardTitle>
            <CardDescription>
              Quản lý thành viên và vai trò của họ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Có {group.members?.length || 0} thành viên trong nhóm
              </div>
              <Button 
                onClick={handleManageMembers}
                className="w-full"
                variant={canManageGroup ? "default" : "outline"}
                disabled={!canManageGroup}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Quản lý thành viên
              </Button>
              {userRole === 'VIEWER' && (
                <p className="text-xs text-muted-foreground">
                  Liên hệ quản trị viên để quản lý thành viên
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scoring Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quy tắc chấm điểm
            </CardTitle>
            <CardDescription>
              Thiết lập cách tính điểm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {group.scoringRules?.length || 0} quy tắc chấm điểm đang hoạt động
              </div>
              <Button 
                onClick={handleViewRules}
                className="w-full"
                variant="outline"
              >
                <Settings className="mr-2 h-4 w-4" />
                Xem quy tắc
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Score Recording */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Ghi điểm
            </CardTitle>
            <CardDescription>
              Ghi và xem điểm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {group._count?.scoreRecords || 0} lượt ghi điểm
              </div>
              <Button 
                onClick={handleViewScoring}
                className="w-full"
                variant="outline"
              >
                <Activity className="mr-2 h-4 w-4" />
                Xem điểm
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Thành viên trong nhóm</CardTitle>
          <CardDescription>
            Những người có quyền truy cập vào nhóm
          </CardDescription>
        </CardHeader>
        <CardContent>
          {group.members && group.members.length > 0 ? (
            <div className="space-y-3">
              {group.members.map((member: GroupMember) => (
                <div key={member.userId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {member.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{member.user?.name || 'Người dùng chưa xác định'}</p>
                      <p className="text-sm text-muted-foreground">{member.user?.email || 'Không có email'}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {ROLE_LABELS[member.role] || member.role}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              Không có thành viên nào trong nhóm.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Group Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <CardDescription>
            Các hoạt động mới nhất trong nhóm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityFeed groupId={group.id} limit={5} compact={true} showViewAll={true} />
        </CardContent>
      </Card>

      {/* Edit Group Form */}
      <GroupForm
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        onSuccess={handleEditSuccess}
        group={group}
        mode="edit"
      />
    </div>
  )
}