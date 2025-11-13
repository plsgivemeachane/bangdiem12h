"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Trophy, TrendingUp } from "lucide-react";
import { GroupList } from "@/components/groups/GroupList";
import { GroupForm } from "@/components/groups/GroupForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { GroupsApi } from "@/lib/api/groups";
import { useAuth } from "@/hooks/use-auth";
import { Group } from "@/types";
import { useRouter } from "next/navigation";
import { useAutoPrefetch, getRoutesByBasePath } from "@/lib/cache/url-patterns";
import toast from "react-hot-toast";
import {
  GROUPS_PAGE,
  ACTIONS,
  LABELS,
  MESSAGES,
  DESCRIPTIONS,
  PAGE_TITLES,
  USER_ROLES,
  NAV,
} from "@/lib/translations";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Auto-prefetch high priority routes on component mount
  useAutoPrefetch();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin");
      return;
    }
  }, [isAuthenticated, authLoading, router]);

  // Load groups on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadGroups();
    }
  }, [isAuthenticated]);

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const groupsData = await GroupsApi.getGroups();
      setGroups(groupsData);
      
      // Strategic prefetch: Preload group-specific routes after loading groups
      // This ensures that when users click on "Manage Members" or "View Details",
      // the pages are instantly available
      if (groupsData.length > 0) {
        try {
          // Context data for permission-aware prefetching
          const contextData = {
            isAuthenticated,
            user,
            userRole: user?.role || 'USER',
            groups: groupsData
          };
          
          // Get routes by base path with permission filtering
          const groupRoutes = getRoutesByBasePath('/groups', contextData, user?.role || 'USER');
          
          // Create prefetch operations for high-priority routes
          const prefetchOperations: Promise<void>[] = [];
          
          // Prefetch each group's detail pages and member pages
          groupsData.forEach((group: Group) => {
            if (group?.id) {
              // Prefetch group detail page
              const detailUrl = `/groups/${group.id}`;
              const detailPromise = (async () => {
                await router.prefetch(detailUrl);
                console.log(`🔮 Groups page prefetched: ${detailUrl}`);
              })();
              prefetchOperations.push(detailPromise);
              
              // Prefetch group members page (commonly accessed)
              const membersUrl = `/groups/${group.id}/members`;
              const membersPromise = (async () => {
                await router.prefetch(membersUrl);
                console.log(`🔮 Groups page prefetched: ${membersUrl}`);
              })();
              prefetchOperations.push(membersPromise);
              
              // For admin users, also prefetch scoring-related pages
              if (user?.role === 'ADMIN') {
                const scoringUrl = `/groups/${group.id}/scoring`;
                const scoringPromise = (async () => {
                  await router.prefetch(scoringUrl);
                  console.log(`🔮 Groups page prefetched: ${scoringUrl}`);
                })();
                prefetchOperations.push(scoringPromise);
                
                const rulesUrl = `/groups/${group.id}/rules`;
                const rulesPromise = (async () => {
                  await router.prefetch(rulesUrl);
                  console.log(`🔮 Groups page prefetched: ${rulesUrl}`);
                })();
                prefetchOperations.push(rulesPromise);
              }
            }
          });
          
          // Execute all prefetches in parallel with error handling
          await Promise.allSettled(prefetchOperations);
        } catch (prefetchError) {
          console.warn('⚠️ Groups page prefetch initialization failed:', prefetchError);
          // Don't throw - prefetch is best-effort, shouldn't break groups page
        }
      }
    } catch (error) {
      console.error(MESSAGES.ERROR.FAILED_TO_LOAD, ":", error);
      setError(
        error instanceof Error ? error.message : MESSAGES.ERROR.FAILED_TO_LOAD,
      );
      toast.error(MESSAGES.ERROR.FAILED_TO_LOAD);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setIsFormOpen(true);
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setIsFormOpen(true);
  };

  const handleDeleteGroup = async (group: Group) => {
    try {
      await GroupsApi.deleteGroup(group.id);
      setGroups((prev) => prev.filter((g) => g.id !== group.id));
      toast.success(MESSAGES.SUCCESS.DELETED);
    } catch (error) {
      console.error(MESSAGES.ERROR.FAILED_TO_DELETE, ":", error);
      toast.error(
        error instanceof Error
          ? error.message
          : MESSAGES.ERROR.FAILED_TO_DELETE,
      );
      throw error; // Re-throw for GroupCard to handle loading state
    }
  };

  const handleManageMembers = (group: Group) => {
    router.push(`/groups/${group.id}/members`);
  };

  const handleViewDetails = (group: Group) => {
    router.push(`/groups/${group.id}`);
  };

  const handleFormSuccess = (updatedGroup?: Group) => {
    setIsFormOpen(false);
    setEditingGroup(null);

    if (updatedGroup) {
      if (editingGroup) {
        // Update existing group
        setGroups((prev) =>
          prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)),
        );
      } else {
        // Add new group
        setGroups((prev) => [updatedGroup, ...prev]);
      }
    } else {
      // Just reload to be safe
      loadGroups();
    }
  };

  // Show loading spinner during authentication check
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading text={ACTIONS.CHECKING_AUTHENTICATION} />
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">
              {GROUPS_PAGE.AUTHENTICATION_REQUIRED}
            </h2>
            <p className="text-muted-foreground mb-6">
              {GROUPS_PAGE.PLEASE_SIGNIN_GROUPS}
            </p>
            <Button onClick={() => router.push("/auth/signin")}>
              {NAV.SIGN_IN}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate quick stats
  const totalGroups = groups.length;
  const activeGroups = groups.filter((g) => g.isActive).length;
  const totalMembers = groups.reduce(
    (sum, group) => sum + (group.members?.length || 0),
    0,
  );
  const totalScoreRecords = groups.reduce(
    (sum, group) => sum + (group._count?.scoreRecords || 0),
    0,
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {GROUPS_PAGE.TITLE}
          </h1>
          <p className="text-muted-foreground">{GROUPS_PAGE.DESCRIPTION}</p>
        </div>
        {/* Only System ADMINs can create groups */}
        {user?.role === "ADMIN" && (
          <Button onClick={handleCreateGroup}>
            <Plus className="mr-2 h-4 w-4" />
            {ACTIONS.CREATE}
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {GROUPS_PAGE.TOTAL_GROUPS_STAT}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGroups}</div>
            <p className="text-xs text-muted-foreground">
              {GROUPS_PAGE.TOTAL_GROUPS_ACTIVE.replace(
                "{count}",
                activeGroups.toString(),
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {GROUPS_PAGE.TOTAL_MEMBERS_STAT}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              {GROUPS_PAGE.TOTAL_MEMBERS_DESC}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {GROUPS_PAGE.SCORE_RECORDS_STAT}
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScoreRecords}</div>
            <p className="text-xs text-muted-foreground">
              {GROUPS_PAGE.SCORE_RECORDS_DESC}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {GROUPS_PAGE.YOUR_ROLE_STAT}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {user?.role === "ADMIN"
                ? GROUPS_PAGE.YOUR_ROLE_ADMIN
                : GROUPS_PAGE.YOUR_ROLE_USER}
            </div>
            <p className="text-xs text-muted-foreground">
              {GROUPS_PAGE.YOUR_ROLE_DESC}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-destructive mb-2">
                {GROUPS_PAGE.LOADING_GROUPS_ERROR}
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadGroups} variant="outline">
                {ACTIONS.RELOAD}
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
        onCreateGroup={handleCreateGroup}
        showActions={true}
      />

      {/* Group Form Dialog */}
      <GroupForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        group={editingGroup}
        mode={editingGroup ? "edit" : "create"}
      />
    </div>
  );
}
