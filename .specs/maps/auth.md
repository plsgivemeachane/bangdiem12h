# Authentication Flow Map

## Overview
This document describes the authentication flow, NextAuth.js configuration, session management, and authorization patterns in the application.

## Tech Stack
- **NextAuth.js v4**: Authentication framework
- **Prisma Adapter**: Database session storage
- **Credentials Provider**: Password-based authentication
- **JWT Strategy**: Session management
- **bcryptjs**: Password hashing

---

## Authentication Flow Diagram

```
┌─────────────┐
│  User       │
│  Interface  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Sign In Page       │
│  /auth/signin       │
│  (Form submission)  │
└──────┬──────────────┘
       │ POST /api/auth/signin
       ▼
┌─────────────────────────────┐
│  NextAuth Credentials       │
│  Provider authorize()       │
└──────┬──────────────────────┘
       │
       ├─► Check email & password presence
       │
       ├─► Find user by email (include password)
       │
       ├─► Verify password (bcrypt.compare)
       │
       ├─► Log activity (success/failure)
       │
       ▼
┌─────────────────────────┐
│  Return User Object     │
│  (id, email, name, role)│
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────┐
│  JWT Callback       │
│  (Add sub, role)    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Session Callback           │
│  (Fetch fresh user data)    │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────┐
│  Session Created    │
│  (JWT token stored) │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Redirect to        │
│  Dashboard/Home     │
└─────────────────────┘
```

---

## Configuration Files

### Main Auth Config
**File**: `src/lib/auth.ts`

**Purpose**: NextAuth.js configuration and callbacks

#### Key Settings

```typescript
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({ ... })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    session({ session, token }) { ... },
    jwt({ token, user }) { ... }
  },
  events: {
    createUser({ user }) { ... }
  }
}
```

---

### Credentials Provider

**Purpose**: Handle password-based authentication

```typescript
CredentialsProvider({
  name: "credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Mật khẩu", type: "password" },
  },
  async authorize(credentials) {
    // 1. Validate inputs
    if (!credentials?.email || !credentials?.password) {
      return null;
    }

    // 2. Find user by email (include password)
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
      },
    });

    // 3. Check user exists
    if (!user) {
      await logLoginFailed(credentials.email, "user_not_found");
      return null;
    }

    // 4. Check user has password (OAuth users don't)
    if (!user.password) {
      await logLoginFailed(credentials.email, "oauth_user_no_password");
      return null;
    }

    // 5. Verify password
    const isValidPassword = await verifyPassword(
      credentials.password,
      user.password,
    );

    if (!isValidPassword) {
      await logLoginFailed(credentials.email, "invalid_password");
      return null;
    }

    // 6. Log successful login
    await logUserLogin(user.id, {
      email: user.email,
      method: "password",
    });

    // 7. Return user object (without password)
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
})
```

---

## Callbacks

### Session Callback
**Purpose**: Enrich session with fresh user data from database

```typescript
async session({ session, token }) {
  if (session?.user && token?.sub) {
    // Fetch fresh user data from database
    const dbUser = await prisma.user.findUnique({
      where: { id: token.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        password: true,
      },
    });

    if (dbUser) {
      // Update session with fresh data
      session.user.id = dbUser.id;
      session.user.email = dbUser.email;
      session.user.name = dbUser.name;
      session.user.role = dbUser.role;
      session.user.image = dbUser.image;
      session.user.emailVerified = dbUser.emailVerified;
      session.user.createdAt = dbUser.createdAt;
      session.user.password = dbUser.password;
    }
  }
  return session;
}
```

**Why Fetch Fresh Data?**
- Ensures session reflects latest role changes
- Handles profile updates in real-time
- Provides complete user context to components

---

### JWT Callback
**Purpose**: Add user ID and role to JWT token

```typescript
async jwt({ token, user }) {
  if (user) {
    token.sub = user.id;
    token.role = (user as any).role || "USER";
  }
  return token;
}
```

**JWT Token Structure**:
```typescript
{
  sub: string;      // User ID
  role: string;     // UserRole enum
  iat: number;      // Issued at
  exp: number;      // Expires at
}
```

---

## Events

### CreateUser Event
**Purpose**: Log user registration activity

```typescript
events: {
  async createUser({ user }) {
    await logUserRegistration(user.id, {
      email: user.email || "",
      name: user.name || "",
      role: (user as any).role || "USER",
    });
  }
}
```

**When Triggered**: When NextAuth creates a new user (via OAuth or registration API)

---

## Session Management

### Session Strategy
- **Strategy**: JWT (JSON Web Token)
- **Storage**: Client-side cookies (HTTP-only, secure)
- **Server Storage**: None (stateless)

### Session Lifecycle

```
┌──────────────┐
│  User Signs  │
│  In          │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  JWT Created     │
│  (with sub, role)│
└──────┬───────────┘
       │
       ▼
┌──────────────────────┐
│  Cookie Set          │
│  (next-auth.session) │
└──────┬───────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Session Callback Runs      │
│  (on each request)          │
└──────┬──────────────────────┘
       │
       ▼
┌───────────────────────────┐
│  Fetch Fresh User Data    │
│  from Database            │
└──────┬────────────────────┘
       │
       ▼
┌─────────────────────┐
│  Session Object     │
│  Available in App   │
└─────────────────────┘
```

---

## Session Structure

### Extended Session Type
**File**: `src/lib/auth.ts`

```typescript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: string;
      image: string | null;
      emailVerified: Date | null;
      createdAt: Date;
      password: string | null;
    };
  }
}
```

### Usage in Components
```tsx
"use client";

import { useSession } from "next-auth/react";

function UserProfile() {
  const { data: session } = useSession();

  return (
    <div>
      <h1>{session?.user?.name}</h1>
      <p>{session?.user?.email}</p>
      <p>Role: {session?.user?.role}</p>
    </div>
  );
}
```

### Usage in API Routes
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: session.user
  });
}
```

---

## Authorization Patterns

### Role-Based Access Control

#### Global Admin Check
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Admin-only code
}
```

#### Using Helper Function
```typescript
import { AuthService } from "@/lib/services/auth.service";

const isAdmin = await AuthService.isAdmin(session.user.id);
if (!isAdmin) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

---

### Group-Level Authorization

#### Owner Check
```typescript
const group = await prisma.group.findUnique({
  where: { id: params.id },
  include: { members: true }
});

const membership = group?.members.find(
  m => m.userId === session.user.id
);

if (membership?.role !== "OWNER") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

#### Admin/Owner Check
```typescript
if (!["ADMIN", "OWNER"].includes(membership?.role)) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

#### Member Check
```typescript
if (!membership) {
  return NextResponse.json({ error: "Not a member" }, { status: 403 });
}
```

---

### Virtual Admin Membership
**File**: `src/lib/utils/global-admin-permissions.ts`

**Purpose**: Inject virtual admin membership for global admins

```typescript
export function injectVirtualAdminMembership(
  group: Group & { members?: GroupMember[] },
  currentUserId: string
): Group & { members?: GroupMember[] } {
  const membership = group.members?.find(m => m.userId === currentUserId);
  
  // If user is a global admin and not a member, inject virtual admin membership
  if (!membership && group.createdBy !== currentUserId) {
    const isAdmin = await AuthService.isAdmin(currentUserId);
    
    if (isAdmin) {
      return {
        ...group,
        members: [
          ...(group.members || []),
          {
            id: "virtual-admin",
            userId: currentUserId,
            groupId: group.id,
            role: "ADMIN",
            joinedAt: new Date(),
          }
        ]
      };
    }
  }
  
  return group;
}
```

**Usage**:
```typescript
const group = await prisma.group.findUnique({ ... });
const groupWithVirtualAdmin = injectVirtualAdminMembership(group, session.user.id);
```

---

## Password Management

### Password Hashing
**File**: `src/lib/utils/password.ts`

```typescript
import bcrypt from "bcryptjs";
import { PASSWORD_CONFIG } from "./password.config";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, PASSWORD_CONFIG.SALT_ROUNDS);
}
```

**Configuration**:
```typescript
export const PASSWORD_CONFIG = {
  SALT_ROUNDS: 12,  // Balance between security and performance
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: false,
};
```

### Password Verification
```typescript
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
```

### Password Validation
```typescript
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < PASSWORD_CONFIG.MIN_LENGTH) {
    errors.push(`Mật khẩu phải có ít nhất ${PASSWORD_CONFIG.MIN_LENGTH} ký tự`);
  }
  
  if (PASSWORD_CONFIG.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất một chữ hoa");
  }
  
  if (PASSWORD_CONFIG.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất một chữ thường");
  }
  
  if (PASSWORD_CONFIG.REQUIRE_NUMBER && !/[0-9]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất một chữ số");
  }
  
  if (PASSWORD_CONFIG.REQUIRE_SPECIAL && !/[!@#$%^&*]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất một ký tự đặc biệt");
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
```

---

## API Route Authentication

### Standard Pattern
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // 1. Check session exists
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Check user role if needed
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3. Proceed with business logic
  const data = await fetchData();
  
  return NextResponse.json({ success: true, data });
}
```

---

### Activity Logging Pattern
```typescript
import { logActivity } from "@/lib/activity-logger";
import { ActivityType } from "@/types";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  
  try {
    const result = await performOperation(body);
    
    // Log activity
    await logActivity({
      userId: session.user.id,
      groupId: body.groupId,
      action: ActivityType.GROUP_CREATED,
      description: `Đã tạo nhóm ${body.name}`,
      metadata: { groupName: body.name },
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
```

---

## Client-Side Authentication

### Using useSession Hook
```tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Loading state
  if (status === "loading") {
    return <LoadingSpinner />;
  }

  // Not authenticated
  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  // Render content
  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      {session.user.role === "ADMIN" && <AdminPanel />}
    </div>
  );
}
```

### Sign Out
```tsx
import { signOut } from "next-auth/react";

function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/" })}>
      Sign Out
    </button>
  );
}
```

### Get Session on Client
```tsx
import { getSession } from "next-auth/react";

async function checkAuth() {
  const session = await getSession();
  if (session) {
    console.log(session.user.role);
  }
}
```

---

## Authentication Pages

### Sign In Page
**File**: `src/app/auth/signin/page.tsx`

**Features**:
- Email/password form
- Form validation with Zod
- Error display
- Redirect after success
- OAuth provider buttons (if configured)

### Sign In Flow
```
┌─────────────────┐
│  Sign In Page   │
└──────┬──────────┘
       │
       ▼
┌─────────────────────┐
│  Validate Inputs   │
│  (Zod schema)      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Submit to /api/auth/signin │
│  (NextAuth)                 │
└──────┬──────────────────────┘
       │
       ├─► Success: Redirect to dashboard
       │
       └─► Failure: Show error message
```

---

## Error Handling

### Auth Errors

#### User Not Found
```typescript
await logLoginFailed(credentials.email, "user_not_found");
return null; // Generic error
```

#### Invalid Password
```typescript
await logLoginFailed(credentials.email, "invalid_password");
return null; // Generic error
```

#### OAuth User No Password
```typescript
await logLoginFailed(credentials.email, "oauth_user_no_password");
return null; // Generic error
```

#### System Error
```typescript
console.error("Lỗi xác thực:", error);
await logLoginFailed(credentials.email, "system_error");
return null;
```

### Error Pages

#### Sign In Error Page
**File**: `src/app/auth/error/page.tsx`

**Purpose**: Display authentication errors to users

**Common Errors**:
- `CredentialsSignin`: Invalid email or password
- `EmailRequired`: Email is required
- `Callback`: Callback error

---

## Security Best Practices

### Password Storage
- **Hashing**: bcrypt with 12 salt rounds
- **Storage**: Hash only, never plaintext
- **Exclusion**: Never return password in API responses

### Session Security
- **HTTP-only Cookies**: Prevent XSS access
- **Secure Cookies**: HTTPS only
- **JWT Strategy**: Stateless, scalable
- **Fresh Data**: Fetch from database on each request

### Input Validation
- **Server-side**: Zod schemas in API routes
- **Client-side**: React Hook Form + Zod
- **SQL Injection**: Prisma ORM handles this

### Activity Logging
- Log all auth events
- Include IP address (future enhancement)
- Track failed attempts (for rate limiting)
- Audit trail for compliance

### Authorization
- Check role before operations
- Group-level permissions
- Virtual admin membership for global admins
- Never trust client-side checks alone

---

## Token Expiration and Refresh

### JWT Configuration
```typescript
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 days
  updateAge: 24 * 60 * 60,    // Update every 24 hours
}
```

### Token Refresh Flow
```
┌─────────────────────┐
│  Client Request     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Check JWT Age              │
│  (token.iat vs updateAge)   │
└──────┬──────────────────────┘
       │
       ├─► Fresh: Use existing JWT
       │
       └─► Stale: Run JWT callback
              └─► Update token data
                  └─► Return updated JWT
```

---

## Middleware Authentication

**File**: `src/middleware.ts` (if exists)

**Purpose**: Protect routes at the edge

```typescript
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/groups/:path*",
    "/admin/:path*",
  ],
};
```

**Protected Routes**:
- `/dashboard/*`
- `/groups/*`
- `/admin/*`

---

## Activity Types for Auth

**Enum**: `ActivityType` in `@/types`

| Activity Type | Description | Metadata |
|--------------|-------------|----------|
| `USER_REGISTERED` | User registered via API | email, name, role |
| `USER_LOGIN` | User logged in | email, loginMethod, provider |
| `LOGIN_FAILED` | Failed login attempt | email, reason, ipAddress |
| `PASSWORD_RESET_REQUESTED` | Password reset requested | email, ipAddress |
| `PASSWORD_RESET_COMPLETED` | Password reset completed | email, ipAddress |
| `ADMIN_USER_CREATED` | Admin created user | email, name, createdBy |
| `ADMIN_USER_ROLE_UPDATED` | Admin updated user role | email, oldRole, newRole |
| `ADMIN_USER_DELETED` | Admin deleted user | email |
| `ADMIN_PASSWORD_RESET_BY_ADMIN` | Admin reset user password | email, resetBy |

---

## Common Patterns

### Check Authentication and Role
```typescript
const session = await getServerSession(authOptions);

if (!session) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

if (session.user.role !== "ADMIN") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

### Check Group Membership
```typescript
const membership = await prisma.groupMember.findUnique({
  where: {
    userId_groupId: {
      userId: session.user.id,
      groupId: params.id,
    },
  },
});

if (!membership) {
  return NextResponse.json({ error: "Not a member" }, { status: 403 });
}
```

### Log Activity
```typescript
await logActivity({
  userId: session.user.id,
  action: ActivityType.SOME_ACTION,
  description: "Description in Vietnamese",
  metadata: { key: "value" },
});
```

### Inject Virtual Admin
```typescript
const groupWithAdmin = injectVirtualAdminMembership(group, session.user.id);
```
