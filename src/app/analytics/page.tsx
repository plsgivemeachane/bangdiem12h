"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  AreaChart,
} from "recharts";
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
  FilterIcon,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserTag } from "@/components/ui/user-tag";
import { useAuth } from "@/hooks/use-auth";
import toast from "react-hot-toast";

interface AnalyticsData {
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
  summary: {
    totalPoints: number;
    recordCount: number;
    averagePoints: number;
    previousPeriod: {
      totalPoints: number;
      recordCount: number;
      pointsChange: number;
      pointsChangePercent: number;
    };
  };
  trendData: Array<{
    date: string;
    points: number;
  }>;
  ruleBreakdown: Array<{
    ruleId: string;
    name: string;
    totalPoints: number;
    count: number;
    averagePoints: number;
  }>;
  groupBreakdown: Array<{
    groupId: string;
    name: string;
    totalPoints: number;
    recordCount: number;
    averagePoints: number;
  }>;
}

interface Group {
  id: string;
  name: string;
  description?: string;
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
  "#8dd1e1",
  "#d084d0",
  "#ffb347",
  "#87ceeb",
];

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [dailyAnalyticsData, setDailyAnalyticsData] =
    useState<AnalyticsData | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingDaily, setIsLoadingDaily] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d",
  );
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [scoreRecords, setScoreRecords] = useState<any[]>([]);
  const [scoreRecordsPagination, setScoreRecordsPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  });
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [selectedTab, setSelectedTab] = useState("trends");

  // Tab options for mobile Select component
  const tabOptions = [
    { value: "trends", label: "Xu hướng" },
    { value: "breakdown", label: "Phân tích theo nhóm" },
    { value: "rules", label: "Sử dụng quy tắc" },
    { value: "below-trending", label: "Bản ghi điểm gần đây" },
  ];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin");
      return;
    }
  }, [isAuthenticated, authLoading, router]);

  // Load user's groups on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadGroups();
    }
  }, [isAuthenticated]);

  // Load analytics data when filters change
  useEffect(() => {
    if (isAuthenticated && !isLoadingGroups) {
      loadAnalyticsData();
      loadDailyAnalyticsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, timeRange, selectedGroup, isLoadingGroups]);

  // Load score records when filters change
  useEffect(() => {
    if (isAuthenticated && !isLoadingGroups) {
      loadScoreRecords(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, timeRange, selectedGroup, isLoadingGroups]);

  const loadGroups = async () => {
    try {
      setIsLoadingGroups(true);
      const response = await fetch("/api/groups");

      if (!response.ok) {
        throw new Error("Không thể tải danh sách nhóm");
      }

      const data = await response.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error("Không thể tải danh sách nhóm:", error);
      toast.error("Không thể tải danh sách nhóm");
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        period:
          timeRange === "7d" ? "week" : timeRange === "1y" ? "year" : "month",
        groupId: selectedGroup === "all" ? "" : selectedGroup,
      });

      const response = await fetch(`/api/analytics?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu phân tích");
      }

      const result = await response.json();
      setAnalyticsData(result.analytics);
    } catch (error) {
      console.error("Không thể tải dữ liệu phân tích:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Không thể tải dữ liệu phân tích",
      );
      toast.error("Không thể tải dữ liệu phân tích");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDailyAnalyticsData = async () => {
    try {
      setIsLoadingDaily(true);

      const params = new URLSearchParams({
        period:
          timeRange === "7d" ? "week" : timeRange === "1y" ? "year" : "month",
        groupId: selectedGroup === "all" ? "" : selectedGroup,
      });

      const response = await fetch(`/api/analytics/daily?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu phân tích hàng ngày");
      }

      const result = await response.json();
      setDailyAnalyticsData(result.analytics);
    } catch (error) {
      console.error("Không thể tải dữ liệu phân tích hàng ngày:", error);
      // Don't show error toast for daily data since it's secondary
      setDailyAnalyticsData(null);
    } finally {
      setIsLoadingDaily(false);
    }
  };

  const loadScoreRecords = async (offset = 0) => {
    try {
      setIsLoadingRecords(true);

      // Calculate date range based on timeRange
      const endDate = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case "7d":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(endDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(endDate.getDate() - 90);
          break;
        case "1y":
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const params = new URLSearchParams({
        limit: scoreRecordsPagination.limit.toString(),
        offset: offset.toString(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      if (selectedGroup !== "all") {
        params.set("groupId", selectedGroup);
      }

      const response = await fetch(`/api/score-records?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Không thể tải danh sách bản ghi điểm");
      }

      const result = await response.json();

      if (offset === 0) {
        setScoreRecords(result.scoreRecords);
      } else {
        setScoreRecords((prev) => [...prev, ...result.scoreRecords]);
      }

      setScoreRecordsPagination(result.pagination);
    } catch (error) {
      console.error("Không thể tải danh sách bản ghi điểm:", error);
      toast.error("Không thể tải danh sách bản ghi điểm");
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const loadMoreRecords = () => {
    if (!isLoadingRecords && scoreRecordsPagination.hasMore) {
      const newOffset =
        scoreRecordsPagination.offset + scoreRecordsPagination.limit;
      loadScoreRecords(newOffset);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Transform group breakdown data for Pie Chart - convert negative values to 0 for display only
  const getPieChartData = () => {
    if (!analyticsData?.groupBreakdown) return [];
    return analyticsData.groupBreakdown.map((group) => ({
      ...group,
      totalPoints: Math.max(0, group.totalPoints), // Display negative values as 0 in pie chart
    }));
  };

  // Show loading spinner during authentication check
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading text="Đang kiểm tra xác thực..." />
      </div>
    );
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
            <Button onClick={() => router.push("/auth/signin")}>
              Đăng nhập
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading text="Đang tải dữ liệu phân tích..." />
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">
              Không thể tải dữ liệu phân tích
            </h2>
            <p className="text-muted-foreground mb-6">
              {error || "Đã xảy ra lỗi khi tải dữ liệu phân tích."}
            </p>
            <Button onClick={loadAnalyticsData}>Thử lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8" />
                Bảng điều khiển phân tích
              </h1>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              Cung cấp cái nhìn toàn diện về hiệu suất và xu hướng ghi điểm của
              các nhóm
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-full sm:w-40 min-w-[140px]">
                <SelectValue placeholder="Chọn nhóm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả các nhóm</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={timeRange}
              onValueChange={(value: any) => setTimeRange(value)}
            >
              <SelectTrigger className="w-full sm:w-32 min-w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 ngày gần đây</SelectItem>
                <SelectItem value="30d">30 ngày gần đây</SelectItem>
                <SelectItem value="90d">90 ngày gần đây</SelectItem>
                <SelectItem value="1y">Năm qua</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                loadAnalyticsData();
                loadDailyAnalyticsData();
                loadScoreRecords(0);
              }}
              className="whitespace-nowrap"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Làm mới</span>
            </Button>
          </div>
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
            <div className="text-2xl font-bold">
              {formatNumber(analyticsData.summary.totalPoints)}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {analyticsData.summary.previousPeriod.pointsChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span
                className={
                  analyticsData.summary.previousPeriod.pointsChange >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {Math.abs(
                  analyticsData.summary.previousPeriod.pointsChangePercent,
                ).toFixed(1)}
                %
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
            <div className="text-2xl font-bold">
              {analyticsData.summary.recordCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Trung bình {analyticsData.summary.averagePoints.toFixed(1)} điểm
              mỗi lượt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {selectedGroup === "all" ? "Số nhóm" : "Chu kỳ"}
            </CardTitle>
            {selectedGroup === "all" ? (
              <Users className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Calendar className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedGroup === "all" ? groups.length : analyticsData.period}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedGroup === "all"
                ? "Tổng số nhóm được theo dõi"
                : "Chu kỳ phân tích"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Quy tắc được sử dụng
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.ruleBreakdown.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Số quy tắc chấm điểm khác nhau
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-6"
      >
        {/* Mobile: Select dropdown, Desktop: Grid layout */}
        {/* Mobile Select - hidden on desktop */}
        <div className="md:hidden">
          <Select value={selectedTab} onValueChange={setSelectedTab}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn chế độ xem" />
            </SelectTrigger>
            <SelectContent>
              {tabOptions.map((tab) => (
                <SelectItem key={tab.value} value={tab.value}>
                  {tab.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop TabsList - hidden on mobile */}
        <TabsList className="hidden md:grid md:grid-cols-4 gap-2 md:gap-1 w-full">
          <TabsTrigger
            value="trends"
            className="w-full justify-center py-2 text-center font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Xu hướng
          </TabsTrigger>
          <TabsTrigger
            value="breakdown"
            className="w-full justify-center py-2 text-center font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Phân tích theo nhóm
          </TabsTrigger>
          <TabsTrigger
            value="rules"
            className="w-full justify-center py-2 text-center font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Sử dụng quy tắc
          </TabsTrigger>
          <TabsTrigger
            value="below-trending"
            className="w-full justify-center py-2 text-center font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Bản ghi điểm gần đây
          </TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          {analyticsData.trendData.length > 0 ? (
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
                  {isLoadingDaily ? (
                    <div className="flex justify-center items-center h-[300px]">
                      <Loading text="Đang tải dữ liệu hàng ngày..." />
                    </div>
                  ) : dailyAnalyticsData &&
                    dailyAnalyticsData.trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dailyAnalyticsData.trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="points"
                          fill="#82ca9d"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex justify-center items-center h-[300px] text-muted-foreground">
                      <div className="text-center">
                        <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Không có dữ liệu hàng ngày</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Không có dữ liệu xu hướng
                </h3>
                <p className="text-muted-foreground">
                  Không có dữ liệu xu hướng điểm nào trong khoảng thời gian đã
                  chọn.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Group Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-6">
          {analyticsData.groupBreakdown.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Nhóm theo tổng điểm
                  </CardTitle>
                  <CardDescription>Phân bổ điểm giữa các nhóm</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getPieChartData()}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="totalPoints"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {getPieChartData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
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
                      <div
                        key={group.groupId}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor:
                                COLORS[index % COLORS.length] + "20",
                            }}
                          >
                            <span
                              className="font-bold"
                              style={{ color: COLORS[index % COLORS.length] }}
                            >
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
                          <p className="text-2xl font-bold">
                            {group.totalPoints}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Trung bình: {group.averagePoints.toFixed(1)}{" "}
                            điểm/lượt
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
                <h3 className="text-lg font-semibold mb-2">
                  Không có dữ liệu nhóm
                </h3>
                <p className="text-muted-foreground">
                  Không có dữ liệu so sánh nhóm nào trong khoảng thời gian đã
                  chọn.
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
                    <BarChart
                      data={analyticsData.ruleBreakdown}
                      layout="vertical"
                    >
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
                    <BarChart
                      data={analyticsData.ruleBreakdown}
                      layout="vertical"
                    >
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
                      <div
                        key={rule.ruleId}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10">
                            <span className="font-bold text-primary">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{rule.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Được sử dụng {rule.count} lần
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {rule.totalPoints}
                          </p>
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
                <h3 className="text-lg font-semibold mb-2">
                  Không có dữ liệu quy tắc
                </h3>
                <p className="text-muted-foreground">
                  Không có quy tắc chấm điểm nào được sử dụng trong khoảng thời
                  gian đã chọn.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recent Score Records Tab - Mobile Optimized */}
        <TabsContent value="below-trending" className="space-y-4">
          {isLoadingRecords ? (
            <Card>
              <CardContent className="text-center py-12">
                <Loading text="Đang tải danh sách bản ghi điểm..." />
              </CardContent>
            </Card>
          ) : scoreRecords.length > 0 ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5" />
                    Bản ghi điểm gần đây
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Danh sách tất cả bản ghi điểm được sắp xếp theo thời gian
                    gần nhất
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {scoreRecords.map((record, index) => (
                      <div
                        key={record.id}
                        className="p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors touch-manipulation"
                      >
                        {/* Mobile-first layout */}
                        <div className="flex items-start justify-between gap-3">
                          {/* Left side - User and Group info */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-primary/10 flex-shrink-0">
                              <span className="font-bold text-primary text-xs sm:text-sm">
                                {index + 1}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <UserTag
                                  name={record.user.name || record.user.email}
                                  email={record.user.email}
                                  size="sm"
                                  className="truncate"
                                />
                                <span className="text-muted-foreground text-xs hidden sm:inline">
                                  •
                                </span>
                                <span className="text-sm text-muted-foreground truncate">
                                  {record.group.name}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {record.rule.name}
                              </p>
                            </div>
                          </div>

                          {/* Right side - Points and Date */}
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <Badge
                              variant={
                                record.points >= 0 ? "default" : "destructive"
                              }
                              className="min-w-[50px] sm:min-w-[60px] text-center"
                            >
                              {record.points > 0 ? "+" : ""}
                              {record.points}
                            </Badge>
                            <p className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDate(record.recordedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {scoreRecordsPagination.hasMore && (
                    <div className="mt-6 text-center">
                      <Button
                        variant="outline"
                        onClick={loadMoreRecords}
                        disabled={isLoadingRecords}
                        className="w-full sm:w-auto"
                      >
                        {isLoadingRecords ? "Đang tải..." : "Tải thêm"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Không có bản ghi điểm
                </h3>
                <p className="text-muted-foreground">
                  Chưa có bản ghi điểm nào trong khoảng thời gian đã chọn.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
