/**
 * Cache Configuration for Client-Side Caching Strategy
 * Optimized for serverless environment with focus on client-side caching
 */

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  staleWhileRevalidate: number; // Stale while revalidate period
  maxSize: number; // Maximum cache entries
  enabled: boolean; // Enable/disable caching for this endpoint
}

// Cache TTL configurations (in seconds)
export const CACHE_TTL = {
  // Groups data - updated infrequently, safe to cache longer
  GROUPS: 300, // 5 minutes

  // Analytics data - changes more frequently, shorter cache
  ANALYTICS: 180, // 3 minutes

  // Score records - frequently accessed but changes with new records
  SCORE_RECORDS: 120, // 2 minutes

  // Scoring rules - rarely change, safe to cache long
  SCORING_RULES: 600, // 10 minutes

  // Group members - changes when members are added/removed
  GROUP_MEMBERS: 180, // 3 minutes

  // User profile data - rarely changes
  USER_PROFILE: 900, // 15 minutes
} as const;

// Stale-while-revalidate configurations (in seconds)
export const STALE_WHILE_REVALIDATE = {
  GROUPS: 60,
  ANALYTICS: 30,
  SCORE_RECORDS: 30,
  SCORING_RULES: 120,
  GROUP_MEMBERS: 30,
  USER_PROFILE: 180,
} as const;

// Endpoint-specific cache configurations
export const CACHE_CONFIGS: Record<string, CacheConfig> = {
  groups: {
    ttl: CACHE_TTL.GROUPS * 1000,
    staleWhileRevalidate: STALE_WHILE_REVALIDATE.GROUPS * 1000,
    maxSize: 100,
    enabled: true,
  },
  analytics: {
    ttl: CACHE_TTL.ANALYTICS * 1000,
    staleWhileRevalidate: STALE_WHILE_REVALIDATE.ANALYTICS * 1000,
    maxSize: 50,
    enabled: true,
  },
  "score-records": {
    ttl: CACHE_TTL.SCORE_RECORDS * 1000,
    staleWhileRevalidate: STALE_WHILE_REVALIDATE.SCORE_RECORDS * 1000,
    maxSize: 200,
    enabled: true,
  },
  "scoring-rules": {
    ttl: CACHE_TTL.SCORING_RULES * 1000,
    staleWhileRevalidate: STALE_WHILE_REVALIDATE.SCORING_RULES * 1000,
    maxSize: 50,
    enabled: true,
  },
  "group-members": {
    ttl: CACHE_TTL.GROUP_MEMBERS * 1000,
    staleWhileRevalidate: STALE_WHILE_REVALIDATE.GROUP_MEMBERS * 1000,
    maxSize: 100,
    enabled: true,
  },
  "user-profile": {
    ttl: CACHE_TTL.USER_PROFILE * 1000,
    staleWhileRevalidate: STALE_WHILE_REVALIDATE.USER_PROFILE * 1000,
    maxSize: 20,
    enabled: true,
  },
} as const;

// Cache invalidation patterns for smart cache busting
export const CACHE_INVALIDATION_PATTERNS = {
  // When groups are updated, invalidate related caches
  GROUPS_INVALIDATION: ["groups", "analytics", "group-members"],

  // When score records change, invalidate analytics and related data
  SCORE_RECORDS_INVALIDATION: ["analytics", "score-records", "groups"],

  // When scoring rules change, invalidate rules and related analytics
  SCORING_RULES_INVALIDATION: ["scoring-rules", "analytics", "groups"],

  // When group members change, invalidate member lists and group stats
  GROUP_MEMBERS_INVALIDATION: ["group-members", "groups", "analytics"],
} as const;

// Environment-specific cache settings
export const getCacheConfig = (
  environment: "development" | "production" = "production",
) => {
  const isDevelopment = environment === "development";

  return {
    enabled: !isDevelopment, // Disable caching in development for easier debugging
    debug: isDevelopment, // Enable debug logging in development
    maxRetries: isDevelopment ? 1 : 3,
    retryDelay: isDevelopment ? 100 : 200,
  };
};

// Default cache configuration
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttl: 180000, // 3 minutes default
  staleWhileRevalidate: 30000, // 30 seconds default
  maxSize: 100,
  enabled: true,
};

// Cache key generation utilities
export const generateCacheKey = (
  endpoint: string,
  params?: Record<string, any>,
): string => {
  const baseKey = `api:${endpoint}`;
  if (!params || Object.keys(params).length === 0) {
    return baseKey;
  }

  // Sort parameters to ensure consistent key generation
  const sortedParams = Object.keys(params)
    .sort()
    .reduce(
      (acc, key) => {
        acc[key] = params[key];
        return acc;
      },
      {} as Record<string, any>,
    );

  return `${baseKey}:${JSON.stringify(sortedParams)}`;
};

// Extract endpoint name from URL for cache lookup
export const getEndpointFromUrl = (url: string): string => {
  // Handle API routes like /api/groups, /api/analytics, etc.
  const match = url.match(/\/api\/([^/?]+)/);
  return match ? match[1] : "default";
};
