'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Users,
  Trophy,
  Target,
  Activity,
  Filter,
  RefreshCw,
  Download,
  ChevronDown,
  FilterIcon
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import toast from 'react-hot-toast'

interface AnalyticsData {
  period: string
  dateRange: {
    start: string
    end: string
  }
  summary: {
    totalPoints: number
    recordCount: number
    averagePoints: number
    previousPeriod: {
      totalPoints: number
      recordCount: number
      pointsChange: number
      pointsChangePercent: number
    }
  }
  trendData: Array<{
    date: string
    points: number
  }>
  ruleBreakdown: Array<{
    ruleId: string
    name: string
    totalPoints: number
    count: number
    averagePoints: number
  }>
  groupBreakdown: Array<{
    groupId: string
    name: string
    totalPoints: number
    recordCount: number
    averagePoints: number
  }>
}

interface Group {
  id: string
  name: string
  description?: string
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb']

export default function AnalyticsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingGroups, setIsLoadingGroups] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin')
      return
    }
  }, [isAuthenticated, authLoading, router])

  // Load user's groups on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadGroups()
    }
  }, [isAuthenticated])

  // Load analytics data when filters change
  useEffect(() => {
    if (isAuthenticated && !isLoadingGroups) {
      loadAnalyticsData()
    }
  }, [isAuthenticated, timeRange, selectedGroup, isLoadingGroups])

  const loadGroups = async () => {
    try {
      setIsLoadingGroups(true)
      const response = await fetch('/api/groups')

      if (!response.ok) {
        throw new Error('Không thể tải danh sách nhóm')
      }

      const data = await response.json()
      setGroups(data.groups || [])
    } catch (error) {
      console.error('Không thể tải danh sách nhóm:', error)
      toast.error('Không thể tải danh sách nhóm')
    } finally {
      setIsLoadingGroups(false)
    }
  }

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period: timeRange === '7d' ? 'week' : timeRange === '1y' ? 'year' : 'month',
        groupId: selectedGroup === 'all' ? '' : selectedGroup
      })

      const response = await fetch(`/api/analytics?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu phân tích')
      }

      const result = await response.json()
      setAnalyticsData(result.analytics)

    } catch (error) {
      console.error('Không thể tải dữ liệu phân tích:', error)
      setError(error instanceof Error ? error.message : 'Không thể tải dữ liệu phân tích')
      toast.error('Không thể tải dữ liệu phân tích')
    } finally {
      setIsLoading(false)
    }
  }



  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

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
              Vui lòng đăng nhập để xem dữ liệu phân tích.
            </p>
            <Button onClick={() => router.push('/auth/signin')}>
              Đăng nhập
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading text="Đang tải dữ liệu phân tích..." />
      </div>
    )
  }

  if (error || !analyticsData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Không thể tải dữ liệu phân tích</h2>
            <p className="text-muted-foreground mb-6">
              {error || 'Đã xảy ra lỗi khi tải dữ liệu phân tích.'}
            </p>
            <Button onClick={loadAnalyticsData}>
              Thử lại
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
              <BarChart3 className="h-8 w-8" />
              Bảng điều khiển phân tích
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Cung cấp cái nhìn toàn diện về hiệu suất và xu hướng ghi điểm của các nhóm
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Chọn nhóm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả các nhóm</SelectItem>
              {groups.map(group => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 ngày gần đây</SelectItem>
              <SelectItem value="30d">30 ngày gần đây</SelectItem>
              <SelectItem value="90d">90 ngày gần đây</SelectItem>
              <SelectItem value="1y">Năm qua</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={loadAnalyticsData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng điểm</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData.summary.totalPoints)}</div>
            <div className="flex items-center gap-1 text-xs">
              {analyticsData.summary.previousPeriod.pointsChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={analyticsData.summary.previousPeriod.pointsChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(analyticsData.summary.previousPeriod.pointsChangePercent).toFixed(1)}%
              </span>
              <span className="text-muted-foreground">so với kỳ trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lượt ghi điểm</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.summary.recordCount}</div>
            <p className="text-xs text-muted-foreground">
              Trung bình {analyticsData.summary.averagePoints.toFixed(1)} điểm mỗi lượt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {selectedGroup === 'all' ? 'Số nhóm' : 'Chu kỳ'}
            </CardTitle>
            {selectedGroup === 'all' ? (
              <Users className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Calendar className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedGroup === 'all' ? groups.length : analyticsData.period}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedGroup === 'all' ? 'Tổng số nhóm được theo dõi' : 'Chu kỳ phân tích'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quy tắc được sử dụng</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.ruleBreakdown.length}</div>
            <p className="text-xs text-muted-foreground">
              Số quy tắc chấm điểm khác nhau
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Xu hướng</TabsTrigger>
          <TabsTrigger value="breakdown">Phân tích theo nhóm</TabsTrigger>
          <TabsTrigger value="rules">Sử dụng quy tắc</TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Điểm theo thời gian
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="points" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Biểu đồ xu hướng điểm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="points" 
                      stroke="#82ca9d" 
                      strokeWidth={3}
                      dot={{ fill: '#82ca9d' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Group Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-6">
          {selectedGroup === 'all' && analyticsData.groupBreakdown.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Nhóm theo tổng điểm
                  </CardTitle>
                  <CardDescription>
                    Phân bổ điểm giữa các nhóm
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.groupBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="totalPoints"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {analyticsData.groupBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>So sánh hiệu suất nhóm</CardTitle>
                  <CardDescription>
                    Số lượt ghi điểm và tổng điểm theo nhóm
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.groupBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="totalPoints" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Thống kê chi tiết theo nhóm</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.groupBreakdown.map((group, index) => (
                      <div key={group.groupId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS[index % COLORS.length] + '20' }}>
                            <span className="font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{group.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {group.recordCount} lượt ghi
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{group.totalPoints}</p>
                          <p className="text-xs text-muted-foreground">
                            Trung bình: {group.averagePoints.toFixed(1)} điểm/lượt
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Không có dữ liệu phân tích nhóm</h3>
                <p className="text-muted-foreground mb-4">
                  {selectedGroup === 'all' 
                    ? 'Không có dữ liệu để so sánh giữa các nhóm.' 
                    : 'Chọn "Tất cả các nhóm" để xem phân tích và so sánh.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Rules Usage Tab */}
        <TabsContent value="rules" className="space-y-6">
          {analyticsData.ruleBreakdown.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quy tắc theo tổng điểm</CardTitle>
                  <CardDescription>
                    Tổng điểm được cộng cho mỗi quy tắc chấm điểm
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={analyticsData.ruleBreakdown} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="totalPoints" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quy tắc theo số lần sử dụng</CardTitle>
                  <CardDescription>
                    Tần suất mỗi quy tắc được sử dụng
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={analyticsData.ruleBreakdown} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Thống kê chi tiết theo quy tắc</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.ruleBreakdown.map((rule, index) => (
                      <div key={rule.ruleId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="font-bold text-primary">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{rule.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Được sử dụng {rule.count} lần
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{rule.totalPoints}</p>
                          <p className="text-xs text-muted-foreground">
                            Trung bình: {rule.averagePoints.toFixed(1)} điểm/lần
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Không có dữ liệu quy tắc</h3>
                <p className="text-muted-foreground">
                  Không có quy tắc chấm điểm nào được sử dụng trong khoảng thời gian đã chọn.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
