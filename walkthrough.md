# Walkthrough - Global Admin Permissions Fix

I have implemented the missing Global Admin permission checks in the API routes. This ensures that users with the global `ADMIN` role can manage score records and groups even if they are not explicitly added as members of those groups.

## Changes

### 1. Score Records API (`src/app/api/score-records/route.ts`)

Updated `PUT`, `POST`, and `DELETE` methods to include `isGlobalAdmin` check.

```typescript
// Before
if (!["OWNER", "ADMIN"].includes(currentUserMember.role)) { ... }

// After
if (!isGlobalAdmin(session.user as any)) {
  if (!currentUserMember) { ... }
  if (!["OWNER", "ADMIN"].includes(currentUserMember.role)) { ... }
}
```

### 2. Groups API (`src/app/api/groups/[id]/route.ts`)

Updated `PATCH` method to include `isGlobalAdmin` check.

```typescript
// Before
if (!userMember || !["OWNER", "ADMIN"].includes(userMember.role)) { ... }

// After
if (!isGlobalAdmin(session.user as any)) {
  if (!userMember || !["OWNER", "ADMIN"].includes(userMember.role)) { ... }
}
```

## Verification Results

### Automated Tests
- [x] **Lint Check**: Verified imports and usage of `isGlobalAdmin`.

### Manual Verification Steps
To verify these changes manually:
1.  **Login as a Global Admin**: Use an account with `role: "ADMIN"` in the `User` table.
2.  **Access a Group**: Go to a group where this user is **NOT** a member.
3.  **Add Score**: Try to add a score record for a member of that group.
    -   *Expected*: Success (previously failed with 403/404).
4.  **Edit Score**: Try to edit an existing score record in that group.
    -   *Expected*: Success.
5.  **Delete Score**: Try to delete a score record.
    -   *Expected*: Success.
6.  **Edit Group**: Try to update the group details (name/description).
    -   *Expected*: Success.
