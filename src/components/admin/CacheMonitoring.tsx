/**
 * CacheMonitoring Component
 * Admin-only component for monitoring cache performance and statistics
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys, invalidateQueries } from "@/lib/cache/query-client";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface CacheMetrics {
  hitRate: number;
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  memoryUsage: string;
  averageResponseTime: number;
}

interface EndpointStats {
  endpoint: string;
  hitRate: number;
  lastAccessed: Date;
  cacheSize: number;
  averageResponseTime: number;
}

export const CacheMonitoring: React.FC = () => {
  const queryClient = useQueryClient();
  const [metrics, setMetrics] = useState<CacheMetrics | null>(null);
  const [endpointStats, setEndpointStats] = useState<EndpointStats[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock cache metrics (in real implementation, this would come from monitoring)
  useEffect(() => {
    const mockMetrics: CacheMetrics = {
      hitRate: 0.85,
      totalRequests: 1247,
      cacheHits: 1060,
      cacheMisses: 187,
      memoryUsage: "12.4 MB",
      averageResponseTime: 145,
    };

    const mockEndpointStats: EndpointStats[] = [
      {
        endpoint: "/api/groups",
        hitRate: 0.92,
        lastAccessed: new Date(),
        cacheSize: 3.2,
        averageResponseTime: 89,
      },
      {
        endpoint: "/api/analytics",
        hitRate: 0.78,
        lastAccessed: new Date(Date.now() - 300000),
        cacheSize: 5.1,
        averageResponseTime: 234,
      },
      {
        endpoint: "/api/score-records",
        hitRate: 0.65,
        lastAccessed: new Date(Date.now() - 600000),
        cacheSize: 2.8,
        averageResponseTime: 167,
      },
    ];

    setMetrics(mockMetrics);
    setEndpointStats(mockEndpointStats);
  }, []);

  const handleRefreshCache = async () => {
    setIsRefreshing(true);
    try {
      // Clear all caches
      await queryClient.invalidateQueries();

      // Simulate refresh delay
      setTimeout(() => {
        setIsRefreshing(false);
        // Update metrics after refresh
        if (metrics) {
          setMetrics({
            ...metrics,
            hitRate: 0.0,
            cacheHits: 0,
            cacheMisses: 0,
          });
        }
      }, 1000);
    } catch (error) {
      console.error("Error refreshing cache:", error);
      setIsRefreshing(false);
    }
  };

  const handleInvalidateEndpoint = (endpoint: string) => {
    // Invalidate specific endpoint cache
    queryClient.invalidateQueries({
      queryKey: queryKeys.groups.lists(), // This would be endpoint-specific
    });
  };

  if (!metrics) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            📊 Monitoring Hiệu Suất Cache
          </h1>
          <p className="text-gray-600 mt-1">
            Theo dõi và quản lý hiệu suất bộ nhớ đệm của hệ thống
          </p>
        </div>
        <Button
          onClick={handleRefreshCache}
          disabled={isRefreshing}
          variant="outline"
        >
          {isRefreshing ? "🔄 Đang làm mới..." : "🔄 Làm mới Cache"}
        </Button>
      </div>

      {/* Overall Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Cache Hit Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(metrics.hitRate * 100)}%
            </div>
            <p className="text-xs text-gray-600">
              {metrics.cacheHits} / {metrics.totalRequests} requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.memoryUsage}
            </div>
            <p className="text-xs text-gray-600">
              Tổng bộ nhớ cache được sử dụng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {metrics.averageResponseTime}ms
            </div>
            <p className="text-xs text-gray-600">
              Thời gian phản hồi trung bình
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cache Misses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics.cacheMisses}
            </div>
            <p className="text-xs text-gray-600">
              Yêu cầu không có trong cache
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Endpoint Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Thống Kê Endpoint</CardTitle>
          <CardDescription>
            Hiệu suất cache cho từng endpoint API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {endpointStats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {stat.endpoint}
                    </code>
                    <Badge
                      variant={stat.hitRate > 0.8 ? "default" : "secondary"}
                      className={
                        stat.hitRate > 0.8 ? "bg-green-100 text-green-800" : ""
                      }
                    >
                      {Math.round(stat.hitRate * 100)}% hit rate
                    </Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Cache Size:</span>{" "}
                      {stat.cacheSize} KB
                    </div>
                    <div>
                      <span className="font-medium">Response Time:</span>{" "}
                      {stat.averageResponseTime}ms
                    </div>
                    <div>
                      <span className="font-medium">Last Accessed:</span>{" "}
                      {format(stat.lastAccessed, "HH:mm:ss dd/MM", {
                        locale: vi,
                      })}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleInvalidateEndpoint(stat.endpoint)}
                >
                  Clear Cache
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cache Performance Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Biểu Đồ Hiệu Suất</CardTitle>
          <CardDescription>
            Biểu đồ thời gian thực của hiệu suất cache
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">
              📈 Biểu đồ hiệu suất cache sẽ được hiển thị ở đây
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cache Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>⚙️ Cấu Hình Cache</CardTitle>
          <CardDescription>Cài đặt TTL và chính sách cache</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Thời Gian TTL (Time To Live)</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Groups API:</span>
                  <Badge variant="outline">5 phút</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Analytics API:</span>
                  <Badge variant="outline">2 phút</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Score Records API:</span>
                  <Badge variant="outline">1 phút</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Scoring Rules API:</span>
                  <Badge variant="outline">30 phút</Badge>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Chính Sách Cache</h4>
              <div className="space-y-2 text-sm">
                <div>• Stale-While-Revalidate: 60s</div>
                <div>• Session Persistence: Bật</div>
                <div>• Request Deduplication: Bật</div>
                <div>• Auto Invalidation: Khi có thay đổi dữ liệu</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CacheMonitoring;
