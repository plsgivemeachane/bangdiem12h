"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { RuleCreationModal } from "@/components/ui/rule-creation-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DashboardStats,
  Group,
  ScoringRule,
  GroupStats,
  UserPerformance,
} from "@/types";
import {
  Users,
  Trophy,
  Target,
  Activity,
  Plus,
  Settings,
  Crown,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useAutoPrefetch } from "@/lib/cache/url-patterns";
import {
  DASHBOARD,
  ACTIONS,
  LABELS,
  MESSAGES,
  DESCRIPTIONS,
  PAGE_TITLES,
  USER_ROLES,
  GROUP_ROLES,
  NAV,
  PLACEHOLDERS,
  GLOBAL_RULES,
} from "@/lib/translations";
import toast from "react-hot-toast";

export default function DashboardClient() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  
  // Auto-prefetch high priority routes on component mount
  useAutoPrefetch();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalGroups: 0,
    totalScoreRecords: 0,
    totalPoints: 0,
    recentActivity: [],
  });
  const [groups, setGroups] = useState<Group[]>([]);
  const [globalRules, setGlobalRules] = useState<ScoringRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScoringRulesDialog, setShowScoringRulesDialog] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [totalActivityCount, setTotalActivityCount] = useState<number>(0);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [userScoreRecords, setUserScoreRecords] = useState<any[]>([]);
  const [groupStats, setGroupStats] = useState<any>(null);
  const [enhancedGroupStats, setEnhancedGroupStats] =
    useState<GroupStats | null>(null);

  // Check if user is a regular user (not admin of any groups)
  const isRegularUser =
    user &&
    (!user.role ||
      (user.role !== "ADMIN" &&
        !groups.some((group) =>
          group.members?.some(
            (member: any) =>
              member.userId === user.id &&
              (member.role === "ADMIN" || member.role === "OWNER"),
          ),
        )));

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch groups
      const groupsResponse = await fetch("/api/groups");
      if (!groupsResponse.ok) {
        throw new Error(MESSAGES.ERROR.FAILED_TO_LOAD);
      }
      const groupsData = await groupsResponse.json();
      setGroups(groupsData.groups || []);
      
      // Strategic prefetch: Preload group-specific routes after fetching groups
      // This ensures that when users click on group navigation, pages load instantly
      if (groupsData.groups && groupsData.groups.length > 0) {
        try {
          // Import dynamically to avoid circular dependencies
          const { getRoutesByBasePath, analyzeRoutesForPrefetch } = await import("@/lib/cache/url-patterns");
          
          // Analyze and prefetch group-related routes based on actual group data
          const contextData = {
            isAuthenticated,
            user,
            userRole: user?.role || 'USER',
            groups: groupsData.groups
          };
          
          const groupRoutes = getRoutesByBasePath('/groups', contextData, user?.role || 'USER');
          
          // Create prefetch operations for all routes
          const prefetchOperations: Promise<void>[] = [];
          
          for (const route of groupRoutes.filter(route => route.pattern.priority === 'high')) {
            try {
              // Generate concrete URLs for each group
              if (route.url.includes('/groups/[id]')) {
                // Dynamic routes with group IDs
                groupsData.groups.forEach((group: any) => {
                  if (group?.id) {
                    const concreteUrl = route.url.replace('[id]', group.id);
                    const prefetchPromise = (async () => {
                      await router.prefetch(concreteUrl);
                      console.log(`🔮 Dashboard prefetched: ${concreteUrl}`);
                    })();
                    prefetchOperations.push(prefetchPromise);
                  }
                });
              } else {
                // Static routes
                const prefetchPromise = (async () => {
                  await router.prefetch(route.url);
                  console.log(`🔮 Dashboard prefetched: ${route.url}`);
                })();
                prefetchOperations.push(prefetchPromise);
              }
            } catch (routeError) {
              console.warn(`⚠️ Dashboard route prefetch preparation failed for ${route.url}:`, routeError);
            }
          }
          
          // Execute all prefetches in parallel with error handling
          await Promise.allSettled(prefetchOperations);
        } catch (prefetchError) {
          console.warn('⚠️ Dashboard prefetch initialization failed:', prefetchError);
          // Don't throw - prefetch is best-effort, shouldn't break dashboard
        }
      }

      // Fetch analytics data for stats
      const analyticsResponse = await fetch("/api/analytics?period=month");
      if (!analyticsResponse.ok) {
        throw new Error(MESSAGES.ERROR.FAILED_TO_LOAD);
      }
      const analyticsData = await analyticsResponse.json();

      // Fetch recent activity
      const activityResponse = await fetch(
        "/api/activity-logs?limit=10&page=1",
      );
      const activityData = activityResponse.ok
        ? await activityResponse.json()
        : { activityLogs: [], pagination: { totalCount: 0 } };
      const totalActivityCount = activityData.pagination?.totalCount || 0;

      // Fetch global scoring rules (for admin users)
      let globalRulesData = [];
      if (user?.role === "ADMIN") {
        try {
          const rulesResponse = await fetch("/api/scoring-rules");
          if (rulesResponse.ok) {
            const rulesData = await rulesResponse.json();
            globalRulesData = rulesData.scoringRules || [];
          }
        } catch (error) {
          console.error("Failed to fetch global rules:", error);
        }
      }

      // For regular users, fetch their score records and group stats
      if (isRegularUser && user) {
        try {
          // Fetch user's score records
          const recordsResponse = await fetch(
            "/api/score-records?userId=" + user.id + "&limit=10",
          );
          if (recordsResponse.ok) {
            const recordsData = await recordsResponse.json();
            setUserScoreRecords(recordsData.records || []);
          }

          // Fetch group stats for user's first group (assuming one group per user)
          if (groups.length > 0) {
            const groupStatsResponse = await fetch(
              `/api/analytics?groupId=${groups[0].id}`,
            );
            if (groupStatsResponse.ok) {
              const groupStatsData = await groupStatsResponse.json();
              setGroupStats(groupStatsData.analytics || null);
            }

            // Fetch enhanced group statistics
            const enhancedStatsResponse = await fetch(
              `/api/groups/${groups[0].id}/stats`,
            );
            if (enhancedStatsResponse.ok) {
              const enhancedStatsData = await enhancedStatsResponse.json();
              setEnhancedGroupStats(enhancedStatsData.stats || null);
            }
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }

      // Calculate stats from real data
      setStats({
        totalGroups: groupsData.groups?.length || 0,
        totalScoreRecords: analyticsData.analytics?.summary?.recordCount || 0,
        totalPoints: analyticsData.analytics?.summary?.totalPoints || 0,
        recentActivity: activityData.activityLogs || [],
      });

      // Store total activity count in a separate state for display
      setTotalActivityCount(totalActivityCount);

      // Set global rules for admin users
      setGlobalRules(globalRulesData);
    } catch (err) {
      console.error(MESSAGES.ERROR.FAILED_TO_LOAD + ":", err);
      setError(
        err instanceof Error ? err.message : MESSAGES.ERROR.FAILED_TO_LOAD,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReload = () => {
    fetchDashboardData();
  };

  const handleGroupSelectForRules = (groupId: string) => {
    setSelectedGroupId(groupId);
    setShowScoringRulesDialog(false);
    router.push(`/groups/${groupId}/rules`);
  };

  const handleQuickRulesAccess = () => {
    // If user has only one group, navigate directly
    if (groups.length === 1) {
      router.push(`/groups/${groups[0].id}/rules`);
    } else if (groups.length === 0) {
      // No groups - redirect to create group
      router.push("/groups");
    } else {
      // Multiple groups - show dialog
      setShowScoringRulesDialog(true);
    }
  };

  const handleCreateGlobalRule = () => {
    setShowRuleModal(true);
  };

  const handleRuleModalClose = () => {
    setShowRuleModal(false);
  };

  const handleRuleCreated = (newRule: ScoringRule) => {
    setGlobalRules((prev) => [...prev, newRule]);
    toast.success(`Rule "${newRule.name}" created successfully!`);
  };

  const handleViewAllGlobalRules = () => {
    router.push("/admin/scoring-rules");
  };

  const formatDate = (date: Date | string | null | undefined) => {
    try {
      if (!date) return "--:-- --/--/----";

      const dateObj = date instanceof Date ? date : new Date(date);

      // Check if the date is valid
      if (isNaN(dateObj.getTime())) return "--:-- --/--/----";

      return format(dateObj, "HH:mm dd/MM/yyyy", { locale: vi });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "--:-- --/--/----";
    }
  };

  if (isLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading text={ACTIONS.LOADING_DASHBOARD} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">
              {DASHBOARD.OVERVIEW.AUTHENTICATION_REQUIRED}
            </h2>
            <p className="text-muted-foreground mb-6">
              {DASHBOARD.OVERVIEW.PLEASE_SIGNIN_ACCESS}
            </p>
            <Button asChild>
              <Link href="/auth/signin">{NAV.SIGN_IN}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">
              {DASHBOARD.OVERVIEW.DASHBOARD_LOAD_ERROR}
            </h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={handleReload}>{ACTIONS.RELOAD}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {PAGE_TITLES.DASHBOARD}
        </h1>
        <p className="text-muted-foreground">
          {DASHBOARD.OVERVIEW.WELCOME_BACK}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {DASHBOARD.OVERVIEW.TOTAL_GROUPS_STAT}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGroups}</div>
            <p className="text-xs text-muted-foreground">
              {DASHBOARD.OVERVIEW.TOTAL_GROUPS_DESC}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {DASHBOARD.OVERVIEW.SCORE_RECORDS_STAT}
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScoreRecords}</div>
            <p className="text-xs text-muted-foreground">
              {DASHBOARD.OVERVIEW.SCORE_RECORDS_DESC}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {DASHBOARD.OVERVIEW.TOTAL_POINTS_STAT}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPoints}</div>
            <p className="text-xs text-muted-foreground">
              {DASHBOARD.OVERVIEW.TOTAL_POINTS_DESC}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {DASHBOARD.OVERVIEW.ACTIVITY_STAT}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivityCount}</div>
            <p className="text-xs text-muted-foreground">
              {DASHBOARD.OVERVIEW.TOTAL_ACTIVITY_DESC}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Groups */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{DASHBOARD.OVERVIEW.YOUR_GROUPS_SECTION}</CardTitle>
          </CardHeader>
          <CardContent>
            {groups.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  {DASHBOARD.OVERVIEW.NO_GROUPS_YET}
                </p>
                <Button asChild>
                  <Link href="/groups">
                    <Plus className="h-4 w-4 mr-2" />
                    {DASHBOARD.OVERVIEW.CREATE_GROUP}
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {groups.slice(0, 5).map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between"
                  >
                    <div
                      className="flex-1 cursor-pointer hover:bg-muted/50 p-2 -m-2 rounded transition-colors"
                      onClick={() => router.push(`/groups/${group.id}`)}
                    >
                      <p className="font-medium">{group.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {group._count?.groupRules || 0} {LABELS.RULES}
                      </p>
                    </div>
                    <Badge variant={group.isActive ? "default" : "secondary"}>
                      {group.isActive ? LABELS.ACTIVE : LABELS.INACTIVE}
                    </Badge>
                  </div>
                ))}
                {groups.length > 5 && (
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/groups">
                      {DASHBOARD.OVERVIEW.VIEW_ALL.replace(
                        "{count}",
                        groups.length.toString(),
                      )}
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Regular User Sections */}
        {isRegularUser ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{DESCRIPTIONS.RECORDS_RELATED_TO_ME}</CardTitle>
                <CardDescription>
                  Bản ghi điểm liên quan đến bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                {userScoreRecords.length === 0 ? (
                  <div className="text-center py-6">
                    <Trophy className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      Chưa có bản ghi điểm nào
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userScoreRecords.slice(0, 5).map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div>
                          <p className="font-medium">
                            {record.rule?.name || "Quy tắc không xác định"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(record.recordedAt)} -{" "}
                            {record.notes || "Không có ghi chú"}
                          </p>
                        </div>
                        <Badge
                          variant={
                            record.points >= 0 ? "default" : "destructive"
                          }
                        >
                          {record.points >= 0
                            ? `+${record.points}`
                            : record.points}{" "}
                          điểm
                        </Badge>
                      </div>
                    ))}
                    {userScoreRecords.length > 5 && (
                      <Button variant="outline" size="sm" className="w-full">
                        Xem tất cả ({userScoreRecords.length}) bản ghi
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tổ Stats</CardTitle>
                <CardDescription>Thống kê nhóm của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                {groups.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      Bạn chưa tham gia nhóm nào
                    </p>
                  </div>
                ) : enhancedGroupStats ? (
                  <div className="space-y-4">
                    {/* Group Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">
                        {enhancedGroupStats.group.name}
                      </h3>
                      <Badge
                        variant={
                          enhancedGroupStats.group.isActive
                            ? "default"
                            : "secondary"
                        }
                      >
                        {enhancedGroupStats.group.isActive
                          ? "Hoạt động"
                          : "Không hoạt động"}
                      </Badge>
                    </div>

                    {/* Enhanced Statistics Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Thành viên
                          </span>
                        </div>
                        <p className="text-lg font-semibold">
                          {enhancedGroupStats.totalMembers}
                        </p>
                      </div>

                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Bản ghi tuần này
                          </span>
                        </div>
                        <p className="text-lg font-semibold">
                          {enhancedGroupStats.weeklyRecords}
                        </p>
                      </div>

                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Điểm tuần này
                          </span>
                        </div>
                        <p className="text-lg font-semibold">
                          {enhancedGroupStats.weeklyScore}
                        </p>
                      </div>

                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Quy tắc
                          </span>
                        </div>
                        <p className="text-lg font-semibold">
                          {enhancedGroupStats.activeRules}
                        </p>
                      </div>

                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Crown className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Nhiều điểm nhất
                          </span>
                        </div>
                        <p className="text-sm font-medium">
                          {enhancedGroupStats.topPerformers &&
                          enhancedGroupStats.topPerformers.length > 0
                            ? `${enhancedGroupStats.topPerformers[0].userName.split(" ")[0]} (${enhancedGroupStats.topPerformers[0].totalPoints})`
                            : "N/A"}
                        </p>
                      </div>

                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingDown className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Cần cải thiện
                          </span>
                        </div>
                        <p className="text-sm font-medium">
                          {enhancedGroupStats.bottomPerformers &&
                          enhancedGroupStats.bottomPerformers.length > 0
                            ? `${enhancedGroupStats.bottomPerformers[0].userName} (${enhancedGroupStats.bottomPerformers[0].totalPoints})`
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Performance Rankings */}
                    {(enhancedGroupStats.topPerformers?.length || 0) > 0 ||
                      ((enhancedGroupStats.bottomPerformers?.length || 0) >
                        0 && (
                        <div className="space-y-3 pt-2">
                          <h4 className="font-medium text-sm">
                            Hiệu suất thành viên
                          </h4>

                          {/* Top Performers */}
                          {enhancedGroupStats.topPerformers &&
                            enhancedGroupStats.topPerformers.length > 0 && (
                              <div>
                                <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                  <Crown className="h-3 w-3" />
                                  Top performers
                                </h5>
                                <div className="space-y-1">
                                  {enhancedGroupStats.topPerformers
                                    .slice(0, 3)
                                    .map((performer, index) => (
                                      <div
                                        key={performer.userId}
                                        className="flex items-center justify-between text-sm"
                                      >
                                        <span className="font-medium">
                                          {performer.userName}
                                        </span>
                                        <div className="text-xs text-muted-foreground">
                                          {performer.totalRecords} bản ghi •{" "}
                                          {performer.totalPoints} điểm
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                          {/* Bottom Performers */}
                          {enhancedGroupStats.bottomPerformers &&
                            enhancedGroupStats.bottomPerformers.length > 0 && (
                              <div>
                                <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                  <TrendingDown className="h-3 w-3" />
                                  Cần cải thiện
                                </h5>
                                <div className="space-y-1">
                                  {enhancedGroupStats.bottomPerformers
                                    .slice(0, 3)
                                    .map((member: any, index: number) => (
                                      <div
                                        key={member.userId}
                                        className="flex items-center justify-between text-sm"
                                      >
                                        <span className="font-medium">
                                          {member.userName}
                                        </span>
                                        <div className="text-xs text-muted-foreground">
                                          {member.totalPoints} điểm
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      Đang tải thống kê...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{DASHBOARD.OVERVIEW.QUICK_ACTIONS}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <Link href="/groups">
                    <Plus className="h-4 w-4 mr-2" />
                    {DASHBOARD.OVERVIEW.CREATE_NEW_GROUP}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="w-full justify-start"
                >
                  <Link href="/groups">{DASHBOARD.OVERVIEW.MANAGE_GROUPS}</Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleQuickRulesAccess}
                >
                  {DASHBOARD.OVERVIEW.VIEW_SCORING_RULES}
                </Button>
                <Button asChild className="w-full justify-start">
                  <Link href="/score-records">
                    <Trophy className="h-4 w-4 mr-2" />
                    Score Records
                  </Link>
                </Button>
                {user?.role === "ADMIN" && (
                  <>
                    <Button asChild className="w-full justify-start">
                      <Link href="/admin/scoring-rules">
                        <Settings className="h-4 w-4 mr-2" />
                        {NAV.ADMIN_SCORING_RULES}
                      </Link>
                    </Button>
                    <Button
                      variant="default"
                      className="w-full justify-start"
                      onClick={handleCreateGlobalRule}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {GLOBAL_RULES.CREATE_GLOBAL_RULE}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>{DASHBOARD.OVERVIEW.RECENT_ACTIVITY}</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                <ActivityFeed limit={10} compact={true} showViewAll={true} />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Group Selection Dialog for Scoring Rules */}
      <Dialog
        open={showScoringRulesDialog}
        onOpenChange={setShowScoringRulesDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {DASHBOARD.OVERVIEW.SCORING_RULES_GROUP_SELECT}
            </DialogTitle>
            <DialogDescription>
              {DASHBOARD.OVERVIEW.SCORING_RULES_GROUP_DESC}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="group-select" className="text-sm font-medium">
                {LABELS.GROUP}
              </label>
              <Select onValueChange={handleGroupSelectForRules}>
                <SelectTrigger>
                  <SelectValue placeholder={PLACEHOLDERS.CHOOSE_MEMBER} />
                </SelectTrigger>
                <SelectContent>
                  {groups
                    .filter((group) => group.id && group.id.trim() !== "")
                    .map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{group.name}</span>
                          <Badge
                            variant={group.isActive ? "default" : "secondary"}
                            className="ml-2"
                          >
                            {group.isActive ? LABELS.ACTIVE : LABELS.INACTIVE}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowScoringRulesDialog(false)}
            >
              {ACTIONS.CANCEL}
            </Button>
            <Button asChild>
              <Link href="/groups">{DASHBOARD.OVERVIEW.CREATE_NEW_GROUP}</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Global Scoring Rules Section for Admins */}
      {user?.role === "ADMIN" && globalRules.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {GLOBAL_RULES.GLOBAL_SCORING_RULES}
            </CardTitle>
            <CardDescription>
              {GLOBAL_RULES.MANAGE_GLOBAL_RULES}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {globalRules.slice(0, 3).map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Target className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{rule.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {rule.description || GLOBAL_RULES.NO_DESCRIPTION}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={rule.points >= 0 ? "default" : "destructive"}
                    >
                      {rule.points >= 0 ? `+${rule.points}` : rule.points}{" "}
                      {GLOBAL_RULES.POINTS}
                    </Badge>
                    <Badge variant={rule.isActive ? "default" : "secondary"}>
                      {rule.isActive
                        ? GLOBAL_RULES.ACTIVE
                        : GLOBAL_RULES.INACTIVE}
                    </Badge>
                  </div>
                </div>
              ))}
              {globalRules.length > 3 && (
                <div className="text-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewAllGlobalRules}
                  >
                    {GLOBAL_RULES.VIEW_ALL_RULES.replace(
                      "{count}",
                      globalRules.length.toString(),
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rule Creation Modal */}
      {user?.role === "ADMIN" && (
        <RuleCreationModal
          isOpen={showRuleModal}
          onClose={handleRuleModalClose}
          onRuleCreated={handleRuleCreated}
          mode="create"
          isAdmin={user?.role === "ADMIN"}
        />
      )}
    </div>
  );
}
