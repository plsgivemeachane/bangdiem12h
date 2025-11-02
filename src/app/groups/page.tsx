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
      console.error('Failed to load groups:', error)
      setError(error instanceof Error ? error.message : 'Failed to load groups')
      toast.error('Failed to load groups')
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
      toast.success('Group deleted successfully')
    } catch (error) {
      console.error('Failed to delete group:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete group')
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
              Please sign in to access your groups.
            </p>
            <Button onClick={() => router.push('/auth/signin')}>
              Sign In
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
          <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground">
            Manage your groups and organize scoring activities
          </p>
        </div>
        <Button onClick={handleCreateGroup}>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGroups}</div>
            <p className="text-xs text-muted-foreground">
              {activeGroups} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Across all groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Records</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScoreRecords}</div>
            <p className="text-xs text-muted-foreground">
              Total recorded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{user?.role.toLowerCase()}</div>
            <p className="text-xs text-muted-foreground">
              Current permission level
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Groups</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadGroups} variant="outline">
                Try Again
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