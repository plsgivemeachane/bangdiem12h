# Spec: Fix TypeScript NetworkMode Type Error in Query Client

## 1. User Story
- As a developer, I want to fix the TypeScript compilation error in `src/lib/cache/query-client.ts:203` so that the build passes and the application compiles successfully.

## 2. Acceptance Criteria
- [ ] The TypeScript compilation error in `src/lib/cache/query-client.ts:203` is resolved
- [ ] The comparison between 'NetworkMode | undefined' and '"offline"' is fixed with proper type handling
- [ ] The application builds without TypeScript errors
- [ ] The query client configuration maintains its intended functionality
- [ ] Similar NetworkMode comparison issues are identified and fixed if they exist elsewhere in the codebase

## 3. Implementation Boundaries & Scope

### What to Implement:
- Fix the type mismatch in the NetworkMode comparison on line 203 of `src/lib/cache/query-client.ts`
- Ensure proper type handling for all NetworkMode comparisons in the codebase
- Verify that the query client functionality remains intact after the fix

### What to Reuse (Do NOT Re-implement):
- Keep all existing query client configuration and settings
- Preserve all cache persistence functionality in `cachePersistence` object
- Maintain all existing query key patterns and invalidation logic
- Do not modify the React Query client initialization or default options

### What NOT to Touch:
- The `networkMode: "online"` configuration in query defaults (lines 40, 45)
- All other query client configuration options (staleTime, gcTime, retry logic, etc.)
- The `cachePersistence` functionality - only fix the type error, don't change behavior
- Any imports or dependencies

## 4. Relevant Code Context

### Primary File:
- **File:** `src/lib/cache/query-client.ts`
- **Error Location:** Line 203
- **Problem Code:**
```typescript
if (
  typeof window !== "undefined" &&
  queryClient.getDefaultOptions().queries?.networkMode !== "offline"  // ← Type error here
) {
```

### Root Cause Analysis:
The error occurs because:
1. `queryClient.getDefaultOptions().queries?.networkMode` returns type `NetworkMode | undefined` (union type due to optional chaining)
2. The comparison `!== "offline"` expects a direct string literal comparison
3. TypeScript sees no overlap between `NetworkMode | undefined` and `"offline"`

### Similar Patterns Found:
- `src/lib/cache/query-client.ts` lines 40, 45: `networkMode: "online"` (configuration)
- `src/lib/cache/query-provider.tsx` lines 87, 91: `networkMode: "online"` (configuration)
- **No other comparison patterns found** - this is an isolated issue

### Example Pattern for Fix:
The solution should handle the union type properly:
```typescript
// Current (problematic):
queryClient.getDefaultOptions().queries?.networkMode !== "offline"

// Possible fix options:
// Option 1: Type assertion
(queryClient.getDefaultOptions().queries?.networkMode as string) !== "offline"

// Option 2: Explicit check
queryClient.getDefaultOptions().queries?.networkMode !== undefined && 
queryClient.getDefaultOptions().queries?.networkMode !== "offline"

// Option 3: Nullish coalescing with explicit comparison
(queryClient.getDefaultOptions().queries?.networkMode ?? "online") !== "offline"
```

### Context of the Code:
This comparison is part of the `cachePersistence.saveCache()` method, which:
1. Only runs on the client side (`typeof window !== "undefined"`)
2. Only saves cache when networkMode is not "offline" (presumably to avoid saving cache when completely offline)
3. Uses sessionStorage to persist query cache data for performance

### Technical Details:
- **Technology Stack:** TanStack React Query v5
- **TypeScript Version:** 5.0+
- **Error Type:** Type 'NetworkMode | undefined' is not comparable to type '"offline"'
- **NetworkMode Type:** Comes from TanStack Query types (likely `"online" | "offline" | "always"`)