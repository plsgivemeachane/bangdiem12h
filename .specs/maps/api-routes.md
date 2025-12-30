# API Routes Map

## Overview
This document describes all API endpoints in `src/app/api/**` directory using Next.js 14 App Router API routes. All routes follow RESTful conventions and use proper authentication and authorization.

## API Structure
```
src/app/api/
├── activity-logs/
│   └── route.ts
├── admin/
│   ├── cache/
│   │   └── route.ts
│   ├── scoring-rules/
│   │   ├── [id]/
│   │   │   └── route.ts
│   │   └── route.ts
│   └── users/
│       ├── [id]/
│       │   ├── role/
│       │   │   └── route.ts
│       │   └── route.ts
│       └── route.ts
├── analytics/
│   ├── groups/[id]/
│   │   └── route.ts
│   ├── leaderboard/
│   │   └── route.ts
│   └── route.ts
├── auth/
│   ├── register/
│   │   └── route.ts
│   ├── reset-password/
│   │   └── route.ts
│   └── session/
│       └── route.ts
├── groups/
│   ├── [id]/
│   │   ├── members/
│   │   │   ├── [userId]/
│   │   │   │   ├── role/
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── invite/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── rules/
│   │   │   ├── [ruleId]/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── scores/
│   │   │   └── route.ts
│   │   ├── ownership/
│   │   │   └── route.ts
│   │   └── route.ts
│   └── route.ts
├── score-records/
│   └── route.ts
├── scoring-rules/
│   ├── [id]/
│   │   └── route.ts
│   └── route.ts
└── user/
    └── [id]/
        └── route.ts
```

---

## Authentication Endpoints

### POST /api/auth/register
**File**: `src/app/api/auth/register/route.ts`

**Purpose**: Register new user with password authentication

**Request Body**:
```typescript
{
  name: string;
  email: string;
  password: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  data?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
  error?: string;
}
```

**Validation**: 
- Email format
- Password strength (8+ chars, complexity)
- Unique email constraint

**Side Effects**:
- Logs `USER_REGISTERED` activity
- Creates default USER role

---

### POST /api/auth/reset-password
**File**: `src/app/api/auth/reset-password/route.ts`

**Purpose**: Initiate password reset flow

**Request Body**:
```typescript
{
  email: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  message?: string;
}
```

**Side Effects**:
- Logs `PASSWORD_RESET_REQUESTED` activity
- Sends email (not implemented yet)

---

### GET /api/auth/session
**File**: `src/app/api/auth/session/route.ts`

**Purpose**: Get current session status

**Response**:
```typescript
{
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    image: string | null;
    emailVerified: Date | null;
    createdAt: Date;
  } | null;
}
```

---

## Group Management Endpoints

### GET /api/groups
**File**: `src/app/api/groups/route.ts`

**Purpose**: Get all groups for current user

**Authentication**: Required

**Response**:
```typescript
{
  success: boolean;
  data: Group[];
}
```

**Caching**: Uses `getCacheHeaders()` from `@/lib/cache/http-headers`

**Features**:
- Includes groups where user is member
- Includes groups created by user
- Virtual admin sees all groups

---

### POST /api/groups
**File**: `src/app/api/groups/route.ts`

**Purpose**: Create new group

**Authentication**: Required

**Request Body**:
```typescript
{
  name: string;
  description?: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  data: Group;
  error?: string;
}
```

**Side Effects**:
- Creates group
- Creates membership as OWNER for creator
- Logs `GROUP_CREATED` activity

---

### GET /api/groups/[id]
**File**: `src/app/api/groups/[id]/route.ts`

**Purpose**: Get specific group details

**Authentication**: Required

**Authorization**: Must be member or admin

**Response**:
```typescript
{
  success: boolean;
  data: Group;
  error?: string;
}
```

**Includes**:
- Members with user details
- Group rules with rule details
- Score count

---

### PATCH /api/groups/[id]
**File**: `src/app/api/groups/[id]/route.ts`

**Purpose**: Update group details

**Authentication**: Required

**Authorization**: Owner or admin

**Request Body**:
```typescript
{
  name?: string;
  description?: string;
  isActive?: boolean;
}
```

**Response**:
```typescript
{
  success: boolean;
  data: Group;
}
```

**Side Effects**:
- Logs `GROUP_UPDATED` activity

---

### DELETE /api/groups/[id]
**File**: `src/app/api/groups/[id]/route.ts`

**Purpose**: Soft delete group

**Authentication**: Required

**Authorization**: Owner or admin

**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

**Side Effects**:
- Sets `isActive = false`
- Logs `GROUP_DELETED` activity

---

## Group Member Management Endpoints

### GET /api/groups/[id]/members
**File**: `src/app/api/groups/[id]/members/route.ts`

**Purpose**: Get all members of a group

**Authentication**: Required

**Authorization**: Member or admin

**Response**:
```typescript
{
  success: boolean;
  data: {
    members: Array<{
      id: string;
      userId: string;
      groupId: string;
      role: GroupRole;
      joinedAt: Date;
      user: {
        id: string;
        name: string;
        email: string;
      };
    }>;
  };
}
```

---

### POST /api/groups/[id]/members
**File**: `src/app/api/groups/[id]/members/route.ts`

**Purpose**: Add member to group

**Authentication**: Required

**Authorization**: Owner, admin, or virtual admin

**Request Body**:
```typescript
{
  email: string;
  role: GroupRole;
}
```

**Response**:
```typescript
{
  success: boolean;
  data: GroupMember;
  error?: string;
}
```

**Side Effects**:
- Finds user by email
- Creates membership
- Logs `MEMBER_ADDED` activity

---

### DELETE /api/groups/[id]/members/[userId]
**File**: `src/app/api/groups/[id]/members/[userId]/route.ts`

**Purpose**: Remove member from group

**Authentication**: Required

**Authorization**: Owner, admin, or self (member)

**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

**Side Effects**:
- Removes membership
- Logs `MEMBER_REMOVED` activity
- Transfers ownership if needed

---

### PATCH /api/groups/[id]/members/[userId]/role
**File**: `src/app/api/groups/[id]/members/[userId]/role/route.ts`

**Purpose**: Update member role

**Authentication**: Required

**Authorization**: Owner only

**Request Body**:
```typescript
{
  role: GroupRole;
}
```

**Response**:
```typescript
{
  success: boolean;
  data: GroupMember;
}
```

**Side Effects**:
- Updates role
- Logs `MEMBER_ROLE_UPDATED` activity

---

### POST /api/groups/[id]/members/invite
**File**: `src/app/api/groups/[id]/members/invite/route.ts`

**Purpose**: Invite user to group

**Authentication**: Required

**Authorization**: Owner, admin, or virtual admin

**Request Body**:
```typescript
{
  email: string;
  role?: GroupRole; // defaults to MEMBER
}
```

**Response**:
```typescript
{
  success: boolean;
  data: GroupMember;
}
```

**Side Effects**:
- Creates membership
- Logs `MEMBER_INVITED` activity

---

## Group Scoring Rules Endpoints

### GET /api/groups/[id]/rules
**File**: `src/app/api/groups/[id]/rules/route.ts`

**Purpose**: Get all scoring rules for a group

**Authentication**: Required

**Authorization**: Member or admin

**Response**:
```typescript
{
  success: boolean;
  data: {
    rules: Array<{
      id: string;
      groupId: string;
      ruleId: string;
      isActive: boolean;
      rule: ScoringRule;
    }>;
  };
}
```

---

### POST /api/groups/[id]/rules
**File**: `src/app/api/groups/[id]/rules/route.ts`

**Purpose**: Add scoring rule to group

**Authentication**: Required

**Authorization**: Owner or admin

**Request Body**:
```typescript
{
  ruleId: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  data: GroupRule;
}
```

**Side Effects**:
- Links rule to group
- Logs `RULE_ADDED_TO_GROUP` activity

---

### DELETE /api/groups/[id]/rules/[ruleId]
**File**: `src/app/api/groups/[id]/rules/[ruleId]/route.ts`

**Purpose**: Remove scoring rule from group

**Authentication**: Required

**Authorization**: Owner or admin

**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

**Side Effects**:
- Unlinks rule from group
- Logs `RULE_REMOVED_FROM_GROUP` activity

---

## Group Score Recording Endpoints

### GET /api/groups/[id]/scores
**File**: `src/app/api/groups/[id]/scores/route.ts`

**Purpose**: Get score records for a group

**Authentication**: Required

**Authorization**: Member or admin

**Query Params**:
- `userId` (optional) - Filter by user
- `ruleId` (optional) - Filter by rule
- `startDate` (optional) - Filter start date
- `endDate` (optional) - Filter end date

**Response**:
```typescript
{
  success: boolean;
  data: {
    scoreRecords: ScoreRecord[];
  };
}
```

**Caching**: Uses `getCacheHeaders()`

---

### POST /api/groups/[id]/scores
**File**: `src/app/api/groups/[id]/scores/route.ts`

**Purpose**: Record score for a user

**Authentication**: Required

**Authorization**: Owner, admin, or virtual admin

**Request Body**:
```typescript
{
  userId: string;
  ruleId: string;
  points: number;
  criteria?: Record<string, any>;
  notes?: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  data: ScoreRecord;
}
```

**Side Effects**:
- Creates score record
- Logs `SCORE_RECORDED` activity

---

## Ownership Transfer Endpoints

### POST /api/groups/[id]/ownership
**File**: `src/app/api/groups/[id]/ownership/route.ts`

**Purpose**: Transfer group ownership

**Authentication**: Required

**Authorization**: Current owner only

**Request Body**:
```typescript
{
  newOwnerId: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

**Side Effects**:
- Updates group creator
- Changes old owner to ADMIN role
- Changes new owner to OWNER role
- Logs `OWNERSHIP_TRANSFERRED` activity

---

## Global Scoring Rules Endpoints

### GET /api/scoring-rules
**File**: `src/app/api/scoring-rules/route.ts`

**Purpose**: Get all scoring rules

**Authentication**: Required

**Authorization**: Admin only

**Response**:
```typescript
{
  success: boolean;
  data: ScoringRule[];
}
```

---

### POST /api/scoring-rules
**File**: `src/app/api/scoring-rules/route.ts`

**Purpose**: Create new scoring rule

**Authentication**: Required

**Authorization**: Admin only

**Request Body**:
```typescript
{
  name: string;
  description?: string;
  criteria: Record<string, any>;
  points: number;
}
```

**Response**:
```typescript
{
  success: boolean;
  data: ScoringRule;
}
```

**Side Effects**:
- Logs `SCORING_RULE_CREATED` activity

---

### GET /api/scoring-rules/[id]
**File**: `src/app/api/scoring-rules/[id]/route.ts`

**Purpose**: Get specific scoring rule

**Authentication**: Required

**Authorization**: Admin only

**Response**:
```typescript
{
  success: boolean;
  data: ScoringRule;
}
```

---

### PATCH /api/scoring-rules/[id]
**File**: `src/app/api/scoring-rules/[id]/route.ts`

**Purpose**: Update scoring rule

**Authentication**: Required

**Authorization**: Admin only

**Request Body**:
```typescript
{
  name?: string;
  description?: string;
  criteria?: Record<string, any>;
  points?: number;
  isActive?: boolean;
}
```

**Response**:
```typescript
{
  success: boolean;
  data: ScoringRule;
}
```

**Side Effects**:
- Logs `SCORING_RULE_UPDATED` or `SCORING_RULE_TOGGLED` activity

---

### DELETE /api/scoring-rules/[id]
**File**: `src/app/api/scoring-rules/[id]/route.ts`

**Purpose**: Delete scoring rule

**Authentication**: Required

**Authorization**: Admin only

**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

**Side Effects**:
- Logs `SCORING_RULE_DELETED` activity

---

## Score Records Endpoints

### GET /api/score-records
**File**: `src/app/api/score-records/route.ts`

**Purpose**: Get all score records

**Authentication**: Required

**Authorization**: Admin only

**Query Params**: Same as group scores

**Response**:
```typescript
{
  success: boolean;
  data: {
    scoreRecords: ScoreRecord[];
  };
}
```

---

## Analytics Endpoints

### GET /api/analytics
**File**: `src/app/api/analytics/route.ts`

**Purpose**: Get global analytics

**Authentication**: Required

**Authorization**: Admin only

**Response**:
```typescript
{
  success: boolean;
  data: {
    totalGroups: number;
    totalUsers: number;
    totalScoreRecords: number;
    totalPoints: number;
  };
}
```

**Caching**: Uses `getCacheHeaders()`

---

### GET /api/analytics/groups/[id]
**File**: `src/app/api/analytics/groups/[id]/route.ts`

**Purpose**: Get analytics for specific group

**Authentication**: Required

**Authorization**: Member or admin

**Query Params**:
- `period` - "week" | "month" | "year"

**Response**:
```typescript
{
  success: boolean;
  data: ScoreAnalytics;
}
```

**Includes**:
- Summary statistics
- Trend data
- Rule breakdown

**Caching**: Uses `getCacheHeaders()`

---

### GET /api/analytics/leaderboard
**File**: `src/app/api/analytics/leaderboard/route.ts`

**Purpose**: Get leaderboard data

**Authentication**: Required

**Authorization**: Admin only

**Response**:
```typescript
{
  success: boolean;
  data: Array<{
    userId: string;
    userName: string;
    totalPoints: number;
    rank: number;
  }>;
}
```

**Caching**: Uses `getCacheHeaders()`

---

## Admin User Management Endpoints

### GET /api/admin/users
**File**: `src/app/api/admin/users/route.ts`

**Purpose**: Get all users

**Authentication**: Required

**Authorization**: Admin only

**Response**:
```typescript
{
  success: boolean;
  data: User[];
}
```

---

### POST /api/admin/users
**File**: `src/app/api/admin/users/route.ts`

**Purpose**: Create user as admin

**Authentication**: Required

**Authorization**: Admin only

**Request Body**:
```typescript
{
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}
```

**Response**:
```typescript
{
  success: boolean;
  data: User;
}
```

**Side Effects**:
- Logs `ADMIN_USER_CREATED` activity

---

### GET /api/admin/users/[id]
**File**: `src/app/api/admin/users/[id]/route.ts`

**Purpose**: Get specific user details

**Authentication**: Required

**Authorization**: Admin only

**Response**:
```typescript
{
  success: boolean;
  data: User;
}
```

---

### DELETE /api/admin/users/[id]
**File**: `src/app/api/admin/users/[id]/route.ts`

**Purpose**: Delete user

**Authentication**: Required

**Authorization**: Admin only

**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

**Side Effects**:
- Cascades delete to all related records
- Logs `ADMIN_USER_DELETED` activity

---

### PATCH /api/admin/users/[id]/role
**File**: `src/app/api/admin/users/[id]/role/route.ts`

**Purpose**: Update user role

**Authentication**: Required

**Authorization**: Admin only

**Request Body**:
```typescript
{
  role: UserRole;
}
```

**Response**:
```typescript
{
  success: boolean;
  data: User;
}
```

**Side Effects**:
- Logs `ADMIN_USER_ROLE_UPDATED` activity

---

## Admin Scoring Rules Endpoints

### GET /api/admin/scoring-rules
**File**: `src/app/api/admin/scoring-rules/route.ts`

**Purpose**: Get all scoring rules (admin endpoint)

**Authentication**: Required

**Authorization**: Admin only

**Response**:
```typescript
{
  success: boolean;
  data: ScoringRule[];
}
```

---

### POST /api/admin/scoring-rules
**File**: `src/app/api/admin/scoring-rules/route.ts`

**Purpose**: Create scoring rule (admin endpoint)

**Authentication**: Required

**Authorization**: Admin only

**Request Body**:
```typescript
{
  name: string;
  description?: string;
  criteria: Record<string, any>;
  points: number;
}
```

**Response**:
```typescript
{
  success: boolean;
  data: ScoringRule;
}
```

**Side Effects**:
- Logs `SCORING_RULE_CREATED` activity

---

### GET /api/admin/scoring-rules/[id]
**File**: `src/app/api/admin/scoring-rules/[id]/route.ts`

**Purpose**: Get specific scoring rule (admin endpoint)

**Authentication**: Required

**Authorization**: Admin only

**Response**:
```typescript
{
  success: boolean;
  data: ScoringRule;
}
```

---

### PATCH /api/admin/scoring-rules/[id]
**File**: `src/app/api/admin/scoring-rules/[id]/route.ts`

**Purpose**: Update scoring rule (admin endpoint)

**Authentication**: Required

**Authorization**: Admin only

**Request Body**:
```typescript
{
  name?: string;
  description?: string;
  criteria?: Record<string, any>;
  points?: number;
  isActive?: boolean;
}
```

**Response**:
```typescript
{
  success: boolean;
  data: ScoringRule;
}
```

**Side Effects**:
- Logs `SCORING_RULE_UPDATED` or `SCORING_RULE_TOGGLED` activity

---

## Activity Log Endpoints

### GET /api/activity-logs
**File**: `src/app/api/activity-logs/route.ts`

**Purpose**: Get activity logs

**Authentication**: Required

**Authorization**: Admin only

**Query Params**:
- `userId` (optional) - Filter by user
- `groupId` (optional) - Filter by group
- `action` (optional) - Filter by action type
- `limit` (optional) - Pagination limit

**Response**:
```typescript
{
  success: boolean;
  data: ActivityLog[];
}
```

---

## Cache Management Endpoints

### GET /api/admin/cache
**File**: `src/app/api/admin/cache/route.ts`

**Purpose**: Get cache statistics

**Authentication**: Required

**Authorization**: Admin only

**Response**:
```typescript
{
  success: boolean;
  data: {
    queryCount: number;
    cacheSize: number;
    hitRate: number;
    entries: Array<{
      queryKey: string[];
      state: string;
      updatedAt: Date;
    }>;
  };
}
```

---

### DELETE /api/admin/cache
**File**: `src/app/api/admin/cache/route.ts`

**Purpose**: Clear all caches

**Authentication**: Required

**Authorization**: Admin only

**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

---

## User Profile Endpoints

### GET /api/user/[id]
**File**: `src/app/api/user/[id]/route.ts`

**Purpose**: Get user profile

**Authentication**: Required

**Authorization**: Self or admin

**Response**:
```typescript
{
  success: boolean;
  data: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt: Date;
  };
}
```

---

## Common Patterns

### Authentication Pattern
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const session = await getServerSession(authOptions);
if (!session?.user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### Authorization Pattern (Admin)
```typescript
if (session.user.role !== "ADMIN") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

### Authorization Pattern (Group Member)
```typescript
const membership = await prisma.groupMember.findUnique({
  where: {
    groupId_userId: { groupId, userId: session.user.id }
  }
});

if (!membership && session.user.role !== "ADMIN") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

### Response Pattern
```typescript
import { NextResponse } from "next/server";
import { getCacheHeaders } from "@/lib/cache/http-headers";
import { MESSAGES } from "@/lib/translations";

return NextResponse.json(
  { success: true, data: result },
  { headers: getCacheHeaders() }
);
```

### Error Pattern
```typescript
try {
  // operation
} catch (error) {
  console.error("Error:", error);
  return NextResponse.json(
    { success: false, error: MESSAGES.ERROR.GENERAL },
    { status: 500 }
  );
}
```

### Logging Pattern
```typescript
import { logActivity } from "@/lib/activity-logger";

await logActivity(userId, groupId, ActivityType.SOME_ACTION, description, metadata);
```

---

## HTTP Headers

### Cache Headers
From `@/lib/cache/http-headers`:
```typescript
export const getCacheHeaders = () => {
  return {
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
    "CDN-Cache-Control": "public, s-maxage=300",
  };
};
```

---

## Error Codes

| Status | Description |
|--------|-------------|
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Translations

All user-facing messages use `@/lib/translations.ts`:
- `LABELS` - Field labels
- `ACTIONS` - Action descriptions
- `MESSAGES` - Success/error messages
- `COMPONENTS` - Component text
- `API` - API response messages
