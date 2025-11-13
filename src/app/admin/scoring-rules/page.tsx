"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { GroupsApi } from "@/lib/api/groups";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RuleCreationModal } from "@/components/ui/rule-creation-modal";
import { ScoringRule } from "@/types";
import {
  Target,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  Settings,
  Users,
  Award,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminScoringRulesPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading: authLoading } = useAuth();

  const [rules, setRules] = useState<ScoringRule[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    rule: ScoringRule | null;
  }>({ open: false, rule: null });
  const [createEditModal, setCreateEditModal] = useState<{
    open: boolean;
    rule: ScoringRule | null;
    mode: "create" | "edit";
  }>({ open: false, rule: null, mode: "create" });

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/dashboard");
      toast.error("Từ chối truy cập. Cần quyền quản trị.");
    }
  }, [isAdmin, authLoading, router]);

  // Fetch rules
  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const rulesData = await GroupsApi.getAllGlobalRules();
      setRules(rulesData);

      // Calculate stats
      setStats({
        total: rulesData.length,
        active: rulesData.filter((rule) => rule.isActive).length,
        inactive: rulesData.filter((rule) => !rule.isActive).length,
      });
    } catch (error) {
      console.error("Lỗi tải danh sách quy tắc:", error);
      toast.error("Không thể tải danh sách quy tắc");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchRules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const handleSearch = () => {
    fetchRules();
  };

  const handleToggleStatus = async (rule: ScoringRule) => {
    try {
      const newStatus = !rule.isActive;
      await GroupsApi.updateScoringRule(rule.id, {
        name: rule.name,
        description: rule.description || undefined,
        criteria: rule.criteria,
        points: rule.points,
      });

      // Also update the status separately
      await fetch(`/api/scoring-rules/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      toast.success(
        `Quy tắc "${rule.name}" đã được ${newStatus ? "kích hoạt" : "vô hiệu hóa"}`,
      );
      fetchRules();
    } catch (error) {
      console.error("Lỗi thay đổi trạng thái:", error);
      toast.error("Không thể thay đổi trạng thái quy tắc");
    }
  };

  const handleDeleteRule = async () => {
    if (!deleteDialog.rule) return;

    try {
      await GroupsApi.deleteScoringRule(deleteDialog.rule.id);
      toast.success(
        `Quy tắc "${deleteDialog.rule.name}" đã được xóa thành công`,
      );
      setDeleteDialog({ open: false, rule: null });
      fetchRules();
    } catch (error) {
      console.error("Lỗi xóa quy tắc:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Không thể xóa quy tắc");
      } else {
        toast.error("Không thể xóa quy tắc");
      }
    }
  };

  const handleRuleCreated = (rule: ScoringRule) => {
    fetchRules();
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "Không có";
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      !search ||
      rule.name.toLowerCase().includes(search.toLowerCase()) ||
      rule.description?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && rule.isActive) ||
      (statusFilter === "inactive" && !rule.isActive);

    return matchesSearch && matchesStatus;
  });

  if (authLoading || (isAdmin && isLoading)) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách quy tắc...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý quy tắc toàn cục</h1>
          <p className="text-gray-600 mt-1">
            Quản lý quy tắc chấm điểm toàn cục cho hệ thống
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() =>
                setCreateEditModal({ open: true, rule: null, mode: "create" })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Tạo quy tắc
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tạo quy tắc chấm điểm mới</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tổng số quy tắc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-500" />
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Đang hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ToggleRight className="h-4 w-4 text-green-500" />
              <div className="text-2xl font-bold">{stats.active}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Vô hiệu hóa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ToggleLeft className="h-4 w-4 text-red-500" />
              <div className="text-2xl font-bold">{stats.inactive}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Điểm trung bình
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-500" />
              <div className="text-2xl font-bold">
                {rules.length > 0
                  ? Math.round(
                      rules.reduce((sum, rule) => sum + rule.points, 0) /
                        rules.length,
                    )
                  : 0}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="flex gap-2">
                <Input
                  placeholder="Tìm theo tên hoặc mô tả..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleSearch}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tìm kiếm quy tắc</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Vô hiệu hóa</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quy tắc toàn cục</CardTitle>
          <CardDescription>
            Tổng cộng {filteredRules.length} quy tắc
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Tên quy tắc</th>
                  <th className="text-left py-3 px-4">Mô tả</th>
                  <th className="text-left py-3 px-4">Điểm</th>
                  <th className="text-left py-3 px-4">Trạng thái</th>
                  <th className="text-left py-3 px-4">Ngày tạo</th>
                  <th className="text-right py-3 px-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{rule.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {rule.description || "Không có mô tả"}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={rule.points >= 0 ? "default" : "destructive"}
                      >
                        {rule.points >= 0 ? `+${rule.points}` : rule.points}{" "}
                        điểm
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? "Hoạt động" : "Vô hiệu"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">
                        {formatDate(rule.createdAt)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 justify-end">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(rule)}
                            >
                              {rule.isActive ? (
                                <ToggleLeft className="h-3 w-3" />
                              ) : (
                                <ToggleRight className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {rule.isActive
                                ? "Vô hiệu hóa quy tắc"
                                : "Kích hoạt quy tắc"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCreateEditModal({
                                  open: true,
                                  rule,
                                  mode: "edit",
                                })
                              }
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Chỉnh sửa quy tắc</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setDeleteDialog({ open: true, rule })
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Xóa quy tắc</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRules.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {search || statusFilter !== "all"
                  ? "Không tìm thấy quy tắc nào"
                  : "Chưa có quy tắc nào"}
              </p>
              <p className="text-sm">
                {search || statusFilter !== "all"
                  ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
                  : "Tạo quy tắc chấm điểm đầu tiên để bắt đầu."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, rule: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa quy tắc</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa quy tắc "{deleteDialog.rule?.name}"?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, rule: null })}
            >
              Huỷ
            </Button>
            <Button variant="destructive" onClick={handleDeleteRule}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Modal */}
      <RuleCreationModal
        isOpen={createEditModal.open}
        onClose={() =>
          setCreateEditModal({ open: false, rule: null, mode: "create" })
        }
        onRuleCreated={handleRuleCreated}
        existingRule={createEditModal.rule}
        mode={createEditModal.mode}
        isAdmin={isAdmin}
      />
    </div>
  );
}
