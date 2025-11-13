"use client";

import { useState } from "react";
import { Plus, Search, Filter, Grid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GroupListProps, Group } from "@/types";
import { GroupCard } from "./GroupCard";
import { Loading } from "@/components/ui/loading";
import { usePermissions } from "@/hooks/use-auth";
import { LABELS, DESCRIPTIONS, PLACEHOLDERS } from "@/lib/translations";
import toast from "react-hot-toast";

export function GroupList({
  groups,
  isLoading = false,
  onGroupSelect,
  onEdit,
  onDelete,
  onManageMembers,
  onViewDetails,
  onCreateGroup,
  showActions = true,
}: GroupListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { hasPermission } = usePermissions();

  // Filter groups based on search and status
  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      !searchQuery ||
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && group.isActive) ||
      (statusFilter === "inactive" && !group.isActive);

    return matchesSearch && matchesStatus;
  });

  const handleCreateGroup = () => {
    if (hasPermission("create-group")) {
      if (onCreateGroup) {
        onCreateGroup();
      } else {
        toast.success("Đang mở form tạo nhóm...");
      }
    } else {
      toast.error("Bạn không có quyền tạo nhóm");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            {LABELS.YOUR_GROUPS}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {LABELS.YOUR_GROUPS}
          </h2>
          <p className="text-muted-foreground">
            {LABELS.TOTAL_GROUPS_DISPLAY.replace(
              "{count}",
              groups.length.toString(),
            )}
          </p>
        </div>
        {hasPermission("create-group") && (
          <Button onClick={handleCreateGroup}>
            <Plus className="mr-2 h-4 w-4" />
            {LABELS.CREATE_GROUP}
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={PLACEHOLDERS.SEARCH_GROUPS}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value: any) => setStatusFilter(value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder={LABELS.FILTER_BY_STATUS} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{LABELS.ALL_GROUPS}</SelectItem>
            <SelectItem value="active">{LABELS.ACTIVE_ONLY}</SelectItem>
            <SelectItem value="inactive">{LABELS.INACTIVE_ONLY}</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex border rounded-md">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="rounded-r-none"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Groups Grid/List */}
      {filteredGroups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">
                {DESCRIPTIONS.NO_GROUPS_FOUND}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? DESCRIPTIONS.ADJUST_SEARCH_FILTER
                  : DESCRIPTIONS.CREATE_FIRST_GROUP}
              </p>
            </div>
            {hasPermission("create-group") &&
              !searchQuery &&
              statusFilter === "all" && (
                <Button onClick={handleCreateGroup} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  {DESCRIPTIONS.CREATE_YOUR_FIRST_GROUP}
                </Button>
              )}
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onEdit={onEdit}
              onDelete={onDelete}
              onManageMembers={onManageMembers}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {groups.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold">{groups.length}</div>
            <div className="text-sm text-muted-foreground">
              {LABELS.TOTAL_GROUPS}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {groups.filter((g) => g.isActive).length}
            </div>
            <div className="text-sm text-muted-foreground">{LABELS.ACTIVE}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {groups.filter((g) => !g.isActive).length}
            </div>
            <div className="text-sm text-muted-foreground">
              {LABELS.INACTIVE}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {groups.reduce(
                (sum, group) => sum + (group.members?.length || 0),
                0,
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {LABELS.TOTAL_MEMBERS}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
