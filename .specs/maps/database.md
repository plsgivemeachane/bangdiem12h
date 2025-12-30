# Database Model Map

## Overview
This document describes the database schema using Prisma ORM, including all models, relationships, enums, and constraints.

## Database Configuration
**File**: `prisma/schema.prisma`

```prisma
generator client {
  provider      = "prisma-client-js"
  output        = "../node_modules/.prisma/client"
  binaryTargets = ["native", "linux-musl", "rhel-openssl-3.0.x"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Database**: PostgreSQL (Supabase)
**Client Location**: `../node_modules/.prisma/client`

---

## Entity-Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐
│   Account    │◄──────┤      User        │───────┬───────────────┐
└──────────────┘       └──────────────────┘       │               │
                                                        │               │
┌──────────────┐       ┌──────────────────┐       │               │
│   Session    │◄──────┤      User        │───────┘               │
└──────────────┘       └──────────────────┘                       │
                                                                │
┌─────────────────────┐            ┌──────────────────┐       │
│   ActivityLog       │◄───────────┤      User        │───────┘
│   (userId optional) │            └──────────────────┘
└─────────────────────┘
           │
           │ (groupId optional)
           ▼
┌──────────────────┐      ┌─────────────────────┐
│     Group        │◄─────┤   ActivityLog       │
│                  │      │   (groupId)          │
│  ┌────────────┐  │      └─────────────────────┘
│  │ createdBy  │──┤
│  └────────────┘  │
└──────────────────┘
    │        │
    │        │
    ▼        ▼
┌─────────────────────┐  ┌─────────────────────┐
│   GroupMember       │  │   ScoreRecord       │
│                     │  │                     │
│  ┌──────┐  ┌─────┐  │  │  ┌────┐  ┌──────┐  │
│  │userId│  │role │  │  │  │rule│  │group │  │
│  └──────┘  └─────┘  │  │  └────┘  └──────┘  │
└─────────────────────┘  └─────────────────────┘
    │                         │
    │                         │
    ▼                         ▼
┌──────────────────┐  ┌──────────────────┐
│  ScoringRule     │◄─┤  GroupRule       │
│                  │  │                  │
│  ┌────────────┐  │  │  ┌────────────┐  │
│  │scoreRecords│  │  │  │  ruleId    │──┼──┘
│  └────────────┘  │  │  └────────────┘  │
│                  │  │  ┌────────────┐  │
│                  │  │  │  groupId   │──┼──┐
│                  │  │  └────────────┘  │  │
└──────────────────┘  └──────────────────┘  │
                          │                 │
                          ▼                 │
                    ┌──────────────────┐    │
                    │  ScoreRecord     │────┘
                    │                  │
                    │  ┌────────────┐  │
                    │  │  ruleId    │──┼──┐
                    │  └────────────┘  │  │
                    └──────────────────┘  │
```

---

## Models

### 1. User
**Purpose**: Store user information and authentication data

```prisma
model User {
  id               String        @id @default(cuid())
  name             String?
  email            String        @unique
  password         String?       // Null for OAuth users
  emailVerified    DateTime?
  image            String?
  role             UserRole      @default(USER)
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  accounts         Account[]
  activityLogs     ActivityLog[]
  groups           Group[]       @relation("GroupCreator")
  groupMemberships GroupMember[]
  scoreRecords     ScoreRecord[]
  sessions         Session[]
}
```

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | Primary Key | CUID (CockroachDB Unique ID) |
| `name` | String? | Optional | User's display name |
| `email` | String | Unique | User's email address |
| `password` | String? | Nullable | Bcrypt hash (null for OAuth users) |
| `emailVerified` | DateTime? | Nullable | Email verification timestamp |
| `image` | String? | Nullable | Profile image URL |
| `role` | UserRole | Default: USER | User role (USER or ADMIN) |
| `createdAt` | DateTime | Default now() | Account creation timestamp |
| `updatedAt` | DateTime | Auto update | Last modification timestamp |

**Relationships**:
- `accounts[]` → One-to-many with Account (NextAuth)
- `activityLogs[]` → One-to-many with ActivityLog
- `groups[]` → One-to-many with Group (as creator)
- `groupMemberships[]` → One-to-many with GroupMember
- `scoreRecords[]` → One-to-many with ScoreRecord
- `sessions[]` → One-to-many with Session (NextAuth)

**Indexes**: None explicitly defined (email has unique constraint)

---

### 2. Account
**Purpose**: OAuth provider account information (NextAuth)

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

**Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `userId` | String | Foreign key to User |
| `type` | String | Account type (oauth) |
| `provider` | String | Provider name (google, github, etc.) |
| `providerAccountId` | String | Provider's user ID |
| `refresh_token` | String? | OAuth refresh token |
| `access_token` | String? | OAuth access token |
| `expires_at` | Int? | Token expiration timestamp |
| `token_type` | String? | Token type (Bearer) |
| `scope` | String? | OAuth scope |
| `id_token` | String? | OAuth ID token (JWT) |
| `session_state` | String? | Session state |

**Relationships**:
- `user` → Many-to-one with User (CASCADE delete)

**Indexes**:
- Unique constraint on `[provider, providerAccountId]`

---

### 3. Session
**Purpose**: User session storage (NextAuth)

```prisma
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `sessionToken` | String | Unique session identifier |
| `userId` | String | Foreign key to User |
| `expires` | DateTime | Session expiration timestamp |

**Relationships**:
- `user` → Many-to-one with User (CASCADE delete)

**Indexes**:
- Unique constraint on `sessionToken`

---

### 4. VerificationToken
**Purpose**: Email verification and password reset tokens

```prisma
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

**Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `identifier` | String | Email address |
| `token` | String | Verification token |
| `expires` | DateTime | Token expiration timestamp |

**Indexes**:
- Unique constraint on `token`
- Unique constraint on `[identifier, token]`

---

### 5. Group
**Purpose**: Classroom groups for scoring management

```prisma
model Group {
  id           String        @id @default(cuid())
  name         String
  description  String?
  isActive     Boolean       @default(true)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  createdById  String
  activityLogs ActivityLog[]
  createdBy    User          @relation("GroupCreator", fields: [createdById], references: [id])
  members      GroupMember[]
  groupRules   GroupRule[]
  scoreRecords ScoreRecord[]

  @@index([createdById])
  @@index([isActive])
}
```

**Fields**:
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | String | - | CUID primary key |
| `name` | String | - | Group name |
| `description` | String? | - | Group description |
| `isActive` | Boolean | true | Group active status |
| `createdAt` | DateTime | now() | Creation timestamp |
| `updatedAt` | DateTime | Auto update | Last modification |
| `createdById` | String | - | Foreign key to User (creator) |

**Relationships**:
- `activityLogs[]` → One-to-many with ActivityLog
- `createdBy` → Many-to-one with User (GroupCreator relation)
- `members[]` → One-to-many with GroupMember
- `groupRules[]` → One-to-many with GroupRule
- `scoreRecords[]` → One-to-many with ScoreRecord

**Indexes**:
- `[createdById]` - Fast lookup of groups by creator
- `[isActive]` - Filter active/inactive groups

---

### 6. GroupMember
**Purpose**: User membership in groups with roles

```prisma
model GroupMember {
  id       String    @id @default(cuid())
  userId   String
  groupId  String
  role     GroupRole @default(MEMBER)
  joinedAt DateTime  @default(now())
  group    Group     @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, groupId])
  @@index([groupId])
  @@index([userId])
}
```

**Fields**:
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | String | - | CUID primary key |
| `userId` | String | - | Foreign key to User |
| `groupId` | String | - | Foreign key to Group |
| `role` | GroupRole | MEMBER | Member role (MEMBER, ADMIN, OWNER) |
| `joinedAt` | DateTime | now() | When user joined |

**Relationships**:
- `group` → Many-to-one with Group (CASCADE delete)
- `user` → Many-to-one with User (CASCADE delete)

**Indexes**:
- Unique constraint on `[userId, groupId]` - One membership per user per group
- `[groupId]` - Fast lookup of group members
- `[userId]` - Fast lookup of user's groups

---

### 7. ScoringRule
**Purpose**: Definition of scoring criteria

```prisma
model ScoringRule {
  id           String        @id @default(cuid())
  name         String
  description  String?
  criteria     Json
  points       Int
  isActive     Boolean       @default(true)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  groupRules   GroupRule[]
  scoreRecords ScoreRecord[]

  @@index([isActive])
}
```

**Fields**:
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | String | - | CUID primary key |
| `name` | String | - | Rule name |
| `description` | String? | - | Rule description |
| `criteria` | Json | - | Flexible criteria object (e.g., { "minScore": 80, "category": "quiz" }) |
| `points` | Int | - | Points awarded/penalized |
| `isActive` | Boolean | true | Rule active status |
| `createdAt` | DateTime | now() | Creation timestamp |
| `updatedAt` | DateTime | Auto update | Last modification |

**Relationships**:
- `groupRules[]` → One-to-many with GroupRule
- `scoreRecords[]` → One-to-many with ScoreRecord

**Indexes**:
- `[isActive]` - Filter active/inactive rules

**JSON Schema Example**:
```json
{
  "minScore": 80,
  "category": "quiz",
  "weight": 1.5,
  "maxPerDay": 3
}
```

---

### 8. GroupRule
**Purpose**: Junction table linking Groups to ScoringRules

```prisma
model GroupRule {
  id        String      @id @default(cuid())
  groupId   String
  ruleId    String
  isActive  Boolean     @default(true)
  createdAt DateTime    @default(now())
  group     Group       @relation(fields: [groupId], references: [id], onDelete: Cascade)
  rule      ScoringRule @relation(fields: [ruleId], references: [id], onDelete: Cascade)

  @@unique([groupId, ruleId])
  @@index([groupId])
  @@index([ruleId])
  @@index([isActive])
}
```

**Fields**:
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | String | - | CUID primary key |
| `groupId` | String | - | Foreign key to Group |
| `ruleId` | String | - | Foreign key to ScoringRule |
| `isActive` | Boolean | true | Link active status |
| `createdAt` | DateTime | now() | Creation timestamp |

**Relationships**:
- `group` → Many-to-one with Group (CASCADE delete)
- `rule` → Many-to-one with ScoringRule (CASCADE delete)

**Indexes**:
- Unique constraint on `[groupId, ruleId]` - One rule per group
- `[groupId]` - Fast lookup of group's rules
- `[ruleId]` - Fast lookup of rule's groups
- `[isActive]` - Filter active/inactive links

**Use Case**: Allows the same rule to be used across multiple groups with independent activation

---

### 9. ScoreRecord
**Purpose**: Individual score entries for users in groups

```prisma
model ScoreRecord {
  id         String      @id @default(cuid())
  userId     String
  groupId    String
  ruleId     String
  points     Int
  criteria   Json
  notes      String?
  recordedAt DateTime    @default(now())
  group      Group       @relation(fields: [groupId], references: [id], onDelete: Cascade)
  rule       ScoringRule @relation(fields: [ruleId], references: [id], onDelete: Cascade)
  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([groupId])
  @@index([ruleId])
  @@index([recordedAt])
}
```

**Fields**:
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | String | - | CUID primary key |
| `userId` | String | - | Foreign key to User (who received score) |
| `groupId` | String | - | Foreign key to Group |
| `ruleId` | String | - | Foreign key to ScoringRule (which rule applied) |
| `points` | Int | - | Points value (can be positive or negative) |
| `criteria` | Json | - | Criteria values at time of recording |
| `notes` | String? | - | Optional notes |
| `recordedAt` | DateTime | now() | When score was recorded |

**Relationships**:
- `group` → Many-to-one with Group (CASCADE delete)
- `rule` → Many-to-one with ScoringRule (CASCADE delete)
- `user` → Many-to-one with User (CASCADE delete)

**Indexes**:
- `[userId]` - Fast lookup of user's scores
- `[groupId]` - Fast lookup of group's scores
- `[ruleId]` - Fast lookup of scores by rule
- `[recordedAt]` - Time-based queries (e.g., last 30 days)

**JSON Schema Example**:
```json
{
  "assignmentName": "Quiz 1",
  "actualScore": 85,
  "maxScore": 100,
  "submissionDate": "2024-01-15"
}
```

---

### 10. ActivityLog
**Purpose**: Audit log for all significant user actions

```prisma
model ActivityLog {
  id          String       @id @default(cuid())
  userId      String?
  groupId     String?
  action      ActivityType
  description String
  metadata    Json?
  timestamp   DateTime     @default(now())
  group       Group?       @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user        User?        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([groupId])
  @@index([timestamp])
  @@index([action])
}
```

**Fields**:
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | String | - | CUID primary key |
| `userId` | String? | - | Foreign key to User (null for anonymous actions) |
| `groupId` | String? | - | Foreign key to Group (optional) |
| `action` | ActivityType | - | Type of action (enum) |
| `description` | String | - | Human-readable description (Vietnamese) |
| `metadata` | Json? | - | Additional structured data |
| `timestamp` | DateTime | now() | When action occurred |

**Relationships**:
- `group` → Many-to-one with Group (CASCADE delete)
- `user` → Many-to-one with User (CASCADE delete)

**Indexes**:
- `[userId]` - User's activity history
- `[groupId]` - Group's activity history
- `[timestamp]` - Time-based queries
- `[action]` - Filter by action type

**JSON Schema Example**:
```json
{
  "email": "user@example.com",
  "loginMethod": "password",
  "ipAddress": "192.168.1.1"
}
```

---

## Enums

### UserRole
**Purpose**: Define user roles for authorization

```prisma
enum UserRole {
  USER
  ADMIN
}
```

**Values**:
| Role | Description | Permissions |
|------|-------------|-------------|
| `USER` | Regular user | Can create groups, manage own groups |
| `ADMIN` | Administrator | Can manage all users, view all data |

**Default**: `USER`

---

### GroupRole
**Purpose**: Define roles within a group

```prisma
enum GroupRole {
  MEMBER
  ADMIN
  OWNER
}
```

**Values**:
| Role | Description | Permissions |
|------|-------------|-------------|
| `MEMBER` | Regular member | Can view scores, read-only |
| `ADMIN` | Group admin | Can manage members, record scores |
| `OWNER` | Group creator | Can delete group, transfer ownership |

**Default**: `MEMBER`

**Permission Hierarchy**: `OWNER > ADMIN > MEMBER`

---

### ActivityType
**Purpose**: Define all tracked user actions

```prisma
enum ActivityType {
  USER_REGISTERED
  USER_LOGIN
  LOGIN_FAILED
  PASSWORD_RESET_REQUESTED
  PASSWORD_RESET_COMPLETED
  ADMIN_USER_CREATED
  ADMIN_USER_ROLE_UPDATED
  ADMIN_USER_DELETED
  ADMIN_PASSWORD_RESET_BY_ADMIN
  GROUP_CREATED
  GROUP_UPDATED
  GROUP_DELETED
  MEMBER_INVITED
  MEMBER_JOINED
  MEMBER_REMOVED
  MEMBER_ADDED
  MEMBER_ROLE_UPDATED
  OWNERSHIP_TRANSFERRED
  SCORING_RULE_CREATED
  SCORING_RULE_UPDATED
  SCORING_RULE_TOGGLED
  SCORING_RULE_DELETED
  RULE_ADDED_TO_GROUP
  RULE_REMOVED_FROM_GROUP
  SCORE_RECORDED
  SCORE_UPDATED
  SCORE_DELETED
}
```

**Categories**:

**Auth Events**:
- `USER_REGISTERED`
- `USER_LOGIN`
- `LOGIN_FAILED`
- `PASSWORD_RESET_REQUESTED`
- `PASSWORD_RESET_COMPLETED`

**Admin Actions**:
- `ADMIN_USER_CREATED`
- `ADMIN_USER_ROLE_UPDATED`
- `ADMIN_USER_DELETED`
- `ADMIN_PASSWORD_RESET_BY_ADMIN`

**Group Management**:
- `GROUP_CREATED`
- `GROUP_UPDATED`
- `GROUP_DELETED`
- `MEMBER_INVITED`
- `MEMBER_JOINED`
- `MEMBER_REMOVED`
- `MEMBER_ADDED`
- `MEMBER_ROLE_UPDATED`
- `OWNERSHIP_TRANSFERRED`

**Scoring Rules**:
- `SCORING_RULE_CREATED`
- `SCORING_RULE_UPDATED`
- `SCORING_RULE_TOGGLED`
- `SCORING_RULE_DELETED`
- `RULE_ADDED_TO_GROUP`
- `RULE_REMOVED_FROM_GROUP`

**Score Records**:
- `SCORE_RECORDED`
- `SCORE_UPDATED`
- `SCORE_DELETED`

---

## Cascade Delete Behavior

### Summary
| Model | Cascade Deletes | Impact |
|-------|-----------------|--------|
| `User` | `Account[]`, `Session[]`, `Group[]` (as creator), `GroupMember[]`, `ScoreRecord[]`, `ActivityLog[]` | Removing a user removes all their data |
| `Group` | `GroupMember[]`, `GroupRule[]`, `ScoreRecord[]`, `ActivityLog[]` | Removing a group removes all related data |
| `GroupMember` | None (removed when user or group deleted) |
| `ScoringRule` | `GroupRule[]`, `ScoreRecord[]` | Removing a rule removes group links and scores |
| `GroupRule` | None (removed when group or rule deleted) |
| `ScoreRecord` | None (removed when user, group, or rule deleted) |
| `ActivityLog` | None (removed when user or group deleted) |

---

## Query Patterns

### Common Queries

#### Get user with all groups
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    groupMemberships: {
      include: { group: true }
    },
    groups: true // Groups created by user
  }
});
```

#### Get group with members and their roles
```typescript
const group = await prisma.group.findUnique({
  where: { id: groupId },
  include: {
    members: {
      include: { user: true }
    },
    createdBy: true
  }
});
```

#### Get user's scores in a group
```typescript
const scores = await prisma.scoreRecord.findMany({
  where: {
    userId: userId,
    groupId: groupId
  },
  include: {
    rule: true
  },
  orderBy: { recordedAt: 'desc' }
});
```

#### Get group's scoring rules
```typescript
const rules = await prisma.groupRule.findMany({
  where: {
    groupId: groupId,
    isActive: true
  },
  include: {
    rule: true
  }
});
```

#### Get recent activity for a user
```typescript
const activities = await prisma.activityLog.findMany({
  where: {
    userId: userId
  },
  orderBy: { timestamp: 'desc' },
  take: 50
});
```

#### Get total points for a user in a group
```typescript
const totalPoints = await prisma.scoreRecord.aggregate({
  where: {
    userId: userId,
    groupId: groupId
  },
  _sum: { points: true }
});
```

#### Check if user is group owner
```typescript
const membership = await prisma.groupMember.findUnique({
  where: {
    userId_groupId: {
      userId: userId,
      groupId: groupId
    }
  }
});

const isOwner = membership?.role === "OWNER";
```

---

## Index Usage

### Performance Optimization
The following indexes optimize common queries:

| Index | Query Pattern | Example |
|-------|---------------|---------|
| `Group.createdById` | Get groups by creator | `prisma.group.findMany({ where: { createdById } })` |
| `Group.isActive` | Filter active groups | `prisma.group.findMany({ where: { isActive: true } })` |
| `GroupMember.userId` | Get user's groups | `prisma.groupMember.findMany({ where: { userId } })` |
| `GroupMember.groupId` | Get group members | `prisma.groupMember.findMany({ where: { groupId } })` |
| `ScoringRule.isActive` | Filter active rules | `prisma.scoringRule.findMany({ where: { isActive: true } })` |
| `GroupRule.groupId` | Get group's rules | `prisma.groupRule.findMany({ where: { groupId } })` |
| `ScoreRecord.userId` | Get user's scores | `prisma.scoreRecord.findMany({ where: { userId } })` |
| `ScoreRecord.groupId` | Get group's scores | `prisma.scoreRecord.findMany({ where: { groupId } })` |
| `ScoreRecord.ruleId` | Get scores by rule | `prisma.scoreRecord.findMany({ where: { ruleId } })` |
| `ScoreRecord.recordedAt` | Time-based queries | `prisma.scoreRecord.findMany({ orderBy: { recordedAt: 'desc' } })` |
| `ActivityLog.userId` | User's activity | `prisma.activityLog.findMany({ where: { userId } })` |
| `ActivityLog.groupId` | Group's activity | `prisma.activityLog.findMany({ where: { groupId } })` |
| `ActivityLog.timestamp` | Recent activity | `prisma.activityLog.findMany({ orderBy: { timestamp: 'desc' } })` |
| `ActivityLog.action` | Filter by action | `prisma.activityLog.findMany({ where: { action } })` |

---

## Constraints Summary

### Unique Constraints
| Table | Fields | Purpose |
|-------|--------|---------|
| `User` | `email` | Unique email addresses |
| `Account` | `[provider, providerAccountId]` | One account per provider |
| `Session` | `sessionToken` | Unique session tokens |
| `GroupMember` | `[userId, groupId]` | One membership per user per group |
| `GroupRule` | `[groupId, ruleId]` | One rule per group |
| `VerificationToken` | `token` | Unique tokens |
| `VerificationToken` | `[identifier, token]` | One token per email |

---

## JSON Field Patterns

### ScoringRule.criteria
```json
{
  "minScore": 80,
  "maxScore": 100,
  "category": "quiz",
  "weight": 1.5,
  "maxPerDay": 3
}
```

### ScoreRecord.criteria
```json
{
  "assignmentName": "Quiz 1",
  "actualScore": 85,
  "maxScore": 100,
  "submissionDate": "2024-01-15",
  "late": false
}
```

### ActivityLog.metadata
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "role": "ADMIN",
  "ipAddress": "192.168.1.1",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Database Migration Strategy

### Adding New Fields
```prisma
model User {
  // existing fields...
  newField String?
}
```

Run: `npx prisma db push` (development) or `npx prisma migrate dev` (with migration file)

### Adding New Models
```prisma
model NewModel {
  id    String @id @default(cuid())
  field String
}
```

Run: `npx prisma migrate dev --name add_new_model`

### Adding Indexes
```prisma
model User {
  // existing fields...
  
  @@index([email])
}
```

Run: `npx prisma db push` or create migration

---

## Data Seeding

**File**: `prisma/seed.js`

**File**: `prisma/admin-setup.js`

**Purpose**: Create initial admin users and sample data

**Usage**:
```bash
npm run db:seed           # Run seed script
npm run seed:admin        # Create admin user
```

---

## Database Connection

**File**: `src/lib/prisma.ts`

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Best Practice**: Always import from `@/lib/prisma`, never create new `PrismaClient()` instances
