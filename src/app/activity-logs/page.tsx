'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  Filter,
  Search,
  Calendar,
  User,
  Group,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Settings
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import { ActivityType } from '@/types'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { DESCRIPTIONS, LABELS, PLACEHOLDERS, ACTIONS, ACTIVITY_TYPES, USER_ROLES, NAV, MESSAGES } from '@/lib/translations'
import toast from 'react-hot-toast'

interface ActivityLog {
  id: string
  action: ActivityType
  description: string
  metadata?: Record<string, any>
  timestamp: Date
  user: {
    id: string
    name: string | null
    email: string
  }
  group: {
    id: string
    name: string
  } | null
}

interface ActivityLogsResponse {
  activityLogs: ActivityLog[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function ActivityLogsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    action: 'all',
    groupId: '',
    userId: '',
    startDate: '',
    endDate: '',
    search: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [showFilters, setShowFilters] = useState(false)
  const fallbackError = MESSAGES.ERROR.ACTIVITY_LOGS_LOAD_FAILED

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin')
      return
    }
  }, [isAuthenticated, authLoading, router])

  // Load activity logs on mount and when filters change
  useEffect(() => {
    if (isAuthenticated) {
      loadActivityLogs()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, filters, pagination.page])

  const loadActivityLogs = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      
      // Add filters
      if (filters.action && filters.action !== 'all') params.set('action', filters.action)
      if (filters.groupId) params.set('groupId', filters.groupId)
      if (filters.userId) params.set('userId', filters.userId)
      if (filters.startDate) params.set('startDate', filters.startDate)
      if (filters.endDate) params.set('endDate', filters.endDate)
      
      // Add pagination
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())

      const response = await fetch(`/api/activity-logs?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(fallbackError)
      }

      const data: ActivityLogsResponse = await response.json()
      setActivityLogs(data.activityLogs)
      setPagination(prev => ({
        ...prev,
        totalCount: data.pagination.totalCount,
        totalPages: data.pagination.totalPages,
        hasNext: data.pagination.hasNext,
        hasPrev: data.pagination.hasPrev
      }))

    } catch (error) {
      console.error('Không thể tải nhật ký hoạt động:', error)
      const message = error instanceof Error ? error.message : fallbackError
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  const handleClearFilters = () => {
    setFilters({
      action: 'all',
      groupId: '',
      userId: '',
      startDate: '',
      endDate: '',
      search: ''
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const formatDate = (date: Date | string | null | undefined) => {
    try {
      if (!date) return '--:-- --/--/----'
      
      const dateObj = date instanceof Date ? date : new Date(date)
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) return '--:-- --/--/----'
      
      return format(dateObj, 'HH:mm dd/MM/yyyy', { locale: vi })
    } catch (error) {
      console.error('Error formatting date:', error)
      return '--:-- --/--/----'
    }
  }

  const getActionBadgeVariant = (action: ActivityType) => {
    // Define color scheme for different actions
    const actionColors: Record<ActivityType, string> = {
      [ActivityType.USER_REGISTERED]: 'bg-green-100 text-green-800',
      [ActivityType.USER_LOGIN]: 'bg-blue-100 text-blue-800',
      [ActivityType.LOGIN_FAILED]: 'bg-red-100 text-red-800',
      [ActivityType.PASSWORD_RESET_REQUESTED]: 'bg-yellow-100 text-yellow-800',
      [ActivityType.PASSWORD_RESET_COMPLETED]: 'bg-green-100 text-green-800',
      [ActivityType.ADMIN_USER_CREATED]: 'bg-purple-100 text-purple-800',
      [ActivityType.ADMIN_USER_ROLE_UPDATED]: 'bg-blue-100 text-blue-800',
      [ActivityType.ADMIN_USER_DELETED]: 'bg-red-100 text-red-800',
      [ActivityType.ADMIN_PASSWORD_RESET_BY_ADMIN]: 'bg-yellow-100 text-yellow-800',
      [ActivityType.GROUP_CREATED]: 'bg-indigo-100 text-indigo-800',
      [ActivityType.GROUP_UPDATED]: 'bg-orange-100 text-orange-800',
      [ActivityType.GROUP_DELETED]: 'bg-red-100 text-red-800',
      [ActivityType.MEMBER_INVITED]: 'bg-blue-100 text-blue-800',
      [ActivityType.MEMBER_JOINED]: 'bg-green-100 text-green-800',
      [ActivityType.MEMBER_ADDED]: 'bg-green-100 text-green-800',
      [ActivityType.MEMBER_REMOVED]: 'bg-red-100 text-red-800',
      [ActivityType.MEMBER_ROLE_UPDATED]: 'bg-blue-100 text-blue-800',
      [ActivityType.OWNERSHIP_TRANSFERRED]: 'bg-yellow-100 text-yellow-800',
      [ActivityType.SCORING_RULE_CREATED]: 'bg-indigo-100 text-indigo-800',
      [ActivityType.RULE_ADDED_TO_GROUP]: 'bg-purple-100 text-purple-800',
      [ActivityType.RULE_REMOVED_FROM_GROUP]: 'bg-orange-100 text-orange-800',
      [ActivityType.SCORING_RULE_UPDATED]: 'bg-orange-100 text-orange-800',
      [ActivityType.SCORING_RULE_TOGGLED]: 'bg-yellow-100 text-yellow-800',
      [ActivityType.SCORING_RULE_DELETED]: 'bg-red-100 text-red-800',
      [ActivityType.SCORE_RECORDED]: 'bg-green-100 text-green-800',
      [ActivityType.SCORE_UPDATED]: 'bg-blue-100 text-blue-800',
      [ActivityType.SCORE_DELETED]: 'bg-red-100 text-red-800'
    }
    
    return actionColors[action] || 'bg-gray-100 text-gray-800'
  }

  // Show loading spinner during authentication check
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading text={ACTIONS.CHECKING_AUTHENTICATION} />
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">{DESCRIPTIONS.AUTHENTICATION_REQUIRED}</h2>
            <p className="text-muted-foreground mb-6">
              {DESCRIPTIONS.PLEASE_SIGN_IN}
            </p>
            <Button onClick={() => router.push('/auth/signin')}>
              {NAV.SIGN_IN}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Activity className="h-8 w-8" />
              {NAV.ACTIVITY_LOGS}
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            {DESCRIPTIONS.SYSTEM_ACTIVITIES}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            {ACTIONS.FILTER}
          </Button>
          <Button variant="outline" onClick={loadActivityLogs}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {ACTIONS.RELOAD}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{DESCRIPTIONS.TOTAL_LOGS}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.totalCount}</div>
            <p className="text-xs text-muted-foreground">
              {DESCRIPTIONS.ACTIVITY_RECORDS}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{LABELS.THIS_PAGE}</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityLogs.length}</div>
            <p className="text-xs text-muted-foreground">
              {DESCRIPTIONS.SHOWING_NOW}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{LABELS.CURRENT_PAGE}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pagination.page} / {pagination.totalPages || 1}
            </div>
            <p className="text-xs text-muted-foreground">
              {DESCRIPTIONS.CURRENT_PAGE}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{LABELS.YOUR_ROLE}</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.role ? USER_ROLES[user.role as keyof typeof USER_ROLES] || user.role : ''}</div>
            <p className="text-xs text-muted-foreground">
              {DESCRIPTIONS.VIEW_PERMISSIONS}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                {LABELS.FILTERS}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  {ACTIONS.CLEAR_ALL}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                  {ACTIONS.HIDE}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">{LABELS.ACTION_TYPE}</label>
                <Select 
                  value={filters.action} 
                  onValueChange={(value) => handleFilterChange('action', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={PLACEHOLDERS.ALL_ACTIONS} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{PLACEHOLDERS.ALL_ACTIONS}</SelectItem>
                    <SelectItem value={ActivityType.USER_REGISTERED}>{ACTIVITY_TYPES.USER_REGISTERED}</SelectItem>
                    <SelectItem value={ActivityType.USER_LOGIN}>{ACTIVITY_TYPES.USER_LOGIN}</SelectItem>
                    <SelectItem value={ActivityType.GROUP_CREATED}>{ACTIVITY_TYPES.GROUP_CREATED}</SelectItem>
                    <SelectItem value={ActivityType.MEMBER_ADDED}>{ACTIVITY_TYPES.MEMBER_ADDED}</SelectItem>
                    <SelectItem value={ActivityType.SCORING_RULE_CREATED}>{ACTIVITY_TYPES.SCORING_RULE_CREATED}</SelectItem>
                    <SelectItem value={ActivityType.SCORE_RECORDED}>{ACTIVITY_TYPES.SCORE_RECORDED}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">{LABELS.START_DATE}</label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">{LABELS.END_DATE}</label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <CardTitle>{DESCRIPTIONS.RECENT_ACTIVITY}</CardTitle>
          <CardDescription>
            {DESCRIPTIONS.SYSTEM_ACTIVITIES_USER_ACTIONS}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loading text={DESCRIPTIONS.LOADING_ACTIVITY_LOGS} />
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error || fallbackError}</p>
              <Button onClick={loadActivityLogs} variant="outline">
                {ACTIONS.TRY_AGAIN}
              </Button>
            </div>
          ) : activityLogs.length > 0 ? (
            <div className="space-y-4">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getActionBadgeVariant(log.action)}>
                        {ACTIVITY_TYPES[log.action] || log.action.replace(/_/g, ' ').toLowerCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                    
                    <p className="font-medium mb-1">{log.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {log.user && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{log.user.name || log.user.email}</span>
                        </div>
                      )}
                      
                      {log.group && (
                        <div className="flex items-center gap-1">
                          <Group className="h-3 w-3" />
                          <span>{log.group.name}</span>
                        </div>
                      )}
                    </div>

                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                          {DESCRIPTIONS.VIEW_DETAILS}
                        </summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">{DESCRIPTIONS.NO_ACTIVITY_LOGS_FOUND}</p>
              <p className="text-sm">
                {Object.values(filters).some(f => f)
                  ? DESCRIPTIONS.TRY_ADJUSTING_FILTER_CRITERIA
                  : DESCRIPTIONS.NO_ACTIVITIES_RECORDED_YET
                }
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                {DESCRIPTIONS.SHOWING_RANGE_RESULTS
                  .replace('{start}', ((pagination.page - 1) * pagination.limit + 1).toString())
                  .replace('{end}', Math.min(pagination.page * pagination.limit, pagination.totalCount).toString())
                  .replace('{total}', pagination.totalCount.toString())
                }
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {ACTIONS.PREVIOUS_PAGE}
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                >
                  {ACTIONS.NEXT_PAGE}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
