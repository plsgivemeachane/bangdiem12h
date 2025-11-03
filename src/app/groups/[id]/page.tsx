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
import { GroupsApi } from '@/lib/api/groups'
import { useAuth } from '@/hooks/use-auth'
import { Group, GroupMember } from '@/types'
import toast from 'react-hot-toast'

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [group, setGroup] = useState<Group | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          setError('Group not found or you do not have access to this group.')
        } else if (error.message.includes('Access denied')) {
          setError('You do not have permission to view this group.')
        } else {
          setError(error.message)
        }
      } else {
        setError('Failed to load group details')
      }
      toast.error('Failed to load group details')
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

  // Check if user has permission to manage group
  const canManageGroup = group?.members?.some(
    member => member.userId === user?.id && ['OWNER', 'ADMIN'].includes(member.role)
  ) || false

  // Show loading spinner during authentication check
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading text="Checking authentication..." />
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to access this group.
            </p>
            <Button onClick={() => router.push('/auth/signin')}>
              Sign In
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
        <Loading text="Loading group details..." />
      </div>
    )
  }

  // Error state
  if (error || !group) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Group Not Found</h2>
            <p className="text-muted-foreground mb-6">
              {error || 'The group you are looking for does not exist.'}
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleBackToGroups} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Groups
              </Button>
              <Button onClick={loadGroup}>
                Try Again
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
            Back to Groups
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
              <Badge variant={group.isActive ? "default" : "secondary"}>
                {group.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {group.description && (
              <p className="text-muted-foreground mt-1">{group.description}</p>
            )}
          </div>
        </div>
        
        {canManageGroup && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Group
            </Button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{group.members?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active participants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{userRole.toLowerCase()}</div>
            <p className="text-xs text-muted-foreground">
              Permission level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Records</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{group._count?.scoreRecords || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total recorded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scoring Rules</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{group.scoringRules?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active rules
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
              Members
            </CardTitle>
            <CardDescription>
              Manage group members and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {group.members?.length || 0} members in this group
              </div>
              <Button 
                onClick={handleManageMembers}
                className="w-full"
                variant={canManageGroup ? "default" : "outline"}
                disabled={!canManageGroup}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Manage Members
              </Button>
              {userRole === 'VIEWER' && (
                <p className="text-xs text-muted-foreground">
                  Contact an admin to manage members
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
              Scoring Rules
            </CardTitle>
            <CardDescription>
              Configure how points are awarded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {group.scoringRules?.length || 0} active scoring rules
              </div>
              <Button 
                onClick={handleViewRules}
                className="w-full"
                variant="outline"
              >
                <Settings className="mr-2 h-4 w-4" />
                View Rules
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Score Recording */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Scoring
            </CardTitle>
            <CardDescription>
              Record and view scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {group._count?.scoreRecords || 0} score records
              </div>
              <Button 
                onClick={handleViewScoring}
                className="w-full"
                variant="outline"
              >
                <Activity className="mr-2 h-4 w-4" />
                View Scores
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Group Members</CardTitle>
          <CardDescription>
            People who have access to this group
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
                      <p className="font-medium">{member.user?.name || 'Unknown User'}</p>
                      <p className="text-sm text-muted-foreground">{member.user?.email || 'No email'}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {member.role.toLowerCase()}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No members found in this group.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Group Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest actions in this group
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityFeed groupId={group.id} limit={5} compact={true} showViewAll={true} />
        </CardContent>
      </Card>
    </div>
  )
}