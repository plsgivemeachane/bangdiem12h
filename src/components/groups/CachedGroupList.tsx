/**
 * CachedGroupList Component
 * Clean implementation without cache statistics for regular users
 */

"use client";

import React from "react";
import { useGroups } from "@/hooks/use-groups";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserTag } from "@/components/ui/user-tag";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export const CachedGroupList: React.FC = () => {
  const {
    data: groupsData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGroups({
    enabled: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            Lỗi khi tải danh sách nhóm
          </h3>
          <p className="text-gray-600 mb-4">
            {error?.message || "Đã xảy ra lỗi không xác định"}
          </p>
          <Button onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? "Đang tải..." : "Thử lại"}
          </Button>
        </div>
      </Card>
    );
  }

  const groups = groupsData || [];

  return (
    <div className="space-y-4">
      {/* Groups List */}
      <div className="grid gap-4">
        {groups.length === 0 ? (
          <Card className="p-8">
            <div className="text-center text-gray-500">
              <p>Không có nhóm nào được tìm thấy</p>
            </div>
          </Card>
        ) : (
          groups.map((group: any) => (
            <Card key={group.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    {group.description && (
                      <CardDescription className="mt-1">
                        {group.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      {group._count?.groupRules || 0} quy tắc
                    </Badge>
                    <Badge variant="outline">
                      {group._count?.scoreRecords || 0} bản ghi
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Creator Info */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Người tạo:</span>
                    <UserTag name={group.createdBy?.name} email={group.createdBy?.email} />
                  </div>

                  {/* Member Count */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Thành viên:</span>
                    <Badge variant="outline">
                      {group.members?.length || 0} người
                    </Badge>
                  </div>

                  {/* Creation Date */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Ngày tạo:</span>
                    <span>
                      {format(new Date(group.createdAt), "dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </span>
                  </div>

                  {/* Members Preview */}
                  {group.members && group.members.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600 mb-2">Thành viên:</p>
                      <div className="flex flex-wrap gap-1">
                        {group.members.slice(0, 3).map((member: any) => (
                          <UserTag
                            key={member.user.id}
                            name={member.user?.name} email={member.user?.email}
                            size="sm"
                          />
                        ))}
                        {group.members.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{group.members.length - 3} khác
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Manual Refresh Button */}
      <div className="flex justify-center pt-4">
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          className="w-full max-w-xs"
        >
          {isFetching ? "🔄 Đang làm mới..." : "🔄 Làm mới dữ liệu"}
        </Button>
      </div>
    </div>
  );
};

export default CachedGroupList;
