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

  const handleCreateRule = () => {
    setShowRuleModal(true)
  }

  const handleRuleModalClose = () => {
    setShowRuleModal(false)
  }

  const handleRuleCreated = (newRule: ScoringRule) => {
    // Refresh both lists (new rule will appear in available rules)
    loadGroupData()
    toast.success(`Rule "${newRule.name}" created! Use "Add to Group" button to activate it.`)
  }

  const handleAddRuleToGroup = async (rule: ScoringRule) => {
    try {
      await GroupsApi.addRuleToGroup(groupId, rule.id)
      toast.success(`Rule "${rule.name}" added to group`)
      loadGroupData() // Refresh to show the rule
    } catch (error) {
      console.error('Failed to add rule to group:', error)
      toast.error('Failed to add rule to group')
    }
  }

  const handleRemoveRuleFromGroup = async (rule: ScoringRule) => {
    if (window.confirm(`Are you sure you want to remove the rule "${rule.name}" from this group?`)) {
      try {
        await GroupsApi.removeRuleFromGroup(groupId, rule.id)
        toast.success(`Rule "${rule.name}" removed from group`)
        loadGroupData() // Refresh both lists (rule moves to available)
      } catch (error) {
        console.error('Failed to remove rule from group:', error)
        toast.error('Failed to remove rule from group')
      }
    }
  }

  const handleToggleRule = async (rule: ScoringRule) => {
    try {
      // This would typically call an API to toggle the rule status globally
      toast.success(`Rule "${rule.name}" status updated globally`)
      // For now, just update locally
      setRules(prev => prev.map(r => 
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
              Please sign in to access this group's rules.
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
        <Loading text="Loading group rules..." />
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
                Back to Group
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
                <List className="h-8 w-8" />
                Group Rules
              </h1>
            </div>
            <p className="text-muted-foreground mt-1">
              Managing rules available to {group.name}
            </p>
          </div>
        </div>
        
        {canManageGroup && (
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            {user?.role === 'ADMIN' && (
              <Button onClick={handleCreateRule}>
                <Plus className="mr-2 h-4 w-4" />
                Create Global Rule
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupRules.length}</div>
            <p className="text-xs text-muted-foreground">
              Rules in this group
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Global</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableRules.length}</div>
            <p className="text-xs text-muted-foreground">
              Rules to add
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Point Range</CardTitle>
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
              Points range
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 1: Active Rules in This Group */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>✅</span>
            Active Rules in This Group
          </CardTitle>
          <CardDescription>
            Rules that members can use when recording scores
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
                          {rule.points >= 0 ? `+${rule.points}` : rule.points} pts
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rule.description || 'No description provided'}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>Created {new Date(rule.createdAt).toLocaleDateString()}</span>
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
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <List className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No active rules in this group</p>
              <p className="text-sm">
                Add global rules from the section below to activate them for this group.
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
            Available Global Rules
          </CardTitle>
          <CardDescription>
            Global rules that can be added to this group
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
                          {rule.points >= 0 ? `+${rule.points}` : rule.points} pts
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rule.description || 'No description provided'}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>Created {new Date(rule.createdAt).toLocaleDateString()}</span>
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
                        Add to Group
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No global rules available</p>
              <p className="text-sm mb-4">
                {user?.role === 'ADMIN' 
                  ? 'Create new global rules that can be added to groups.' 
                  : 'Contact an admin to create global rules.'}
              </p>
              {user?.role === 'ADMIN' && (
                <Button onClick={handleCreateRule}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Global Rule
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
