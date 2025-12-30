
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Search,
  Users,
  Trophy,
  Settings,
  LayoutDashboard,
  TrendingUp,
  Shield,
  Keyboard,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type SearchResultType = "group" | "member" | "score-record" | "page" | "setting";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<(HTMLDivElement | null)[]>([]);

  const quickActions: SearchResult[] = [
    {
      id: "dashboard",
      type: "page",
      title: "Dashboard",
      subtitle: "Trang tổng quan",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "groups",
      type: "page",
      title: "Nhóm",
      subtitle: "Quản lý các nhóm của bạn",
      href: "/groups",
      icon: Users,
    },
    {
      id: "analytics",
      type: "page",
      title: "Phân tích",
      subtitle: "Xem thống kê và xu hướng",
      href: "/analytics",
      icon: TrendingUp,
    },
    {
      id: "score-records",
      type: "page",
      title: "Bản ghi điểm",
      subtitle: "Lịch sử ghi điểm",
      href: "/score-records",
      icon: Trophy,
    },
    {
      id: "settings",
      type: "setting",
      title: "Cài đặt tài khoản",
      subtitle: "Quản lý thông tin cá nhân",
      href: "/account/settings",
      icon: Settings,
    },
    {
      id: "admin-users",
      type: "page",
      title: "Quản trị người dùng",
      subtitle: "Chỉ dành cho Admin",
      href: "/admin/users",
      icon: Shield,
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults(quickActions);
        return;
      }

      setIsLoading(true);
      const allResults: SearchResult[] = [...quickActions];
      const lowerQuery = query.toLowerCase();

      try {

        const [groupsRes, activityRes] = await Promise.all([
          fetch("/api/groups"),
          fetch("/api/activity-logs?limit=50"),
        ]);

        if (groupsRes.ok) {
          const groupsData = await groupsRes.json();
          const groups = groupsData.groups || [];

          const groupResults = groups
            .filter((g: any) => g.name.toLowerCase().includes(lowerQuery))
            .map((g: any) => ({
              id: g.id,
              type: "group" as SearchResultType,
              title: g.name,
              subtitle: `${g.members?.length || 0} thành viên`,
              href: `/groups/${g.id}`,
              icon: Users,
            }));

          allResults.push(...groupResults);
        }

        if (activityRes.ok) {
          const activityData = await activityRes.json();
          const activities = activityData.activityLogs || [];

          const memberResults = activities
            .filter((a: any) => a.user?.name?.toLowerCase().includes(lowerQuery))
            .slice(0, 10)
            .map((a: any, idx: number) => ({
              id: `member-${a.user?.id}-${idx}`,
              type: "member" as SearchResultType,
              title: a.user?.name || "Người dùng",
              subtitle: a.user?.email,
              icon: Users,
            }));

          allResults.push(...memberResults);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }

      const filteredResults = allResults.filter(
        (result) =>
          result.title.toLowerCase().includes(lowerQuery) ||
          result.subtitle?.toLowerCase().includes(lowerQuery)
      );

      setResults(filteredResults.slice(0, 10));
      setSelectedIndex(0);
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  useEffect(() => {
    resultsRef.current[selectedIndex]?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelectResult(results[selectedIndex]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    if (result.href) {
      router.push(result.href);
      onClose();
    } else if (result.onClick) {
      result.onClick();
      onClose();
    }
  };

  const getIconForType = (type: SearchResultType) => {
    const icons: Record<SearchResultType, React.ComponentType<{ className?: string }>> = {
      group: Users,
      member: Users,
      "score-record": Trophy,
      page: LayoutDashboard,
      setting: Settings,
    };
    return icons[type] || Search;
  };

  const getTypeBadge = (type: SearchResultType) => {
    const badges: Record<SearchResultType, string> = {
      group: "bg-blue-100 text-blue-800",
      member: "bg-green-100 text-green-800",
      "score-record": "bg-purple-100 text-purple-800",
      page: "bg-gray-100 text-gray-800",
      setting: "bg-orange-100 text-orange-800",
    };
    return badges[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-2xl gap-0 overflow-hidden">
        <div className="flex flex-col max-h-[600px]">
          <div className="border-b p-4">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tìm kiếm nhóm, thành viên, trang cài đặt..."
                className="border-0 focus-visible:ring-0 text-base h-12 shadow-none"
                autoFocus
              />
              <Keyboard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">ESC</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : results.length === 0 && query ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                <p className="text-muted-foreground mb-1">
                  Không tìm thấy kết quả cho
                </p>
                <p className="font-semibold">{query}</p>
              </div>
            ) : (
              <div className="space-y-1">
                {results.map((result, index) => {
                  const Icon = result.icon || getIconForType(result.type);
                  return (
                    <div
                      key={result.id}
                      ref={(el) => {
                        resultsRef.current[index] = el;
                      }}
                      onClick={() => handleSelectResult(result)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                        index === selectedIndex
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{result.title}</p>
                          <Badge
                            variant="outline"
                            className={cn("text-xs", getTypeBadge(result.type))}
                          >
                            {result.type}
                          </Badge>
                        </div>
                        {result.subtitle && (
                          <p className="text-sm text-muted-foreground truncate">
                            {result.subtitle}
                          </p>
                        )}
                      </div>
                      {index === selectedIndex && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <kbd className="px-2 py-1 rounded bg-muted border">
                            ↵
                          </kbd>
                        </div>
                      )}
                      {index === selectedIndex && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t p-3 bg-muted/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-background border text-[10px]">
                    ↑↓
                  </kbd>
                  <span>Điều hướng</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-background border text-[10px]">
                    Enter
                  </kbd>
                  <span>Chọn</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-background border text-[10px]">
                    Esc
                  </kbd>
                  <span>Đóng</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Keyboard className="h-3 w-3" />
                <span>Cmd/Ctrl + K để mở tìm kiếm</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
