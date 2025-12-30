# State Management Map

## Overview
This document describes state management patterns in the application, including React Query usage, caching strategy, and client-side state handling.

## Tech Stack
- **React Query (@tanstack/react-query)**: Server state management
- **React Hook Form**: Form state management
- **NextAuth (useSession)**: Authentication state
- **React Context/useState**: Local component state

---

## React Query Setup

### Query Client Provider
**File**: `src/lib/cache/query-provider.tsx`

**Purpose**: Provides React Query client to the entire application

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Configuration
**File**: `src/lib/cache/query-client.ts`

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
      cacheTime: 10 * 60 * 1000,  // 10 minutes
    },
    mutations: {
      retry: 0,
    },
  },
});
```

**Global Configuration**:
| Setting | Value | Description |
|---------|-------|-------------|
| `staleTime` | 5 minutes (300000ms) | Data considered fresh for 5 min |
| `refetchOnWindowFocus` | false | Don't refetch when window gains focus |
| `retry` | 1 | Retry failed queries once |
| `cacheTime` | 10 minutes | Keep unused data in cache for 10 min |
| `mutations.retry` | 0 | Don't retry mutations |

---

## React Query Usage Patterns

### useQuery Pattern
**Purpose**: Fetch and cache data from API

```tsx
import { useQuery } from "@tanstack/react-query";

function GroupsPage() {
  const { data: groups, isLoading, error } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const response = await fetch("/api/groups");
      if (!response.ok) throw new Error("Failed to fetch groups");
      return response.json();
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <Error message={error.message} />;

  return <GroupList groups={groups} />;
}
```

**Query Key Patterns**:
- `["groups"]` - All groups
- `["groups", id]` - Specific group
- `["groups", id, "members"]` - Group members
- `["users"]` - All users (admin)
- `["score-records", groupId]` - Scores for group

---

### useMutation Pattern
**Purpose**: Modify data and handle side effects

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

function CreateGroupForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateGroupData) => {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create group");
      return response.json();
    },
    onSuccess: (result) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      
      // Show success message
      toast.success("Tạo nhóm thành công!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      mutation.mutate(formData);
    }}>
      {/* Form fields */}
      <button disabled={mutation.isPending}>
        {mutation.isPending ? <LoadingSpinner /> : "Tạo nhóm"}
      </button>
    </form>
  );
}
```

---

## Query Keys Convention

### Standard Query Keys
```typescript
// Groups
["groups"]                    // All groups
["groups", id]                // Specific group
["groups", id, "members"]     // Group members
["groups", id, "rules"]       // Group rules
["groups", id, "scores"]      // Group scores

// Users
["users"]                     // All users (admin only)
["users", id]                 // Specific user

// Score Records
["score-records"]             // All score records (admin)
["score-records", groupId]    // Score records for group
["score-records", groupId, userId] // Scores for user in group

// Activity Logs
["activity-logs"]             // All logs (admin)
["activity-logs", userId]     // User's logs
["activity-logs", groupId]   // Group's logs

// Analytics
["analytics"]                 // System analytics (admin)
["analytics", groupId]        // Group analytics
```

---

## State Management by Feature

### 1. Authentication State

#### useSession (NextAuth)
**Purpose**: Track user authentication status

```tsx
import { useSession } from "next-auth/react";

function Header() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Skeleton />;
  }

  if (!session) {
    return <SignInButton />;
  }

  return (
    <div>
      <span>{session.user.name}</span>
      <span className="badge">{session.user.role}</span>
    </div>
  );
}
```

**Session Data Structure**:
```typescript
{
  user: {
    id: string;
    email: string;
    name: string | null;
    role: "USER" | "ADMIN";
    image: string | null;
    emailVerified: Date | null;
    createdAt: Date;
    password: string | null;
  };
  expires: string;
}
```

---

### 2. Groups State

#### Fetch Groups
```tsx
const { data: groups, isLoading } = useQuery({
  queryKey: ["groups"],
  queryFn: () => fetch("/api/groups").then(r => r.json()),
});
```

#### Fetch Single Group
```tsx
const { data: group } = useQuery({
  queryKey: ["groups", id],
  queryFn: () => fetch(`/api/groups/${id}`).then(r => r.json()),
  enabled: !!id, // Only fetch if id exists
});
```

#### Create Group
```tsx
const mutation = useMutation({
  mutationFn: (data) => fetch("/api/groups", {
    method: "POST",
    body: JSON.stringify(data),
  }).then(r => r.json()),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["groups"] });
  },
});
```

#### Update Group
```tsx
const mutation = useMutation({
  mutationFn: ({ id, data }) => fetch(`/api/groups/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }).then(r => r.json()),
  onSuccess: (_, { id }) => {
    queryClient.invalidateQueries({ queryKey: ["groups"] });
    queryClient.invalidateQueries({ queryKey: ["groups", id] });
  },
});
```

#### Delete Group
```tsx
const mutation = useMutation({
  mutationFn: (id) => fetch(`/api/groups/${id}`, {
    method: "DELETE",
  }).then(r => r.json()),
  onSuccess: (deletedGroup) => {
    queryClient.removeQueries({ queryKey: ["groups", deletedGroup.id] });
    queryClient.invalidateQueries({ queryKey: ["groups"] });
  },
});
```

---

### 3. Group Members State

#### Fetch Group Members
```tsx
const { data: members } = useQuery({
  queryKey: ["groups", groupId, "members"],
  queryFn: () => fetch(`/api/groups/${groupId}/members`).then(r => r.json()),
  enabled: !!groupId,
});
```

#### Add Member
```tsx
const mutation = useMutation({
  mutationFn: ({ groupId, userId, role }) => fetch(`/api/groups/${groupId}/members`, {
    method: "POST",
    body: JSON.stringify({ userId, role }),
  }).then(r => r.json()),
  onSuccess: (_, { groupId }) => {
    queryClient.invalidateQueries({ queryKey: ["groups", groupId, "members"] });
  },
});
```

#### Update Member Role
```tsx
const mutation = useMutation({
  mutationFn: ({ groupId, userId, role }) => fetch(`/api/groups/${groupId}/members/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  }).then(r => r.json()),
  onSuccess: (_, { groupId }) => {
    queryClient.invalidateQueries({ queryKey: ["groups", groupId, "members"] });
  },
});
```

#### Remove Member
```tsx
const mutation = useMutation({
  mutationFn: ({ groupId, userId }) => fetch(`/api/groups/${groupId}/members/${userId}`, {
    method: "DELETE",
  }).then(r => r.json()),
  onSuccess: (_, { groupId }) => {
    queryClient.invalidateQueries({ queryKey: ["groups", groupId, "members"] });
  },
});
```

---

### 4. Scoring Rules State

#### Fetch All Rules
```tsx
const { data: rules } = useQuery({
  queryKey: ["scoring-rules"],
  queryFn: () => fetch("/api/scoring-rules").then(r => r.json()),
});
```

#### Fetch Group Rules
```tsx
const { data: rules } = useQuery({
  queryKey: ["groups", groupId, "rules"],
  queryFn: () => fetch(`/api/groups/${groupId}/rules`).then(r => r.json()),
  enabled: !!groupId,
});
```

#### Create Rule
```tsx
const mutation = useMutation({
  mutationFn: (data) => fetch("/api/scoring-rules", {
    method: "POST",
    body: JSON.stringify(data),
  }).then(r => r.json()),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["scoring-rules"] });
  },
});
```

#### Add Rule to Group
```tsx
const mutation = useMutation({
  mutationFn: ({ groupId, ruleId }) => fetch(`/api/groups/${groupId}/rules`, {
    method: "POST",
    body: JSON.stringify({ ruleId }),
  }).then(r => r.json()),
  onSuccess: (_, { groupId }) => {
    queryClient.invalidateQueries({ queryKey: ["groups", groupId, "rules"] });
  },
});
```

---

### 5. Score Records State

#### Fetch Scores for Group
```tsx
const { data: scores } = useQuery({
  queryKey: ["score-records", groupId],
  queryFn: () => fetch(`/api/score-records?groupId=${groupId}`).then(r => r.json()),
  enabled: !!groupId,
});
```

#### Create Score
```tsx
const mutation = useMutation({
  mutationFn: (data) => fetch("/api/score-records", {
    method: "POST",
    body: JSON.stringify(data),
  }).then(r => r.json()),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["score-records"] });
  },
});
```

---

### 6. Activity Logs State

#### Fetch Activity Feed
```tsx
const { data: activities } = useQuery({
  queryKey: ["activity-logs"],
  queryFn: () => fetch("/api/activity-logs").then(r => r.json()),
});
```

#### Fetch Group Activity
```tsx
const { data: activities } = useQuery({
  queryKey: ["activity-logs", groupId],
  queryFn: () => fetch(`/api/activity-logs?groupId=${groupId}`).then(r => r.json()),
  enabled: !!groupId,
});
```

---

## Form State Management

### React Hook Form Pattern
**Purpose**: Handle form state, validation, and submission

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const createGroupSchema = z.object({
  name: z.string().min(1, "Tên nhóm là bắt buộc"),
  description: z.string().optional(),
});

type CreateGroupData = z.infer<typeof createGroupSchema>;

function CreateGroupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGroupData>({
    resolver: zodResolver(createGroupSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateGroupData) => {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      toast.success("Tạo nhóm thành công!");
    },
  });

  return (
    <form onSubmit={handleSubmit(data => mutation.mutate(data))}>
      <input {...register("name")} />
      {errors.name && <span className="error">{errors.name.message}</span>}
      
      <textarea {...register("description")} />
      
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Đang tạo..." : "Tạo nhóm"}
      </button>
    </form>
  );
}
```

---

## Local Component State

### useState Pattern
**Purpose**: Simple, UI-related state

```tsx
import { useState } from "react";

function GroupCard({ group }: { group: Group }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Card>
      <div onClick={() => setIsOpen(!isOpen)}>
        <h3>{group.name}</h3>
        <ChevronDown className={isOpen ? "rotate-180" : ""} />
      </div>
      
      {isOpen && (
        <div>
          {isEditing ? (
            <EditGroupForm 
              group={group} 
              onSave={() => setIsEditing(false)} 
            />
          ) : (
            <GroupDetails group={group} />
          )}
          <button onClick={() => setIsEditing(true)}>Edit</button>
        </div>
      )}
    </Card>
  );
}
```

---

## Caching Strategy

### Cache Invalidation Patterns

#### Targeted Invalidation
```typescript
// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ["groups", id] });

// Invalidate all groups queries
queryClient.invalidateQueries({ queryKey: ["groups"] });

// Invalidate multiple queries
queryClient.invalidateQueries({ 
  predicate: (query) => {
    return query.queryKey[0] === "groups";
  }
});
```

#### Optimistic Updates
```typescript
const mutation = useMutation({
  mutationFn: updateGroup,
  onMutate: async (updatedGroup) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["groups", updatedGroup.id] });
    
    // Snapshot previous value
    const previousGroup = queryClient.getQueryData(["groups", updatedGroup.id]);
    
    // Optimistically update
    queryClient.setQueryData(["groups", updatedGroup.id], updatedGroup);
    
    return { previousGroup };
  },
  onError: (error, updatedGroup, context) => {
    // Rollback on error
    queryClient.setQueryData(["groups", updatedGroup.id], context.previousGroup);
  },
  onSettled: () => {
    // Refetch to ensure server state
    queryClient.invalidateQueries({ queryKey: ["groups"] });
  },
});
```

---

### Cache Timeouts

| Query Type | Stale Time | Cache Time | Refetch Strategy |
|------------|-----------|------------|------------------|
| User profile | 5 min | 10 min | On mount, on window focus |
| Groups list | 5 min | 10 min | Manual invalidate |
| Single group | 5 min | 10 min | Manual invalidate |
| Group members | 2 min | 5 min | Manual invalidate |
| Score records | 1 min | 5 min | Manual invalidate |
| Activity logs | 30 sec | 5 min | Poll every 30 sec (optional) |

---

## Performance Monitoring

**File**: `src/lib/cache/performance-monitor.ts`

**Purpose**: Track React Query performance

```typescript
import { QueryCache, MutationCache } from "@tanstack/react-query";

export const queryCache = new QueryCache({
  onError: (error) => {
    console.error("Query error:", error);
  },
  onSuccess: (data) => {
    console.log("Query success:", data);
  },
});

export const mutationCache = new MutationCache({
  onError: (error) => {
    console.error("Mutation error:", error);
  },
  onSuccess: () => {
    console.log("Mutation success");
  },
});

export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
});
```

---

## HTTP Caching

### Cache Headers
**File**: `src/lib/cache/http-headers.ts`

```typescript
export function getCacheHeaders(maxAge = 60) {
  return {
    "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
    "CDN-Cache-Control": `public, s-maxage=${maxAge}`,
    "Vary": "Cookie",
  };
}

export function getNoCacheHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  };
}
```

### Usage in API Routes
```typescript
import { getCacheHeaders } from "@/lib/cache/http-headers";

export async function GET() {
  const groups = await prisma.group.findMany();
  
  return NextResponse.json(groups, {
    headers: getCacheHeaders(60), // Cache for 60 seconds
  });
}
```

---

## URL Pattern Caching

**File**: `src/lib/cache/url-patterns.ts`

```typescript
export const CACHE_PATTERNS = {
  GROUPS: {
    pattern: "/api/groups",
    maxAge: 60,
  },
  GROUP_DETAILS: {
    pattern: "/api/groups/:id",
    maxAge: 60,
  },
  GROUP_MEMBERS: {
    pattern: "/api/groups/:id/members",
    maxAge: 30,
  },
  SCORES: {
    pattern: "/api/score-records",
    maxAge: 30,
  },
} as const;
```

---

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Client Request                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              React Query (useQuery)                      │
│                                                          │
│  1. Check Cache                                          │
│  2. If fresh → Return cached data                       │
│  3. If stale → Background refetch                        │
│  4. If missing → Fetch from API                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  API Route Handler                      │
│                                                          │
│  1. Check HTTP Cache Headers                            │
│  2. If cached → Return 304 Not Modified                 │
│  3. If not cached → Fetch from Database                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Database (Prisma)                       │
│                                                          │
│  1. Execute Query                                        │
│  2. Return Data                                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Response Flow (Reverse)                     │
│                                                          │
│  API → Cache Headers → React Query Cache → UI           │
└─────────────────────────────────────────────────────────┘
```

---

## Best Practices

### 1. Query Keys
- Use arrays for hierarchical keys
- Include IDs for specific resources
- Keep keys consistent across components

### 2. Cache Invalidation
- Invalidate only what's needed
- Use `invalidateQueries` for refetching
- Use `setQueryData` for optimistic updates

### 3. Error Handling
- Show user-friendly error messages
- Use toast notifications
- Retry failed queries automatically

### 4. Loading States
- Show skeleton UI while loading
- Disable forms during mutations
- Display loading spinners on buttons

### 5. Performance
- Set appropriate stale times
- Avoid unnecessary refetches
- Use pagination for large datasets

---

## Example: Complete Component with State

```tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

function GroupManagement() {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch groups
  const { data: groups, isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: () => fetch("/api/groups").then(r => r.json()),
  });

  // Fetch selected group details
  const { data: selectedGroup } = useQuery({
    queryKey: ["groups", selectedGroupId],
    queryFn: () => fetch(`/api/groups/${selectedGroupId}`).then(r => r.json()),
    enabled: !!selectedGroupId,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/groups/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Xóa nhóm thành công");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setSelectedGroupId(null);
    },
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <h1>Quản lý nhóm</h1>
      
      <div className="grid">
        <div>
          <h2>Danh sách nhóm</h2>
          {groups.map(group => (
            <div 
              key={group.id} 
              className={selectedGroupId === group.id ? "selected" : ""}
              onClick={() => setSelectedGroupId(group.id)}
            >
              {group.name}
              <button onClick={(e) => {
                e.stopPropagation();
                deleteMutation.mutate(group.id);
              }}>Delete</button>
            </div>
          ))}
        </div>

        {selectedGroup && (
          <div>
            <h2>Chi tiết nhóm</h2>
            <GroupDetails group={selectedGroup} />
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Hooks

### useAuth Hook
**File**: `src/hooks/use-auth.ts`

```typescript
import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isAdmin: session?.user?.role === "ADMIN",
  };
}
```

**Usage**:
```tsx
const { user, isAuthenticated, isAdmin } = useAuth();

if (!isAuthenticated) return <SignInPrompt />;
if (!isAdmin) return <AccessDenied />;
```

---

### useGroups Hook
**File**: `src/hooks/use-groups.ts`

```typescript
import { useQuery } from "@tanstack/react-query";

export function useGroups() {
  return useQuery({
    queryKey: ["groups"],
    queryFn: () => fetch("/api/groups").then(r => r.json()),
  });
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: ["groups", id],
    queryFn: () => fetch(`/api/groups/${id}`).then(r => r.json()),
    enabled: !!id,
  });
}

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: ["groups", groupId, "members"],
    queryFn: () => fetch(`/api/groups/${groupId}/members`).then(r => r.json()),
    enabled: !!groupId,
  });
}
```

---

### useDebounce Hook
**File**: `src/hooks/use-debounce.ts`

```typescript
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

**Usage** (for search input):
```tsx
const [searchQuery, setSearchQuery] = useState("");
const debouncedQuery = useDebounce(searchQuery, 500);

const { data: results } = useQuery({
  queryKey: ["search", debouncedQuery],
  queryFn: () => fetch(`/api/search?q=${debouncedQuery}`).then(r => r.json()),
  enabled: debouncedQuery.length > 0,
});
```
