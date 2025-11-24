# Context Map: Global Admin Permissions in Score Records API

## Dependency Graph
- `src/app/api/score-records/route.ts` (Target)
  - Imports `isGlobalAdmin` from `src/lib/utils/global-admin-permissions.ts` (New Dependency)
  - Imports `prisma` from `src/lib/prisma`
  - Imports `authOptions` from `src/lib/auth`
  - Imports `logActivity` from `src/lib/activity-logger`

## Data Flow
- **Input**: `PUT`, `POST`, `DELETE` requests to `/api/score-records`.
- **Processing**:
  - Authenticate user via `getServerSession`.
  - Check permissions:
    - Current: Checks if user is a member of the group AND has role `ADMIN` or `OWNER`.
    - New: Check if user is `Global Admin` OR (member of group AND `ADMIN`/`OWNER`).
  - Perform database operation (Update, Create, Delete `ScoreRecord`).
  - Log activity.
- **Output**: JSON response with updated/created record or success message.

## Key Constraints
- **Security**: Only authorized users (Group Admins/Owners OR Global Admins) should be able to modify score records.
- **Types**: `User` type from `next-auth` or `@/types` usually includes `role`.
- **Existing Logic**: The current logic strictly enforces group membership. Global admins might not be members of the group they are managing.
