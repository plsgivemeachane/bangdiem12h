'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Trophy, 
  Plus,
  Calendar,
  TrendingUp,
  Users,
  Target,
  Award,
  Filter,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { ScoreRecordingModal } from '@/components/ui/score-recording-modal'
import { GroupsApi } from '@/lib/api/groups'
import { useAuth } from '@/hooks/use-auth'
import { Group } from '@/types'
import toast from 'react-hot-toast'

export default function GroupScoringPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [group, setGroup] = useState<Group | null>(null)
  const [scoreRecords, setScoreRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRecordingScore, setIsRecordingScore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showScoreModal, setShowScoreModal] = useState(false)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  })

  // Load group and score data on mount
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
      
      // Load group details and score records in parallel
      const [groupData, scoreData] = await Promise.all([
        GroupsApi.getGroup(groupId),
        GroupsApi.getScoreRecords(groupId, {
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          limit: 50
        })
      ])
      
      setGroup(groupData)
      setScoreRecords(scoreData.scoreRecords)
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

  const handleRefresh = () => {
    loadGroupData()
  }

  const handleFilterChange = () => {
    loadGroupData()
  }

  const handleRecordScore = () => {
    if (group?.scoringRules && group.scoringRules.filter(rule => rule.isActive).length > 0) {
      setShowScoreModal(true)
    } else {
      toast.error('No active scoring rules available for this group')
    }
  }

  const handleScoreModalClose = () => {
    setShowScoreModal(false)
  }

  const handleScoreRecorded = (newScoreRecord: any) => {
    // Add the new score record to the list
    setScoreRecords(prev => [newScoreRecord, ...prev])
    toast.success(`Score of ${newScoreRecord.points} points recorded!`)
  }

  // Get user's role in the group
  const userRole = group?.members?.find(member => member.userId === user?.id)?.role || 'VIEWER'
  const canRecordScores = userRole !== 'VIEWER'

  // Calculate stats
  const totalPoints = scoreRecords.reduce((sum, record) => sum + (record.points || 0), 0)
  const averagePoints = scoreRecords.length > 0 ? totalPoints / scoreRecords.length : 0
  const thisWeekRecords = scoreRecords.filter(record => {
    const recordDate = new Date(record.recordedAt)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return recordDate >= weekAgo
  })

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
              Please sign in to access this group's scoring.
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
        <Loading text="Loading scoring data..." />
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
                <Trophy className="h-8 w-8" />
                Scoring
              </h1>
            </div>
            <p className="text-muted-foreground mt-1">
              Score tracking for {group.name}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {canRecordScores && (
            <Button onClick={handleRecordScore} disabled={isRecordingScore}>
              <Plus className="mr-2 h-4 w-4" />
              Record Score
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Records</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scoreRecords.length}</div>
            <p className="text-xs text-muted-foreground">
              Score entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(averagePoints * 10) / 10}</div>
            <p className="text-xs text-muted-foreground">
              Points per record
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisWeekRecords.length}</div>
            <p className="text-xs text-muted-foreground">
              Recent activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide' : 'Show'}
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md"
                />
              </div>
            </div>
            <Button className="mt-4" onClick={handleFilterChange}>
              Apply Filters
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Score Records */}
      <Card>
        <CardHeader>
          <CardTitle>Score Records</CardTitle>
          <CardDescription>
            Your scoring activity in this group
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scoreRecords && scoreRecords.length > 0 ? (
            <div className="space-y-4">
              {scoreRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{record.rule?.name || 'Unknown Rule'}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(record.recordedAt)}</span>
                      </div>
                      {record.notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {record.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      +{record.points}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      points
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No score records yet</p>
              <p className="text-sm mb-4">
                {canRecordScores ? 'Record your first score to get started.' : 'No scores have been recorded in this group yet.'}
              </p>
              {canRecordScores && (
                <Button onClick={handleRecordScore} disabled={isRecordingScore}>
                  <Plus className="mr-2 h-4 w-4" />
                  Record First Score
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scoring Rules Reference */}
      {group.scoringRules && group.scoringRules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Scoring Rules</CardTitle>
            <CardDescription>
              Rules you can use to record scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.scoringRules.filter(rule => rule.isActive).map((rule) => (
                <div key={rule.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{rule.name}</h3>
                    <Badge variant="outline" className="text-primary">
                      +{rule.points} pts
                    </Badge>
                  </div>
                  {rule.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {rule.description}
                    </p>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Created {formatDate(rule.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score Recording Modal */}
      <ScoreRecordingModal
        isOpen={showScoreModal}
        onClose={handleScoreModalClose}
        onScoreRecorded={handleScoreRecorded}
        groupId={groupId}
        groupName={group.name}
        availableRules={group?.scoringRules || []}
      />
    </div>
  )
}