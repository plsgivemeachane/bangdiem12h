'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Trophy,
  Calendar,
  Users,
  Filter,
  RefreshCw,
  Search,
  Building
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import toast from 'react-hot-toast'

interface ScoreRecord {
  id: string
  points: number
  criteria: any
  notes?: string
  recordedAt: string
  rule: {
    id: string
    name: string
    points: number
  }
  user: {
    id: string
    name?: string
    email: string
  }
  group: {
    id: string
    name: string
  }
}

interface ScoreRecordsResponse {
  scoreRecords: ScoreRecord[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export default function AllScoreRecordsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [scoreRecords, setScoreRecords] = useState<ScoreRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    searchUser: '',
    searchGroup: ''
  })
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false
  })

  // Load score records on mount and when filters change
  useEffect(() => {
    if (isAuthenticated) {
      loadScoreRecords()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, filters.startDate, filters.endDate])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin')
      return
    }
  }, [isAuthenticated, authLoading, router])

  const loadScoreRecords = async (offset = 0) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (offset > 0) params.append('offset', offset.toString())
      
      const response = await fetch(`/api/score-records?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load score records')
      }
      
      const data: ScoreRecordsResponse = await response.json()
      
      if (offset === 0) {
        setScoreRecords(data.scoreRecords)
      } else {
        // Append for pagination
        setScoreRecords(prev => [...prev, ...data.scoreRecords])
      }
      
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to load score records:', error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to load score records')
      }
      toast.error('Failed to load score records')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    loadScoreRecords(0)
  }

  const handleFilterChange = () => {
    loadScoreRecords(0)
  }

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      searchUser: '',
      searchGroup: ''
    })
  }

  const loadMoreRecords = () => {
    if (!isLoading && pagination.hasMore) {
      loadScoreRecords(pagination.offset + pagination.limit)
    }
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filter records based on search criteria
  const filteredRecords = scoreRecords.filter(record => {
    if (filters.searchUser) {
      const searchTerm = filters.searchUser.toLowerCase()
      const userName = record.user.name?.toLowerCase() || record.user.email.toLowerCase()
      if (!userName.includes(searchTerm)) return false
    }
    
    if (filters.searchGroup) {
      const searchTerm = filters.searchGroup.toLowerCase()
      const groupName = record.group.name.toLowerCase()
      if (!groupName.includes(searchTerm)) return false
    }
    
    return true
  })

  // Calculate stats
  const totalPoints = filteredRecords.reduce((sum, record) => sum + (record.points || 0), 0)
  const averagePoints = filteredRecords.length > 0 ? totalPoints / filteredRecords.length : 0
  const uniqueUsers = new Set(filteredRecords.map(r => r.user.id)).size
  const uniqueGroups = new Set(filteredRecords.map(r => r.group.id)).size

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
              Vui lòng đăng nhập để xem tất cả bản ghi điểm số.
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
  if (isLoading && scoreRecords.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading text="Đang tải bản ghi điểm số..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.push('/dashboard')} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Quay lại dashboard</span>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Trophy className="h-8 w-8" />
                Tất cả bản ghi điểm số
              </h1>
            </div>
            <p className="text-muted-foreground mt-1">
              Xem tất cả hoạt động chấm điểm trên tất cả nhóm
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Tải lại
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? 'Ẩn' : 'Hiển thị'} bộ lọc
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng điểm</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints}</div>
            <p className="text-xs text-muted-foreground">
              Tất cả bản ghi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bản ghi</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredRecords.length}</div>
            <p className="text-xs text-muted-foreground">
              Số lần ghi điểm
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
            <Avatar className="h-4 w-4">
              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                U
              </AvatarFallback>
            </Avatar>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">
              Có bản ghi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nhóm</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueGroups}</div>
            <p className="text-xs text-muted-foreground">
              Có hoạt động
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
                Bộ lọc và tìm kiếm
              </CardTitle>
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Xóa tất cả
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Ngày bắt đầu</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Ngày kết thúc</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tìm người dùng</label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Tên hoặc email..."
                    value={filters.searchUser}
                    onChange={(e) => setFilters({ ...filters, searchUser: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-input rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Tìm nhóm</label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Tên nhóm..."
                    value={filters.searchGroup}
                    onChange={(e) => setFilters({ ...filters, searchGroup: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-input rounded-md"
                  />
                </div>
              </div>
            </div>
            <Button className="mt-4" onClick={handleFilterChange}>
              Áp dụng bộ lọc
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => loadScoreRecords(0)}>Thử lại</Button>
          </CardContent>
        </Card>
      )}

      {/* Score Records */}
      <Card>
        <CardHeader>
          <CardTitle>Bản ghi điểm số</CardTitle>
          <CardDescription>
            Tất cả hoạt động chấm điểm trên hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRecords && filteredRecords.length > 0 ? (
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">
                          {record.rule?.name || 'Quy tắc không xác định'}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {record.group.name}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-4 w-4">
                            <AvatarImage
                              src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(record.user.name || record.user.email)}`}
                              alt={record.user.name || 'User'}
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {(record.user.name || record.user.email).substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{record.user.name || record.user.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(record.recordedAt)}</span>
                        </div>
                      </div>
                      {record.notes && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          <strong>Ghi chú:</strong> {record.notes}
                        </p>
                      )}
                      {record.criteria && Object.keys(record.criteria).length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          <strong>Tiêu chí:</strong> {JSON.stringify(record.criteria)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-primary">
                      +{record.points}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      điểm
                    </p>
                    <p className="text-xs text-muted-foreground">
                     Điểm quy tắc: +{record.rule.points}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Load More Button */}
              {pagination.hasMore && (
                <div className="text-center pt-4">
                  <Button 
                    variant="outline" 
                    onClick={loadMoreRecords}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Đang tải...' : 'Tải thêm'}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Chưa có bản ghi điểm nào</p>
              <p className="text-sm mb-4">
                {filters.startDate || filters.endDate || filters.searchUser || filters.searchGroup
                  ? 'Không tìm thấy bản ghi nào phù hợp với bộ lọc.'
                  : 'Chưa có hoạt động chấm điểm nào trên hệ thống.'}
              </p>
              {(filters.startDate || filters.endDate || filters.searchUser || filters.searchGroup) && (
                <Button variant="outline" onClick={handleClearFilters}>
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}