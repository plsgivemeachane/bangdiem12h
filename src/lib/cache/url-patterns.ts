/**
 * URL Pattern Analysis and Preloading Service
 * Analyzes router.push() patterns and provides intelligent prefetch utilities
 */

import React, { useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/use-auth";

// URL Pattern Types
interface RoutePattern {
  pattern: string;
  priority: 'high' | 'medium' | 'low';
  permissions?: string[];
  dynamicParams: string[];
  basePath: string;
  requiresAuth?: boolean;
}

interface PrefetchableRoute {
  url: string;
  pattern: RoutePattern;
  requiresAuth: boolean;
  permissions?: string[];
}

// Discovered router.push() patterns from codebase investigation
const ROUTER_PATTERNS: RoutePattern[] = [
  // Authentication routes
  {
    pattern: "/auth/signin",
    priority: 'high',
    basePath: "/auth",
    dynamicParams: []
  },
  {
    pattern: "/dashboard",
    priority: 'high',
    requiresAuth: true,
    permissions: ['view-dashboard'],
    basePath: "/dashboard",
    dynamicParams: []
  },

  // Group navigation patterns (most common)
  {
    pattern: "/groups",
    priority: 'high',
    requiresAuth: true,
    permissions: ['create-group', 'view-groups'],
    basePath: "/groups",
    dynamicParams: []
  },
  {
    pattern: "/groups/[id]",
    priority: 'high',
    requiresAuth: true,
    permissions: ['view-group', 'edit-group'],
    basePath: "/groups",
    dynamicParams: ['id']
  },
  {
    pattern: "/groups/[id]/members",
    priority: 'high',
    requiresAuth: true,
    permissions: ['manage-members', 'view-members'],
    basePath: "/groups",
    dynamicParams: ['id']
  },
  {
    pattern: "/groups/[id]/rules",
    priority: 'high',
    requiresAuth: true,
    permissions: ['edit-scoring-rules', 'create-scoring-rules'],
    basePath: "/groups",
    dynamicParams: ['id']
  },
  {
    pattern: "/groups/[id]/scoring",
    priority: 'high',
    requiresAuth: true,
    permissions: ['record-scores', 'view-all-scores'],
    basePath: "/groups",
    dynamicParams: ['id']
  },

  // Account and settings
  {
    pattern: "/account",
    priority: 'medium',
    requiresAuth: true,
    basePath: "/account",
    dynamicParams: []
  },
  {
    pattern: "/account/settings",
    priority: 'medium',
    requiresAuth: true,
    basePath: "/account",
    dynamicParams: []
  },

  // Admin routes
  {
    pattern: "/admin/users",
    priority: 'medium',
    requiresAuth: true,
    permissions: ['admin'],
    basePath: "/admin",
    dynamicParams: []
  },
  {
    pattern: "/admin/scoring-rules",
    priority: 'medium',
    requiresAuth: true,
    permissions: ['admin', 'create-scoring-rules'],
    basePath: "/admin",
    dynamicParams: []
  },

  // Analytics and records
  {
    pattern: "/analytics",
    priority: 'medium',
    requiresAuth: true,
    permissions: ['view-analytics'],
    basePath: "/analytics",
    dynamicParams: []
  },
  {
    pattern: "/score-records",
    priority: 'medium',
    requiresAuth: true,
    permissions: ['view-all-scores', 'record-scores'],
    basePath: "/score-records",
    dynamicParams: []
  },
  {
    pattern: "/activity-logs",
    priority: 'low',
    requiresAuth: true,
    permissions: ['admin'],
    basePath: "/activity-logs",
    dynamicParams: []
  }
];

// Permission mapping based on useAuth hook findings
const PERMISSION_MAP = {
  'view-dashboard': ['USER', 'ADMIN', 'OWNER'],
  'create-group': ['ADMIN', 'OWNER'],
  'view-groups': ['USER', 'ADMIN', 'OWNER'],
  'view-group': ['USER', 'ADMIN', 'OWNER'],
  'edit-group': ['ADMIN', 'OWNER'],
  'manage-members': ['ADMIN', 'OWNER'],
  'view-members': ['USER', 'ADMIN', 'OWNER'],
  'create-scoring-rules': ['ADMIN', 'OWNER'],
  'edit-scoring-rules': ['ADMIN', 'OWNER'],
  'view-all-scores': ['ADMIN', 'OWNER'],
  'record-scores': ['USER', 'ADMIN', 'OWNER'],
  'view-analytics': ['ADMIN', 'OWNER'],
  'admin': ['ADMIN', 'OWNER']
};

/**
 * Check if user has required permissions for a route
 */
function hasPermission(userRole: string, requiredPermissions: string[] = []): boolean {
  if (requiredPermissions.length === 0) return true;
  
  return requiredPermissions.some(permission => {
    const allowedRoles = PERMISSION_MAP[permission as keyof typeof PERMISSION_MAP];
    return allowedRoles?.includes(userRole as any) || false;
  });
}

/**
 * Generate concrete URLs from dynamic patterns
 */
function generateConcreteUrls(
  pattern: RoutePattern, 
  contextData: Record<string, any>
): string[] {
  const urls: string[] = [];
  
  // Static patterns (no dynamic params)
  if (pattern.dynamicParams.length === 0) {
    urls.push(pattern.pattern);
    return urls;
  }
  
  // Dynamic patterns - generate URLs based on available context
  const { groups = [], user } = contextData;
  
  // Generate group-based URLs
  if (pattern.pattern.includes('/groups/[id]')) {
    groups.forEach((group: any) => {
      if (group?.id) {
        const url = pattern.pattern.replace('[id]', group.id);
        urls.push(url);
      }
    });
  }
  
  return urls;
}

/**
 * Analyze and categorize routes for prefetching
 */
export function analyzeRoutesForPrefetch(
  contextData: Record<string, any> = {},
  userRole: string = 'USER'
): PrefetchableRoute[] {
  return ROUTER_PATTERNS.map(pattern => {
    // Check authentication requirements
    if (pattern.requiresAuth && !contextData.isAuthenticated) {
      return {
        url: pattern.pattern,
        pattern,
        requiresAuth: true,
        permissions: pattern.permissions
      };
    }
    
    // Check permissions
    const hasRequiredPermissions = hasPermission(userRole, pattern.permissions);
    if (!hasRequiredPermissions) {
      return {
        url: pattern.pattern,
        pattern,
        requiresAuth: true,
        permissions: pattern.permissions
      };
    }
    
    // Generate concrete URLs if dynamic
    const concreteUrls = generateConcreteUrls(pattern, contextData);
    
    return {
      url: concreteUrls.length > 0 ? concreteUrls[0] : pattern.pattern,
      pattern,
      requiresAuth: pattern.requiresAuth || false,
      permissions: pattern.permissions
    };
  }).filter(route => {
    // Filter out routes that can't be accessed
    if (route.requiresAuth && !contextData.isAuthenticated) return false;
    return true;
  });
}

/**
 * Get high-priority routes for immediate prefetching
 */
export function getHighPriorityRoutes(
  contextData: Record<string, any> = {},
  userRole: string = 'USER'
): PrefetchableRoute[] {
  return analyzeRoutesForPrefetch(contextData, userRole)
    .filter(route => route.pattern.priority === 'high');
}

/**
 * Get routes by base path
 */
export function getRoutesByBasePath(
  basePath: string,
  contextData: Record<string, any> = {},
  userRole: string = 'USER'
): PrefetchableRoute[] {
  return analyzeRoutesForPrefetch(contextData, userRole)
    .filter(route => route.pattern.basePath === basePath);
}

/**
 * Smart prefetch hook that combines Next.js router.prefetch with intelligent routing
 */
export function useSmartPrefetch() {
  const router = useRouter();
  const { isAuthenticated, user, isAdmin } = useAuth();
  
  const userRole = user?.role || 'USER';
  
  const contextData = useMemo(() => ({
    isAuthenticated,
    isAdmin,
    user,
    userRole
  }), [isAuthenticated, isAdmin, user, userRole]);
  
  // Prefetch specific routes
  const prefetchRoutes = useCallback(async (routes: PrefetchableRoute[]) => {
    if (typeof window === 'undefined') return; // Only prefetch on client
    
    const prefetchPromises = routes.map(async (route) => {
      try {
        // Check if user can access this route
        if (route.requiresAuth && !isAuthenticated) return;
        
        if (route.permissions && !hasPermission(userRole, route.permissions)) return;
        
        // Use Next.js native prefetch
        await router.prefetch(route.url);
        console.log(`✅ Prefetched: ${route.url}`);
      } catch (error) {
        console.warn(`⚠️ Prefetch failed for ${route.url}:`, error);
      }
    });
    
    // Execute all prefetches in parallel with error handling
    await Promise.allSettled(prefetchPromises);
  }, [router, isAuthenticated, userRole]);
  
  // Prefetch high-priority routes
  const prefetchHighPriority = useCallback(async () => {
    const highPriorityRoutes = getHighPriorityRoutes(contextData, userRole);
    await prefetchRoutes(highPriorityRoutes);
  }, [prefetchRoutes, contextData, userRole]);
  
  // Prefetch group-related routes
  const prefetchGroupRoutes = useCallback(async (groupId?: string) => {
    const groupRoutes = getRoutesByBasePath('/groups', contextData, userRole);
    
    if (groupId) {
      // Prefetch specific group routes
      const specificRoutes = groupRoutes.map(route => ({
        ...route,
        url: route.url.replace('[id]', groupId)
      }));
      await prefetchRoutes(specificRoutes);
    } else {
      // Prefetch general group routes
      await prefetchRoutes(groupRoutes);
    }
  }, [prefetchRoutes, contextData, userRole]);
  
  // Prefetch dashboard and core routes
  const prefetchDashboardRoutes = useCallback(async () => {
    const dashboardRoutes = [
      ...getRoutesByBasePath('/dashboard', contextData, userRole),
      ...getRoutesByBasePath('/groups', contextData, userRole),
      ...getRoutesByBasePath('/account', contextData, userRole)
    ];
    await prefetchRoutes(dashboardRoutes);
  }, [prefetchRoutes, contextData, userRole]);
  
  return {
    prefetchRoutes,
    prefetchHighPriority,
    prefetchGroupRoutes,
    prefetchDashboardRoutes,
    getHighPriorityRoutes: () => getHighPriorityRoutes(contextData, userRole),
    analyzeRoutes: () => analyzeRoutesForPrefetch(contextData, userRole)
  };
}

/**
 * Hook for automatic high-priority route prefetching
 */
export function useAutoPrefetch() {
  const { prefetchHighPriority } = useSmartPrefetch();
  
  // Auto-prefetch high priority routes on mount
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      prefetchHighPriority();
    }, 100); // Small delay to let page settle
    
    return () => clearTimeout(timeoutId);
  }, [prefetchHighPriority]);
}

// Export for testing and external use
export { ROUTER_PATTERNS, hasPermission, generateConcreteUrls };
export type { RoutePattern, PrefetchableRoute };