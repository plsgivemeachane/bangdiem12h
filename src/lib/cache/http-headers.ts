/**
 * HTTP Caching Headers Utility
 * Generates appropriate cache headers for API responses
 */

import { createHash } from "crypto";
import { CACHE_CONFIGS, getEndpointFromUrl } from "./config";

export interface CacheHeaders {
  "Cache-Control": string;
  ETag?: string;
  "Last-Modified"?: string;
  Vary?: string;
}

// Generate ETag from response data
export const generateETag = (data: any): string => {
  const content = typeof data === "string" ? data : JSON.stringify(data);
  const hash = createHash("sha256");
  hash.update(content);
  return hash.digest("hex");
};
// Generate Last-Modified header from current time
export const generateLastModified = (): string => {
  return new Date().toUTCString();
};

// Get cache headers for specific endpoint
export const getCacheHeaders = (
  url: string,
  data: any,
  options?: {
    includeETag?: boolean;
    includeLastModified?: boolean;
    customTtl?: number;
  },
): CacheHeaders => {
  const endpoint = getEndpointFromUrl(url);
  const config = CACHE_CONFIGS[endpoint] || CACHE_CONFIGS["default"];

  // Build Cache-Control header
  const cacheControl = [
    "public", // Allow caching by public caches
    `max-age=${Math.floor(config.ttl / 1000)}`, // Cache for TTL seconds
    `stale-while-revalidate=${Math.floor(config.staleWhileRevalidate / 1000)}`, // Serve stale while revalidate
    config.enabled ? "" : "no-cache", // Disable caching if not enabled
  ]
    .filter(Boolean)
    .join(", ");

  const headers: CacheHeaders = {
    "Cache-Control": cacheControl,
  };

  // Add ETag if requested and data is provided
  if (options?.includeETag !== false && data) {
    headers["ETag"] = generateETag(data);
  }

  // Add Last-Modified if requested
  if (options?.includeLastModified !== false) {
    headers["Last-Modified"] = generateLastModified();
  }

  // Add Vary header for proper cache key differentiation
  headers["Vary"] = "Accept, Authorization, Content-Type";

  return headers;
};

// Apply cache headers to Next.js response
export const applyCacheHeaders = (
  response: any,
  url: string,
  data: any,
  options?: {
    includeETag?: boolean;
    includeLastModified?: boolean;
  },
): any => {
  const headers = getCacheHeaders(url, data, options);

  // Apply headers to response
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
};

// Handle conditional requests (If-None-Match, If-Modified-Since)
export const handleConditionalRequest = (
  request: Request,
  data: any,
): { shouldReturn304: boolean; response?: Response } => {
  const ifNoneMatch = request.headers.get("If-None-Match");
  const ifModifiedSince = request.headers.get("If-Modified-Since");

  const etag = generateETag(data);
  const lastModified = generateLastModified();

  // Check ETag
  if (ifNoneMatch && ifNoneMatch === etag) {
    return {
      shouldReturn304: true,
      response: new Response(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Last-Modified": lastModified,
        },
      }),
    };
  }

  // Check Last-Modified
  if (ifModifiedSince) {
    const modifiedSinceDate = new Date(ifModifiedSince);
    const lastModifiedDate = new Date(lastModified);

    if (modifiedSinceDate >= lastModifiedDate) {
      return {
        shouldReturn304: true,
        response: new Response(null, {
          status: 304,
          headers: {
            ETag: etag,
            "Last-Modified": lastModified,
          },
        }),
      };
    }
  }

  return { shouldReturn304: false };
};

// Cache key generators for different endpoints
export const generateCacheKeys = {
  // Groups endpoint cache keys
  groups: (userId?: string) => `groups:${userId || "all"}`,

  // Analytics endpoint cache keys
  analytics: (params: Record<string, any>) => {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = params[key];
          return acc;
        },
        {} as Record<string, any>,
      );
    return `analytics:${JSON.stringify(sortedParams)}`;
  },

  // Score records endpoint cache keys
  scoreRecords: (groupId: string, filters?: Record<string, any>) => {
    const filterKey = filters ? JSON.stringify(filters) : "none";
    return `score-records:${groupId}:${filterKey}`;
  },

  // Scoring rules endpoint cache keys
  scoringRules: (groupId?: string) => `scoring-rules:${groupId || "all"}`,

  // Group members endpoint cache keys
  groupMembers: (groupId: string) => `group-members:${groupId}`,
};

// Cache invalidation utilities
export const invalidateCacheKeys = {
  // Invalidate all related cache keys
  groups: () => {
    // Invalidate groups cache
    // This would typically integrate with your cache store
    console.log("Invalidating groups cache");
  },

  analytics: (groupId?: string) => {
    console.log(`Invalidating analytics cache for group: ${groupId || "all"}`);
  },

  scoreRecords: (groupId?: string) => {
    console.log(
      `Invalidating score records cache for group: ${groupId || "all"}`,
    );
  },

  scoringRules: (groupId?: string) => {
    console.log(
      `Invalidating scoring rules cache for group: ${groupId || "all"}`,
    );
  },

  groupMembers: (groupId?: string) => {
    console.log(
      `Invalidating group members cache for group: ${groupId || "all"}`,
    );
  },
};
