'use client'

import { useState, useEffect } from 'react'
import { Plus, Users, Trophy, TrendingUp } from 'lucide-react'
import { GroupList } from '@/components/groups/GroupList'
import { GroupForm } from '@/components/groups/GroupForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loading } from '@/components/ui/loading'
import { GroupsApi } from '@/lib/api/groups'
import { useAuth } from '@/hooks/use-auth'
import { Group } from '@/types'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin')
      return
    }
  }, [isAuthenticated, authLoading, router])

  // Load groups on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadGroups()
    }
  }, [isAuthenticated])

  const loadGroups = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const groupsData = await GroupsApi.getGroups()
      setGroups(groupsData)
    } catch (error) {
      console.error('Không thể tải danh sách nhóm:', error)
      setError(error instanceof Error ? error.message : 'Không thể tải danh sách nhóm')
      toast.error('Không thể tải danh sách nhóm')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateGroup = () => {
    setEditingGroup(null)
    setIsFormOpen(true)
  }

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group)
    setIsFormOpen(true)
  }

  const handleDeleteGroup = async (group: Group) => {
    try {
      await GroupsApi.deleteGroup(group.id)
      setGroups(prev => prev.filter(g => g.id !== group.id))
      toast.success('Xóa nhóm thành công')
    } catch (error) {
      console.error('Không thể xóa nhóm:', error)
      toast.error(error instanceof Error ? error.message : 'Không thể xóa nhóm')
      throw error // Re-throw for GroupCard to handle loading state
    }
  }

  const handleManageMembers = (group: Group) => {
    router.push(`/groups/${group.id}/members`)
  }

  const handleViewDetails = (group: Group) => {
    router.push(`/groups/${group.id}`)
  }

  const handleFormSuccess = (updatedGroup?: Group) => {
    setIsFormOpen(false)
    setEditingGroup(null)
    
    if (updatedGroup) {
      if (editingGroup) {
        // Update existing group
        setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g))
      } else {
        // Add new group
        setGroups(prev => [updatedGroup, ...prev])
      }
    } else {
      // Just reload to be safe
      loadGroups()
    }
  }

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
              Vui lòng đăng nhập để truy cập nhóm của bạn.
            </p>
            <Button onClick={() => router.push('/auth/signin')}>
              Đăng nhập
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate quick stats
  const totalGroups = groups.length
  const activeGroups = groups.filter(g => g.isActive).length
  const totalMembers = groups.reduce((sum, group) => sum + (group.members?.length || 0), 0)
  const totalScoreRecords = groups.reduce((sum, group) => sum + (group._count?.scoreRecords || 0), 0)

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nhóm</h1>
          <p className="text-muted-foreground">
            Quản lý nhóm và tổ chức các hoạt động chấm điểm
          </p>
        </div>
        {/* Only System ADMINs can create groups */}
        {user?.role === 'ADMIN' && (
          <Button onClick={handleCreateGroup}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo nhóm
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số nhóm</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGroups}</div>
            <p className="text-xs text-muted-foreground">
              {activeGroups} hoạt động
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng thành viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Trên tất cả nhóm
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bản ghi điểm</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScoreRecords}</div>
            <p className="text-xs text-muted-foreground">
              Tổng số đã ghi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vai trò của bạn</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{user?.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}</div>
            <p className="text-xs text-muted-foreground">
              Cấp quyền hiện tại
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-destructive mb-2">Lỗi tải danh sách nhóm</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadGroups} variant="outline">
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Groups List */}
      <GroupList
        groups={groups}
        isLoading={isLoading}
        onEdit={handleEditGroup}
        onDelete={handleDeleteGroup}
        onManageMembers={handleManageMembers}
        onViewDetails={handleViewDetails}
        onCreateGroup={handleCreateGroup}
        showActions={true}
      />

      {/* Group Form Dialog */}
      <GroupForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        group={editingGroup}
        mode={editingGroup ? 'edit' : 'create'}
      />
    </div>
  )
}