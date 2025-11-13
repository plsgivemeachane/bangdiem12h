# Spec: URL Preloading for Router.push() Navigation

## 1. User Story
- As a user of the web application, I want all internal navigation links (router.push() calls) to be preloaded immediately when the page loads, so that page navigation feels instant without waiting for hover events.

## 2. Acceptance Criteria
- [ ] All URLs that are called via router.push() within the current page are automatically preloaded when the page first loads
- [ ] Preloading happens without requiring any user interaction (no hover, click, or wait time)
- [ ] Navigation to preloaded pages should be significantly faster than non-preloaded pages
- [ ] The preloading mechanism works with dynamic router.push() calls, not just static Next.js Link components
- [ ] Preloading doesn't break existing navigation functionality
- [ ] The solution works across all pages that contain router.push() calls
- [ ] Preloaded URLs are cached using the existing React Query infrastructure for optimal performance
- [ ] The system gracefully handles failed preloads without affecting user experience

## 3. Implementation Boundaries & Scope

### **What to Implement:**
- Create a URL preloading service that integrates with the existing React Query caching system
- Implement automatic discovery and preloading of router.push() URLs found within each page
- Extend the existing cache configuration to support URL preloading
- Add a custom hook for managing preloaded routes
- Create integration points in page components to initiate preloading
- Implement error handling and graceful degradation for failed preloads

### **What to Reuse (Do NOT Re-implement):**
- Existing React Query infrastructure (`src/lib/cache/query-client.ts`)
- Current caching configuration and staleTime settings (2 minutes)
- Existing router.push() patterns throughout the application
- Current authentication and permission systems
- Existing component structure and navigation patterns

### **What NOT to Touch:**
- Next.js core routing system or Link components
- Authentication flows and middleware
- API route handlers or database schemas
- UI components and styling
- Existing performance optimizations (Vercel Analytics, Speed Insights)
- The Prisma setup and data layer

## 4. Relevant Code Context

### **Primary File Patterns Found:**

**Current Router.push() Usage:**
```typescript
// Authentication redirects (found in multiple pages)
router.push("/auth/signin");
router.push("/dashboard");

// Group navigation patterns (src/app/groups/page.tsx)
router.push(`/groups/${group.id}/members`);
router.push(`/groups/${group.id}`);

// Dynamic URLs throughout the application
router.push('/groups/[id]/scoring')
router.push('/groups/[id]/rules')
router.push('/groups/[id]/members')
```

**Existing Caching Infrastructure:**
```typescript
// src/lib/cache/query-client.ts - Configure React Query
staleTime: 2 * 60 * 1000, // 2 minutes
gcTime: 10 * 60 * 1000, // 10 minutes

// src/components/groups/CachedGroupList.tsx - Example of optimized fetching
const { data: groupsData, isLoading } = useGroups({
  enabled: true,
  staleTime: 2 * 60 * 1000, // 2 minutes
});
```

**Application Structure:**
- Next.js 14.0.3 with App Router
- React Query for client-side caching
- TypeScript throughout
- Modular component architecture with `/pages` and `/components`

### **Key Files to Modify:**
- `src/lib/cache/` - Extend existing caching infrastructure
- `src/hooks/` - Add new preloading hooks
- Page components - Add preloading triggers
- `src/lib/` - Add URL discovery and preloading services

### **Performance Considerations:**
- Leverage existing 2-minute staleTime for optimal caching
- Use batch preloading to avoid overwhelming the network
- Implement rate limiting to prevent excessive prefetch requests
- Respect user's network conditions (offline/low-bandwidth scenarios)

### **Integration Points:**
- Work with existing `useAuth` hook for authentication-aware preloading
- Integrate with current permission system to only preload accessible routes
- Use existing translation system for any user-facing preloading indicators
- Maintain compatibility with current error handling patterns

## 5. Technical Implementation Strategy

### **URL Discovery Mechanism:**
1. Parse all router.push() calls within the current page component
2. Extract dynamic URL patterns (e.g., `/groups/${id}/members`)
3. Generate concrete URLs from available data
4. Filter URLs based on user permissions and authentication status

### **Preloading Implementation:**
1. Create a `usePreloadRoutes` hook that triggers on component mount
2. Use React Query's prefetchQuery for background data loading
3. Integrate with existing cache keys and configuration
4. Implement retry logic with exponential backoff

### **Cache Integration:**
1. Extend existing query keys factory for preloaded routes
2. Use consistent staleTime and gcTime with current configuration
3. Leverage existing optimistic updates and cache persistence
4. Maintain compatibility with current invalidation patterns

## 6. Testing Requirements

- Unit tests for URL discovery logic
- Integration tests for preloading with React Query
- Performance benchmarks comparing preloaded vs non-preloaded navigation
- Error handling tests for network failures
- Authentication state handling tests
- Memory usage monitoring for cache growth

## 7. Success Metrics

- Navigation time reduction: Target 50%+ improvement for preloaded routes
- Cache hit rate: Maintain >80% for frequently accessed preloaded pages
- User experience: Smooth transitions without loading spinners
- Performance impact: <5% increase in initial page load time
- Error rate: <1% failed preloads that affect user experience