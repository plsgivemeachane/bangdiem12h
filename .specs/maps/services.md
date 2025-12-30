# Service Layer Map

## Overview
This document describes the service layer in `src/lib/services/**` directory. Services encapsulate business logic, data operations, and provide a clean API for components and API routes to interact with.

## Service Layer Structure
```
src/lib/services/
└── auth.service.ts

src/lib/
├── activity-logger.ts        # Centralized activity logging
├── auth.ts                   # NextAuth configuration
├── prisma.ts                 # Prisma client singleton
└── api-utils.ts              # API utility functions
```

---

## Core Principles

### Service Pattern
All services follow these patterns:
1. **Static Class Methods**: All services use static class methods
2. **Result Pattern**: Return `{ success: boolean; data?: T; error?: string }`
3. **Transaction Support**: Use `prisma.$transaction()` for multi-step operations
4. **Activity Logging**: Log significant operations via `logActivity()`
5. **Error Handling**: Custom error classes extend `Error`
6. **No Passwords in Response**: Never include password in returned data

### Service Result Pattern
```typescript
export interface AuthServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

**Usage**:
```typescript
const result = await AuthService.createUser(userData);
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

---

## Services

### AuthService
**File**: `src/lib/services/auth.service.ts`

**Purpose**: Handle user registration, login, and management operations

#### Static Methods

##### `createUser(userData: CreateUserData): Promise<AuthServiceResult<UserData>>`
Creates a new user with hashed password.

**Input**:
```typescript
{
  name: string;
  email: string;
  password: string;
  role?: UserRole; // Defaults to USER
}
```

**Output**:
```typescript
{
  success: boolean;
  data?: UserData;  // User without password
  error?: string;
}
```

**Process**:
1. Check if user already exists by email
2. Hash password using `hashPassword()` from `@/lib/utils/password`
3. Create user in transaction
4. Log `USER_REGISTERED` activity
5. Return user data without password

**Error Cases**:
- User already exists
- Database constraint violation

---

##### `login(loginData: LoginData): Promise<AuthServiceResult<UserData>>`
Verify user credentials and return user data.

**Input**:
```typescript
{
  email: string;
  password: string;
}
```

**Output**:
```typescript
{
  success: boolean;
  data?: UserData;  // User without password
  error?: string;
}
```

**Process**:
1. Find user by email (including password field)
2. Check if user has password (OAuth users don't)
3. Verify password using `verifyPassword()` from `@/lib/utils/password`
4. Log `USER_LOGIN` activity on success
5. Log `LOGIN_FAILED` activity on failure
6. Return user data without password

**Error Cases**:
- User not found (generic error message for security)
- User is OAuth user (no password set)
- Invalid password (generic error message)
- System error

**Security Notes**:
- Returns generic error messages to prevent user enumeration
- Logs all failed attempts with reason

---

##### `updatePassword(userId: string, newPassword: string): Promise<AuthServiceResult<void>>`
Update user password.

**Process**:
1. Hash new password
2. Update in transaction
3. No activity logging (password changes are sensitive)

**Error Cases**:
- User not found
- Database error

---

##### `findUserById(userId: string): Promise<AuthServiceResult<UserData>>`
Find user by ID.

**Output**:
```typescript
{
  success: boolean;
  data?: UserData;  // User without password
  error?: string;
}
```

**Process**:
1. Query user by ID
2. Exclude password from result

---

##### `findUserByEmail(email: string): Promise<AuthServiceResult<UserData>>`
Find user by email.

**Output**: Same as `findUserById`

---

##### `isAdmin(userId: string): Promise<boolean>`
Check if user has admin role.

**Process**:
1. Query user role
2. Return boolean (false on error, not throw)

**Usage**:
```typescript
const isAdmin = await AuthService.isAdmin(session.user.id);
if (!isAdmin) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}
```

---

##### `deleteUser(userId: string): Promise<AuthServiceResult<void>>`
Delete user and all related data.

**Process**:
1. Delete user in transaction
2. Cascade handles related data (groups, memberships, scores, logs)

**Note**: No activity logging as user is being deleted

---

## Activity Logger

**File**: `src/lib/activity-logger.ts`

### Core Function

#### `logActivity(params: LogActivityParams): Promise<void>`
Centralized activity logging function.

**Input**:
```typescript
{
  userId?: string | null;  // Null for anonymous operations
  groupId?: string;        // Optional group context
  action: ActivityType;   // Enum from @/types
  description: string;     // Human-readable Vietnamese description
  metadata?: Record<string, any>;  // Additional structured data
}
```

**Process**:
1. Create `ActivityLog` record in database
2. Silently fail (don't throw) to avoid breaking main flow

**Usage**:
```typescript
await logActivity({
  userId: session.user.id,
  groupId: group.id,
  action: ActivityType.SCORE_RECORDED,
  description: `Đã ghi điểm cho ${user.name}`,
  metadata: { userId: user.id, ruleId: rule.id, points: 10 }
});
```

---

### Specialized Logging Functions

#### Auth-Related Logging

##### `logUserRegistration(userId: string, userData: { email: string; name?: string; role: string })`
Log user registration event.

**Action**: `ActivityType.USER_REGISTERED`

**Metadata**: email, name, role

---

##### `logUserLogin(userId: string, loginData: { email: string; method: "password" | "oauth"; provider?: string })`
Log successful user login.

**Action**: `ActivityType.USER_LOGIN`

**Metadata**: email, loginMethod, provider

**Method Labels**:
- "password" → "mật khẩu"
- "oauth" → "OAuth"

---

##### `logLoginFailed(email: string, reason: string, ipAddress?: string)`
Log failed login attempt.

**Action**: `ActivityType.LOGIN_FAILED`

**Note**: userId is null (no valid user)

**Metadata**: email, reason, ipAddress, timestamp

**Reasons**:
- "user_not_found"
- "oauth_user_no_password"
- "invalid_password"
- "system_error"

---

##### `logPasswordResetRequested(userId: string, email: string, ipAddress?: string)`
Log password reset request.

**Action**: `ActivityType.PASSWORD_RESET_REQUESTED`

**Metadata**: email, ipAddress

---

##### `logPasswordResetCompleted(userId: string, email: string, ipAddress?: string)`
Log password reset completion.

**Action**: `ActivityType.PASSWORD_RESET_COMPLETED`

**Metadata**: email, ipAddress

---

##### `logAdminUserCreated(userId: string, adminData: { email: string; name?: string; createdBy: string })`
Log admin user creation.

**Action**: `ActivityType.ADMIN_USER_CREATED`

**Metadata**: email, name, createdBy

---

## Utility Functions

### Auth Configuration
**File**: `src/lib/auth.ts`

**Purpose**: NextAuth.js configuration and session management

**Key Features**:
- `PrismaAdapter` for database storage
- `CredentialsProvider` for password authentication
- Extended session types with custom user data
- Activity logging on auth events
- JWT strategy for sessions

**Callbacks**:
- `session()`: Fetch fresh user data from database
- `jwt()`: Add user ID and role to JWT token

**Events**:
- `createUser()`: Log `USER_REGISTERED` activity

---

### API Utilities
**File**: `src/lib/api-utils.ts`

**Purpose**: Common utility functions for API routes

**Functions** (typical patterns):
- Error handling
- Response formatting
- Validation helpers
- Session helpers

---

### Prisma Client
**File**: `src/lib/prisma.ts`

**Purpose**: Singleton Prisma client instance

**Usage**:
```typescript
import { prisma } from "@/lib/prisma";

const users = await prisma.user.findMany();
```

**Note**: Import from this file, never create new `PrismaClient()` instances

---

## Service Integration Patterns

### API Route Pattern
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuthService } from "@/lib/services/auth.service";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const result = await AuthService.createUser(body);

  if (result.success) {
    return NextResponse.json({ success: true, data: result.data });
  } else {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }
}
```

### Component Pattern (Direct API Call)
```typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    const response = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  onSuccess: (result) => {
    if (result.success) {
      toast.success("Success!");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    } else {
      toast.error(result.error);
    }
  }
});
```

---

## Error Handling

### Custom Error Classes
```typescript
class DatabaseError extends Error {
  constructor(message: string, originalError?: any) {
    super(message);
    this.name = "DatabaseError";
    
    if (originalError) {
      this.message += `: ${originalError.message || originalError}`;
    }
  }
}
```

### Error Handling Pattern
```typescript
try {
  // Operation
} catch (error) {
  console.error("Operation failed:", error);
  throw new DatabaseError("Không thể thực hiện thao tác", error);
}
```

### Silent Failure (Activity Logging)
Activity logger never throws errors to avoid breaking main flow:
```typescript
try {
  await prisma.activityLog.create({ ... });
} catch (error) {
  console.error("Ghi nhật ký hoạt động thất bại:", error);
  // Don't throw
}
```

---

## Activity Logging Integration

### When to Log Activities
All significant user actions should be logged:

**Auth Events**:
- User registration
- User login
- Failed login attempts
- Password reset requests/completions
- Admin user operations

**Group Events** (via API routes):
- Group created/updated/deleted
- Member added/removed/role updated
- Ownership transferred
- Rules added/removed/toggled/deleted

**Score Events** (via API routes):
- Score recorded/updated/deleted

### Activity Log Metadata Patterns

**Auth Events**:
```typescript
{
  email: string;
  name?: string;
  role?: string;
  loginMethod?: "password" | "oauth";
  provider?: string;
  reason?: string;
  ipAddress?: string;
  timestamp?: string;
}
```

**Group Events**:
```typescript
{
  groupName: string;
  memberCount?: number;
  oldOwner?: string;
  newOwner?: string;
}
```

**Score Events**:
```typescript
{
  userId: string;
  userName: string;
  ruleId: string;
  ruleName: string;
  points: number;
}
```

---

## Transaction Patterns

### Simple Transaction
```typescript
await prisma.$transaction(async (tx) => {
  await tx.user.create({ ... });
  await logUserRegistration(userId, userData);
});
```

### Multi-Step Transaction
```typescript
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ ... });
  await tx.groupMember.create({
    data: { userId: user.id, groupId, role: "OWNER" }
  });
});
```

### Transaction with Error Handling
```typescript
try {
  const result = await prisma.$transaction(async (tx) => {
    // Operations
  });
  return { success: true, data: result };
} catch (error) {
  console.error("Transaction failed:", error);
  return { success: false, error: "Transaction failed" };
}
```

---

## Service Dependencies

| Service | Dependencies | Used By |
|---------|--------------|---------|
| AuthService | prisma, password utils, activity logger | API routes (auth), NextAuth config |
| Activity Logger | prisma | All services, API routes |

---

## Security Considerations

1. **Never Return Passwords**: All service methods exclude password from returned data
2. **Generic Error Messages**: Login failures return generic messages to prevent user enumeration
3. **Rate Limiting**: Should be implemented at middleware level
4. **Admin Checks**: Use `AuthService.isAdmin()` before admin operations
5. **Transaction Isolation**: Use `prisma.$transaction()` for consistency
6. **Activity Auditing**: Log all significant operations for audit trail

---

## Extending the Service Layer

### Creating a New Service

1. **Create Service File**: `src/lib/services/[name].service.ts`
2. **Define Interfaces**:
   ```typescript
   export interface CreateXData { ... }
   export interface UpdateXData { ... }
   export interface XData { ... }
   export interface XServiceResult<T> { ... }
   ```
3. **Create Service Class**:
   ```typescript
   export class XService {
     static async create(data: CreateXData): Promise<XServiceResult<XData>> { ... }
     static async update(id: string, data: UpdateXData): Promise<XServiceResult<XData>> { ... }
     static async find(id: string): Promise<XServiceResult<XData>> { ... }
     static async delete(id: string): Promise<XServiceResult<void>> { ... }
   }
   ```
4. **Add Activity Logging**: Call `logActivity()` in methods
5. **Use Transactions**: For multi-step operations
6. **Error Handling**: Use `DatabaseError` for database failures

### Example: Group Service
```typescript
// src/lib/services/group.service.ts

import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";
import { ActivityType } from "@/types";

export class GroupService {
  static async create(userId: string, groupData: { name: string; description?: string }) {
    try {
      const group = await prisma.$transaction(async (tx) => {
        const group = await tx.group.create({
          data: {
            name: groupData.name,
            description: groupData.description,
            createdById: userId,
          },
        });

        // Create owner membership
        await tx.groupMember.create({
          data: {
            userId,
            groupId: group.id,
            role: "OWNER",
          },
        });

        await logActivity({
          userId,
          groupId: group.id,
          action: ActivityType.GROUP_CREATED,
          description: `Đã tạo nhóm ${group.name}`,
          metadata: { groupName: group.name },
        });

        return group;
      });

      return { success: true, data: group };
    } catch (error) {
      console.error("Tạo nhóm thất bại:", error);
      return { success: false, error: "Không thể tạo nhóm" };
    }
  }
}
```
