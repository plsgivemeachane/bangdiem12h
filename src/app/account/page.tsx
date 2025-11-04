'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loading } from '@/components/ui/loading'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Calendar, Shield, Users, Trophy, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface UserStats {
  totalGroups: number
  totalScoreRecords: number
  totalPoints: number
}

export default function AccountPage() {
  const { user, isAuthenticated, isLoading: authLoading, refreshSession } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState('')
  const [stats, setStats] = useState<UserStats>({
    totalGroups: 0,
    totalScoreRecords: 0,
    totalPoints: 0,
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      fetchUserStats()
    }
  }, [user])

  const fetchUserStats = async () => {
    try {
      const [groupsRes, scoresRes] = await Promise.all([
        fetch('/api/groups'),
        fetch('/api/score-records'),
      ])

      if (groupsRes.ok) {
        const groupsData = await groupsRes.json()
        setStats(prev => ({
          ...prev,
          totalGroups: groupsData.groups?.length || 0,
        }))
      }

      if (scoresRes.ok) {
        const scoresData = await scoresRes.json()
        const records = scoresData.records || []
        const totalPoints = records.reduce((sum: number, record: any) => sum + record.points, 0)
        setStats(prev => ({
          ...prev,
          totalScoreRecords: records.length,
          totalPoints,
        }))
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể cập nhật hồ sơ')
      }

      await refreshSession()
      toast.success('Cập nhật hồ sơ thành công')
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string | null, email: string | null): string => {
    if (name) {
      const parts = name.trim().split(' ')
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  if (authLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading text="Loading profile..." />
      </div>
    )
  }

  const initials = getInitials(user.name, user.email)

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Account Profile</h1>
        <p className="text-muted-foreground">Manage your account information and view your activity</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{user.name || 'User'}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{user.name || 'Not set'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                  {user.emailVerified && (
                    <Badge variant="outline" className="ml-2">Verified</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{user.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : 'Unknown'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setName(user.name || '')
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Statistics</CardTitle>
            <CardDescription>Your activity overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Groups</p>
                <p className="text-2xl font-bold">{stats.totalGroups}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score Records</p>
                <p className="text-2xl font-bold">{stats.totalScoreRecords}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold">{stats.totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
