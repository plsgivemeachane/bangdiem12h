/**
 * React Query Hooks for Groups
 * Optimized for client-side caching and deduplication
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  queryKeys,
  invalidateQueries,
  optimisticUpdates,
} from "@/lib/cache/query-client";
import { GroupsApi } from "@/lib/api/groups";
import { toast } from "react-hot-toast";

// Hook for fetching groups list
export const useGroups = (options?: {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.groups.lists(),
    queryFn: async () => {
      const response = await GroupsApi.getGroups();
      return response;
    },
    staleTime: options?.staleTime || 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled !== false,
    refetchInterval: options?.refetchInterval,
  });
};

// Hook for fetching a single group
export const useGroup = (
  groupId: string,
  options?: {
    enabled?: boolean;
  },
) => {
  return useQuery({
    queryKey: queryKeys.groups.detail(groupId),
    queryFn: async () => {
      const response = await GroupsApi.getGroup(groupId);
      return response;
    },
    enabled: options?.enabled !== false && !!groupId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Hook for creating a new group
export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupData: { name: string; description?: string }) => {
      const response = await GroupsApi.createGroup(groupData);
      return response;
    },
    onSuccess: (newGroup) => {
      // Optimistically update the groups list
      optimisticUpdates.updateGroupsList(newGroup);

      // Invalidate related queries
      invalidateQueries.groups();

      toast.success("Nhóm đã được tạo thành công");
    },
    onError: (error: any) => {
      console.error("Error creating group:", error);

      // Rollback optimistic update
      optimisticUpdates.rollbackGroupsList();

      toast.error(error?.message || "Lỗi khi tạo nhóm");
    },
  });
};

// Hook for updating a group
export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      updates,
    }: {
      groupId: string;
      updates: {
        name?: string;
        description?: string;
      };
    }) => {
      const response = await GroupsApi.updateGroup(groupId, updates);
      return response;
    },
    onSuccess: (updatedGroup, { groupId }) => {
      // Update the specific group in cache
      queryClient.setQueryData(queryKeys.groups.detail(groupId), updatedGroup);

      // Invalidate related queries
      invalidateQueries.groups();

      toast.success("Nhóm đã được cập nhật thành công");
    },
    onError: (error: any) => {
      console.error("Error updating group:", error);
      toast.error(error?.message || "Lỗi khi cập nhật nhóm");
    },
  });
};

// Hook for deleting a group
export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      await GroupsApi.deleteGroup(groupId);
      return groupId;
    },
    onSuccess: (groupId) => {
      // Remove the group from cache
      queryClient.removeQueries({
        queryKey: queryKeys.groups.detail(groupId),
      });

      // Invalidate related queries
      invalidateQueries.groups();

      toast.success("Nhóm đã được xóa thành công");
    },
    onError: (error: any) => {
      console.error("Error deleting group:", error);
      toast.error(error?.message || "Lỗi khi xóa nhóm");
    },
  });
};
