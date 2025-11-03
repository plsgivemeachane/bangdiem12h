'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Users, 
  UserPlus, 
  Settings,
  Crown,
  Shield,
  User,
  Trash2,
  Edit
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { MemberInvite } from '@/components/groups/MemberInvite'
import { OwnerTransferDialog } from '@/components/groups/OwnerTransferDialog'
import { GroupsApi } from '@/lib/api/groups'
import { useAuth } from '@/hooks/use-auth'
import { Group, GroupMember } from '@/types'
import toast from 'react-hot-toast'

export default function GroupMembersPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isTransferOwnershipOpen, setIsTransferOwnershipOpen] = useState(false)

  // Load group and members data on mount
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
      
      // Load group details and members in parallel
      const [groupData, membersData] = await Promise.all([
        GroupsApi.getGroup(groupId),
        GroupsApi.getGroupMembers(groupId)
      ])
      
      setGroup(groupData)
      setMembers(membersData)
    } catch (error) {
      console.error('Failed to load group data:', error)
      if (error instanceof Error) {
        if (error.message.includes('Group not found')) {
          setError('Group not found or you do not have access to this group.')
        } else if (error.message.includes('Access denied')) {
          setError('You do not have permission to view this group.')
        } else {
          setError(error.message)
        }
      } else {
        setError('Failed to load group data')
      }
      toast.error('Failed to load group data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToGroup = () => {
    router.push(`/groups/${groupId}`)
  }

  // Check if user has permission to manage group
  const canManageGroup = group?.members?.some(
    member => member.userId === user?.id && ['OWNER', 'ADMIN'].includes(member.role)
  ) || false

  // Get user's role in the group
  const userRole = group?.members?.find(member => member.userId === user?.id)?.role || 'VIEWER'
  const isOwner = userRole === 'OWNER'

  const handleMemberUpdate = (updatedMember: GroupMember) => {
    setMembers(prev => prev.map(member => 
      member.id === updatedMember.id ? updatedMember : member
    ))
    
    // Also update the group object to reflect changes
    if (group) {
      setGroup({
        ...group,
        members: group.members?.map(member => 
          member.id === updatedMember.id ? updatedMember : member
        ) || []
      })
    }
  }

  const handleMemberRemove = (memberId: string) => {
    setMembers(prev => prev.filter(member => member.id !== memberId))
    
    // Also update the group object to reflect changes
    if (group) {
      setGroup({
        ...group,
        members: group.members?.filter(member => member.id !== memberId) || []
      })
    }
  }

  const handleInviteSuccess = (newMember?: GroupMember) => {
    if (newMember) {
      handleMemberUpdate(newMember)
    } else {
      // Refresh members list if no specific member returned
      loadGroupData()
    }
    setIsInviteModalOpen(false)
  }

  const handleTransferSuccess = (newOwner: GroupMember) => {
    // Refresh the entire group data to get updated roles
    loadGroupData()
    setIsTransferOwnershipOpen(false)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="h-4 w-4 text-yellow-600" />
      case 'ADMIN':
        return <Shield className="h-4 w-4 text-blue-600" />
      case 'MEMBER':
        return <User className="h-4 w-4 text-green-600" />
      default:
        return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'default'
      case 'ADMIN':
        return 'secondary'
      case 'MEMBER':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const formatJoinDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
              Please sign in to access this group's members.
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
        <Loading text="Loading group members..." />
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
              <Button onClick={handleBackToGroup} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Groups
              </Button>
              <Button onClick={loadGroupData}>
                Try Again
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
            Back to Group
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Users className="h-8 w-8" />
                Members
              </h1>
            </div>
            <p className="text-muted-foreground mt-1">
              Managing members for {group.name}
            </p>
          </div>
        </div>
        
        {canManageGroup && (
          <div className="flex gap-2">
            {isOwner && (
              <Button 
                onClick={() => setIsTransferOwnershipOpen(true)}
                variant="outline"
              >
                <Crown className="mr-2 h-4 w-4" />
                Transfer Ownership
              </Button>
            )}
            <Button onClick={() => setIsInviteModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
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
            <div className="text-2xl font-bold capitalize flex items-center gap-2">
              {getRoleIcon(userRole)}
              {userRole.toLowerCase()}
            </div>
            <p className="text-xs text-muted-foreground">
              Permission level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.filter(m => ['OWNER', 'ADMIN'].includes(m.role)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Administrators
            </p>
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
          {members && members.length > 0 ? (
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {member.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.user?.name}</p>
                        {member.userId === user?.id && (
                          <Badge variant="outline" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {formatJoinDate(member.joinedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRoleBadgeVariant(member.role)} className="capitalize flex items-center gap-1">
                      {getRoleIcon(member.role)}
                      {member.role.toLowerCase()}
                    </Badge>
                    {canManageGroup && member.userId !== user?.id && !isOwner && (
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {canManageGroup && member.userId !== user?.id && (
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No members found</p>
              <p className="text-sm mb-4">
                {canManageGroup ? 'Add the first member to get started.' : 'No one has been added to this group yet.'}
              </p>
              {canManageGroup && (
                <Button onClick={() => setIsInviteModalOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add First Member
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Member Invite Modal */}
      <MemberInvite
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={handleInviteSuccess}
        groupId={groupId}
      />

      {/* Owner Transfer Dialog */}
      {group && (
        <OwnerTransferDialog
          isOpen={isTransferOwnershipOpen}
          onClose={() => setIsTransferOwnershipOpen(false)}
          onSuccess={handleTransferSuccess}
          groupId={groupId}
          groupName={group.name}
          members={members}
          currentUserId={user?.id || ''}
        />
      )}
    </div>
  )
}