# Context Map: Missing Analytics/Recent Activities

## Dependency Graph
- `src/app/dashboard/page.tsx` -> `src/app/dashboard/dashboard-client.tsx`
- `src/app/dashboard/dashboard-client.tsx` imports `src/components/activity/ActivityFeed.tsx` but does NOT use it.

## Data Flow
- `DashboardClient` fetches `activity-logs` API.
- Data is stored in `stats.recentActivity`.
- Data is NOT passed to any component for rendering.

## Key Constraints
- Next.js App Router
- Client-side rendering for dashboard
- `ActivityFeed` component likely expects `logs` prop.
