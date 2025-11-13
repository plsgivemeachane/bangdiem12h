/**
 * React Query Client Configuration
 * Optimized for client-side caching in a serverless environment
 */

import { QueryClient } from "@tanstack/react-query";
import { CACHE_CONFIGS, getCacheConfig } from "./config";

// Create and configure the QueryClient
export const createQueryClient = () => {
  const config = getCacheConfig(
    process.env.NODE_ENV as "development" | "production",
  );

  return new QueryClient({
    defaultOptions: {
      queries: {
        // Enable caching by default
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

        // Retry configuration
        retry: (failureCount: number, error: any) => {
          // Don't retry on 4xx errors (client errors)
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          // Retry up to 3 times for network errors or 5xx errors
          return failureCount < 3;
        },
        retryDelay: (attemptIndex: number) =>
          Math.min(1000 * 2 ** attemptIndex, 30000),

        // Refetch configuration
        refetchOnWindowFocus: false, // Prevent unnecessary refetches
        refetchOnMount: true, // Refetch when component mounts
        refetchOnReconnect: true, // Refetch when reconnecting

        // Network mode
        networkMode: "online",
      },
      mutations: {
        // Mutation retry configuration
        retry: 1,
        networkMode: "online",
      },
    },
  });
};

// Singleton query client instance
export const queryClient = createQueryClient();

// Query key factory for consistent cache keys
export const queryKeys = {
  // Groups
  groups: {
    all: ["groups"] as const,
    lists: () => [...queryKeys.groups.all, "list"] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.groups.lists(), { filters }] as const,
    details: () => [...queryKeys.groups.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.groups.details(), id] as const,
  },

  // Analytics
  analytics: {
    all: ["analytics"] as const,
    lists: () => [...queryKeys.analytics.all, "list"] as const,
    list: (params?: Record<string, any>) =>
      [...queryKeys.analytics.lists(), { params }] as const,
    detail: (params: Record<string, any>) =>
      [...queryKeys.analytics.all, "detail", params] as const,
  },

  // Score Records
  scoreRecords: {
    all: ["score-records"] as const,
    lists: () => [...queryKeys.scoreRecords.all, "list"] as const,
    list: (groupId: string, filters?: Record<string, any>) =>
      [...queryKeys.scoreRecords.lists(), { groupId, filters }] as const,
    detail: (id: string) =>
      [...queryKeys.scoreRecords.all, "detail", id] as const,
  },

  // Scoring Rules
  scoringRules: {
    all: ["scoring-rules"] as const,
    lists: () => [...queryKeys.scoringRules.all, "list"] as const,
    list: (groupId?: string) =>
      [...queryKeys.scoringRules.lists(), { groupId }] as const,
    detail: (id: string) =>
      [...queryKeys.scoringRules.all, "detail", id] as const,
  },

  // Group Members
  groupMembers: {
    all: ["group-members"] as const,
    lists: () => [...queryKeys.groupMembers.all, "list"] as const,
    list: (groupId: string) =>
      [...queryKeys.groupMembers.lists(), groupId] as const,
    detail: (groupId: string, userId: string) =>
      [...queryKeys.groupMembers.all, "detail", { groupId, userId }] as const,
  },

  // User Profile
  userProfile: {
    all: ["user-profile"] as const,
    detail: (id: string) => [...queryKeys.userProfile.all, id] as const,
  },
} as const;

// Cache invalidation helpers
export const invalidateQueries = {
  // Invalidate all queries
  all: () => queryClient.invalidateQueries(),

  // Invalidate related to groups
  groups: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.groupMembers.all });
  },

  // Invalidate related to analytics
  analytics: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.scoreRecords.all });
  },

  // Invalidate related to score records
  scoreRecords: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.scoreRecords.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
  },

  // Invalidate related to scoring rules
  scoringRules: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.scoringRules.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
  },

  // Invalidate related to group members
  groupMembers: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.groupMembers.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
  },

  // Invalidate user profile
  userProfile: (userId?: string) => {
    if (userId) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.userProfile.detail(userId),
      });
    } else {
      queryClient.invalidateQueries({ queryKey: queryKeys.userProfile.all });
    }
  },
} as const;

// Optimistic update helpers
export const optimisticUpdates = {
  // Optimistically update groups list
  updateGroupsList: (newGroup: any) => {
    queryClient.setQueryData(
      queryKeys.groups.lists(),
      (oldData: any[] = []) => [newGroup, ...oldData],
    );
  },

  // Optimistically update score records
  updateScoreRecords: (groupId: string, newRecord: any) => {
    queryClient.setQueryData(
      queryKeys.scoreRecords.list(groupId),
      (oldData: any = { scoreRecords: [] }) => ({
        ...oldData,
        scoreRecords: [newRecord, ...(oldData.scoreRecords || [])],
      }),
    );
  },

  // Rollback optimistic updates on error
  rollbackGroupsList: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.groups.lists() });
  },

  rollbackScoreRecords: (groupId: string) => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.scoreRecords.list(groupId),
    });
  },
} as const;

// Cache persistence helpers (for session storage)
export const cachePersistence = {
  // Save query cache to session storage
  saveCache: () => {
    if (
      typeof window !== "undefined" &&
      (queryClient.getDefaultOptions().queries?.networkMode as string) !== "offline"
    ) {
      const cache = queryClient.getQueryCache();
      const serializedCache = JSON.stringify(
        cache.getAll().map((query: any) => ({
          queryKey: query.queryKey,
          data: query.state.data,
          timestamp: Date.now(),
        })),
      );
      sessionStorage.setItem("react-query-cache", serializedCache);
    }
  },

  // Restore query cache from session storage
  restoreCache: () => {
    if (typeof window !== "undefined") {
      const serializedCache = sessionStorage.getItem("react-query-cache");
      if (serializedCache) {
        try {
          const cacheData = JSON.parse(serializedCache);
          // Only restore if cache is less than 5 minutes old
          const maxAge = 5 * 60 * 1000;
          const validEntries = cacheData.filter(
            (entry: any) => Date.now() - entry.timestamp < maxAge,
          );

          validEntries.forEach((entry: any) => {
            queryClient.setQueryData(entry.queryKey, entry.data);
          });
        } catch (error) {
          console.warn("Failed to restore cache from session storage:", error);
        }
      }
    }
  },

  // Clear saved cache
  clearCache: () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("react-query-cache");
    }
  },
} as const;
