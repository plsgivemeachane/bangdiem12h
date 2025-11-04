'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  List,
  Plus,
  Settings,
  Target,
  Award,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  DollarSign
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { RuleCreationModal } from '@/components/ui/rule-creation-modal'
import { GroupsApi } from '@/lib/api/groups'
import { useAuth } from '@/hooks/use-auth'
import { Group, ScoringRule } from '@/types'
import toast from 'react-hot-toast'

export default function GroupRulesPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [group, setGroup] = useState<Group | null>(null)
  const [groupRules, setGroupRules] = useState<ScoringRule[]>([]) // Rules IN this group
  const [availableRules, setAvailableRules] = useState<ScoringRule[]>([]) // Global rules NOT in group
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingRule, setIsCreatingRule] = useState(false)
  const [showRuleModal, setShowRuleModal] = useState(false)

  // Load group and rules data on mount
  useEffect(() => {
    if (groupId && isAuthenticated) {
      loadGroupData()
    }
  }, [groupId, isAuthenticated])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin')
      return
    }
  }, [isAuthenticated, authLoading, router])

  const loadGroupData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Load group details
      const groupData = await GroupsApi.getGroup(groupId)
      setGroup(groupData)
      
      // Load rules IN this group (has GroupRule records)
      const rulesInGroup = await GroupsApi.getScoringRules(groupId)
      setGroupRules(rulesInGroup)
      
      // Load ALL global rules
      const allGlobalRules = await GroupsApi.getAllGlobalRules()
      
      // Calculate available rules (global rules NOT in this group)
      const groupRuleIds = new Set(rulesInGroup.map(r => r.id))
      const available = allGlobalRules.filter(rule => !groupRuleIds.has(rule.id))
      setAvailableRules(available)
      
    } catch (error) {
      console.error('Failed to load group data:', error)
      if (error instanceof Error) {
        if (error.message.includes('Group not found')) {
          setError('Nhóm không tìm thấy hoặc bạn không có quyền truy cập vào nhóm này.')
        } else if (error.message.includes('Access denied')) {
          setError('Bạn không có quyền xem nhóm này.')
        } else {
          setError(error.message)
        }
      } else {
        setError('Không thể tải dữ liệu nhóm')
      }
      toast.error('Không thể tải dữ liệu nhóm')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToGroup = () => {
    router.push(`/groups/${groupId}`)
  }

  const handleCreateRule = () => {
    setShowRuleModal(true)
  }

  const handleRuleModalClose = () => {
    setShowRuleModal(false)
  }

  const handleRuleCreated = (newRule: ScoringRule) => {
    // Refresh both lists (new rule will appear in available rules)
    loadGroupData()
    toast.success(`Quy tắc "${newRule.name}" đã được tạo! Sử dụng nút "Thêm vào nhóm" để kích hoạt.`)
  }

  const handleAddRuleToGroup = async (rule: ScoringRule) => {
    try {
      await GroupsApi.addRuleToGroup(groupId, rule.id)
      toast.success(`Quy tắc "${rule.name}" đã được thêm vào nhóm`)
      loadGroupData() // Refresh to show the rule
    } catch (error) {
      console.error('Failed to add rule to group:', error)
      toast.error('Không thể thêm quy tắc vào nhóm')
    }
  }

  const handleRemoveRuleFromGroup = async (rule: ScoringRule) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa quy tắc "${rule.name}" khỏi nhóm này không?`)) {
      try {
        await GroupsApi.removeRuleFromGroup(groupId, rule.id)
        toast.success(`Quy tắc "${rule.name}" đã được xóa khỏi nhóm`)
        loadGroupData() // Refresh both lists (rule moves to available)
      } catch (error) {
        console.error('Failed to remove rule from group:', error)
        toast.error('Không thể xóa quy tắc khỏi nhóm')
      }
    }
  }

  const handleToggleRule = async (rule: ScoringRule) => {
    try {
      // This would typically call an API to toggle the rule status globally
      toast.success(`Trạng thái quy tắc "${rule.name}" đã được cập nhật toàn cầu`)
      // For now, just update locally
      setGroupRules(prev => prev.map(r =>
        r.id === rule.id ? { ...r, isActive: !r.isActive } : r
      ))
    } catch (error) {
      console.error('Failed to toggle rule:', error)
      toast.error('Failed to update rule status')
    }
  }

  const handleRefresh = () => {
    loadGroupData()
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
              Vui lòng đăng nhập để truy cập quy tắc nhóm này.
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
        <Loading text="Đang tải quy tắc nhóm..." />
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
              {error || 'Nhóm bạn đang tìm kiếm không tồn tại.'}
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleBackToGroup} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại nhóm
              </Button>
              <Button onClick={loadGroupData}>
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button onClick={handleBackToGroup} variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại nhóm
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <List className="h-8 w-8" />
                Quy tắc nhóm
              </h1>
            </div>
            <p className="text-muted-foreground mt-1">
              Quản lý quy tắc có sẵn cho {group.name}
            </p>
          </div>
        </div>
        
        {canManageGroup && (
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Tải lại
            </Button>
            {user?.role === 'ADMIN' && (
              <Button onClick={handleCreateRule}>
                <Plus className="mr-2 h-4 w-4" />
                Tạo quy tắc toàn cục
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quy tắc đang hoạt động</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupRules.length}</div>
            <p className="text-xs text-muted-foreground">
              Quy tắc trong nhóm này
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quy tắc toàn cục có sẵn</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableRules.length}</div>
            <p className="text-xs text-muted-foreground">
              Quy tắc để thêm
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phạm vi điểm</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {groupRules.length > 0 ?
                `${Math.min(...groupRules.map(r => r.points))} - ${Math.max(...groupRules.map(r => r.points))}` :
                '0 - 0'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Phạm vi điểm
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 1: Active Rules in This Group */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>✅</span>
            Quy tắc đang hoạt động trong nhóm này
          </CardTitle>
          <CardDescription>
            Quy tắc mà thành viên có thể sử dụng khi ghi điểm
          </CardDescription>
        </CardHeader>
        <CardContent>
          {groupRules && groupRules.length > 0 ? (
            <div className="space-y-4">
              {groupRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-600/10 rounded-full flex items-center justify-center">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{rule.name}</p>
                        <Badge variant={rule.points >= 0 ? 'default' : 'destructive'}>
                          {rule.points >= 0 ? `+${rule.points}` : rule.points} điểm
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rule.description || 'Không có mô tả'}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>Được tạo {new Date(rule.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canManageGroup && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemoveRuleFromGroup(rule)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <List className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Không có quy tắc đang hoạt động trong nhóm này</p>
              <p className="text-sm">
                Thêm quy tắc toàn cục từ phần bên dưới để kích hoạt chúng cho nhóm này.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECTION 2: Available Global Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🌐</span>
            Quy tắc toàn cục có sẵn
          </CardTitle>
          <CardDescription>
            Quy tắc toàn cục có thể được thêm vào nhóm này
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableRules && availableRules.length > 0 ? (
            <div className="space-y-4">
              {availableRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600/10 rounded-full flex items-center justify-center">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{rule.name}</p>
                        <Badge variant={rule.points >= 0 ? 'default' : 'destructive'}>
                          {rule.points >= 0 ? `+${rule.points}` : rule.points} điểm
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rule.description || 'Không có mô tả'}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>Được tạo {new Date(rule.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canManageGroup && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAddRuleToGroup(rule)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm vào nhóm
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Không có quy tắc toàn cục nào có sẵn</p>
              <p className="text-sm mb-4">
                {user?.role === 'ADMIN'
                  ? 'Tạo quy tắc toàn cục mới có thể được thêm vào các nhóm.'
                  : 'Liên hệ quản trị viên để tạo quy tắc toàn cục.'}
              </p>
              {user?.role === 'ADMIN' && (
                <Button onClick={handleCreateRule}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo quy tắc toàn cục
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rule Creation Modal */}
      {user?.role === 'ADMIN' && (
        <RuleCreationModal
          isOpen={showRuleModal}
          onClose={handleRuleModalClose}
          onRuleCreated={handleRuleCreated}
          mode="create"
        />
      )}
    </div>
  )
}
