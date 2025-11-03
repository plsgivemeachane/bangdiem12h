'use client'

import { useState, useEffect } from 'react'
import { Activity, User, Group as GroupIcon, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { ActivityType } from '@/types'
import Link from 'next/link'

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
  } | null
  group: {
    id: string
    name: string
  } | null
}

interface ActivityFeedProps {
  groupId?: string
  userId?: string
  limit?: number
  compact?: boolean
  showViewAll?: boolean
}

export function ActivityFeed({ 
  groupId, 
  userId, 
  limit = 5, 
  compact = false,
  showViewAll = true 
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadActivities()
  }, [groupId, userId, limit])

  const loadActivities = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (groupId) params.set('groupId', groupId)
      if (userId) params.set('userId', userId)
      params.set('limit', limit.toString())
      params.set('page', '1')

      const response = await fetch(`/api/activity-logs?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch activities')
      }

      const data = await response.json()
      setActivities(data.activityLogs || [])
    } catch (error) {
      console.error('Failed to load activities:', error)
      setError(error instanceof Error ? error.message : 'Failed to load activities')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const activityDate = new Date(date)
    const diffMs = now.getTime() - activityDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    
    return activityDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: activityDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const getActionBadgeVariant = (action: ActivityType): string => {
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
      [ActivityType.SCORING_RULE_DELETED]: 'bg-red-100 text-red-800',
      [ActivityType.SCORE_RECORDED]: 'bg-green-100 text-green-800',
      [ActivityType.SCORE_UPDATED]: 'bg-blue-100 text-blue-800',
      [ActivityType.SCORE_DELETED]: 'bg-red-100 text-red-800'
    }
    
    return actionColors[action] || 'bg-gray-100 text-gray-800'
  }

  const formatActionName = (action: ActivityType): string => {
    return action.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (isLoading) {
    return (
      <div className="py-8">
        <Loading text="Loading activities..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-destructive text-sm mb-3">{error}</p>
        <Button variant="outline" size="sm" onClick={loadActivities}>
          Try Again
        </Button>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Activity className="mx-auto h-10 w-10 mb-3 opacity-50" />
        <p className="text-sm">No recent activity</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div 
          key={activity.id} 
          className={compact 
            ? "flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            : "flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          }
        >
          <div className={compact
            ? "w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0"
            : "w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0"
          }>
            <Activity className={compact ? "h-4 w-4 text-primary" : "h-5 w-5 text-primary"} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge className={`${getActionBadgeVariant(activity.action)} text-xs`}>
                {formatActionName(activity.action)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDate(activity.timestamp)}
              </span>
            </div>
            
            <p className={compact ? "text-sm mb-1" : "font-medium mb-1"}>
              {activity.description}
            </p>
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              {activity.user && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{activity.user.name || activity.user.email}</span>
                </div>
              )}
              
              {activity.group && !groupId && (
                <div className="flex items-center gap-1">
                  <GroupIcon className="h-3 w-3" />
                  <span>{activity.group.name}</span>
                </div>
              )}
            </div>

            {!compact && activity.metadata && Object.keys(activity.metadata).length > 0 && (
              <details className="mt-2">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  View details
                </summary>
                <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                  {JSON.stringify(activity.metadata, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      ))}

      {showViewAll && (
        <div className="pt-2">
          <Link 
            href={groupId ? `/activity-logs?groupId=${groupId}` : '/activity-logs'}
            className="w-full"
          >
            <Button variant="outline" size="sm" className="w-full">
              View All Activity
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
