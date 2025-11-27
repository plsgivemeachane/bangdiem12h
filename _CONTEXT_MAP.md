# Context Map: Group Creation Permission Fix

## 1. Topography & Coupling

| File Path | Responsibility (1 sentence) | In-Scope Exports | Coupling Risk | Dependency Direction |
|-----------|----------------------------|------------------|---------------|---------------------|
| src/hooks/use-auth.ts | Provides authentication state and permission checking logic for the entire app. | useAuth, usePermissions, hasPermission | CRITICAL - Used by all components that need auth/permission checks | Imports from next-auth/react |
| src/components/groups/GroupList.tsx | Displays list of groups with create button and filtering capabilities. | GroupList | HIGH - Used by groups page and potentially other pages | Imports usePermissions from @/hooks/use-auth |
| src/app/groups/page.tsx | Main groups page that displays group statistics and list. | Default export (page component) | MEDIUM - Route page, uses GroupList component | Imports GroupList, useAuth |
| src/types/index.ts | Central type definitions for the application. | UserRole, Group, User, etc. | CRITICAL - Used throughout the app | No local dependencies |
| prisma/schema.prisma | Database schema definition including enums and models. | UserRole enum, User model | CRITICAL - Defines database structure | No local dependencies |

## 2. The "Source of Truth" (Verbatim Definitions)

### 2.1 Core Interfaces (from types/index.ts)

```typescript
// Location: src/types/index.ts L94-L97
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}
```

### 2.2 Permission Logic (from src/hooks/use-auth.ts)

```typescript
// Location: src/hooks/use-auth.ts L102-L134
export function usePermissions() {
  const { user, isAdmin } = useAuth();

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;

      // Admin/Owner has all permissions
      if (isAdmin) return true;

      // Check specific permissions based on role
      switch (permission) {
        case "create-group":
          return true; // All authenticated users can create groups
        case "edit-group":
          return user.role === "OWNER" || user.role === "ADMIN";
        case "delete-group":
          return user.role === "OWNER";
        case "manage-members":
          return user.role === "OWNER" || user.role === "ADMIN";
        case "create-scoring-rules":
          return user.role === "OWNER" || user.role === "ADMIN";
        case "edit-scoring-rules":
          return user.role === "OWNER" || user.role === "ADMIN";
        case "delete-scoring-rules":
          return user.role === "OWNER" || user.role === "ADMIN";
        case "view-all-scores":
          return user.role === "OWNER" || user.role === "ADMIN";
        case "record-scores":
          return true; // All members can record scores
        default:
          return false;
      }
    },
    [user, isAdmin],
  );

  return {
    hasPermission,
    isAdmin,
    user,
  };
}
```

### 2.3 Database Schema (from prisma/schema.prisma)

```prisma
// Location: prisma/schema.prisma L38-L54
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String?
  emailVerified DateTime?
  image         String?
  role          UserRole  @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts         Account[]
  activityLogs     ActivityLog[]
  groups           Group[]
  groupMemberships GroupMember[]
  scoreRecords     ScoreRecord[]
  sessions         Session[]
}

// Location: prisma/schema.prisma L162-L165
enum UserRole {
  USER
  ADMIN
}
```

## 3. Execution Path & Logic Trace

Scenario: User visits /groups page

1. Entry Point: src/app/groups/page.tsx L33 - GroupsPage component mounts
2. Authentication Check: Line 39 uses useAuth() to get user and isAuthenticated status
3. Page Header Button: Lines 248-254 check user?.role === "ADMIN" before showing create button
4. GroupList Component: Line 345 renders GroupList component
5. GroupList Header Button: src/components/groups/GroupList.tsx L113-118 uses hasPermission('create-group')
6. Permission Check: src/hooks/use-auth.ts L111-112 returns true for "create-group" permission for ALL users
7. Empty State Button: Lines 182-189 in GroupList also check hasPermission('create-group') for empty state

## 4. Data Mutation & Side Effects

| Variable/Field | Where is it mutated? | logic | Potential Side Effect |
|----------------|---------------------|-------|----------------------|
| hasPermission('create-group') | src/hooks/use-auth.ts L111 | Returns true for all authenticated users | Shows create button to ALL users including USER role |
| Button visibility | src/components/groups/GroupList.tsx L113 | Conditional rendering based on permission | Normal users see create button when they should not |

## 5. Anti-Patterns & Existing Constraints

- Inconsistent Permission Logic: The page header correctly checks user?.role === "ADMIN" but the GroupList component uses hasPermission('create-group') which returns true for all users
- Permission System Bypass: The hasPermission function explicitly returns true for "create-group" regardless of role, contradicting the intended behavior
- No OWNER Role in Database: The code references OWNER role in permission checks, but the database schema only defines USER and ADMIN roles

## 6. Shadow Dependencies (The "What did I miss?" Check)

- useAuth hook - Provides user authentication state
- usePermissions hook - Provides permission checking logic
- UserRole enum - Defines available user roles
- next-auth session - Underlying auth provider (need to verify session data includes role)

## 7. Verification Plan

- Manual Check: Log in as a USER role and verify the "tạo nhóm" button is NOT visible on /groups page
- Manual Check: Log in as an ADMIN role and verify the "tạo nhóm" button IS visible on /groups page
- Type Check: Run tsc to verify no TypeScript errors
- Lint Check: Run npm run lint to ensure code style consistency
