# Components Map

## Overview
This document describes the component hierarchy and relationships in `src/components/**` directory. The application uses Next.js 14 with React components, primarily built with Radix UI primitives and shadcn/ui patterns.

## Component Structure
```
src/components/
├── activity/
│   └── ActivityFeed.tsx
├── admin/
│   └── CacheMonitoring.tsx
├── groups/
│   ├── CachedGroupList.tsx
│   ├── GroupCard.tsx
│   ├── GroupForm.tsx
│   ├── GroupList.tsx
│   ├── MemberInvite.tsx
│   └── OwnerTransferDialog.tsx
├── layout/
│   ├── AppHeader.tsx
│   ├── LandingPage.tsx
│   └── UserAccountMenu.tsx
├── search/
│   └── SearchModal.tsx
└── ui/
    ├── alert.tsx
    ├── avatar.tsx
    ├── badge.tsx
    ├── button.tsx
    ├── card.tsx
    ├── checkbox.tsx
    ├── command.tsx
    ├── dialog.tsx
    ├── dropdown-menu.tsx
    ├── form.tsx
    ├── input.tsx
    ├── label.tsx
    ├── loading.tsx
    ├── popover.tsx
    ├── rule-creation-modal.tsx
    ├── score-recording-modal.tsx
    ├── select.tsx
    ├── separator.tsx
    ├── tabs.tsx
    ├── textarea.tsx
    ├── tooltip.tsx
    └── user-tag.tsx
```

---

## Activity Components

### ActivityFeed.tsx
**File**: `src/components/activity/ActivityFeed.tsx`

**Purpose**: Display activity logs in a feed format

**Props**:
```typescript
{
  activities: ActivityLog[];
  maxItems?: number;
}
```

**Dependencies**:
- Uses Lucide icons
- Uses `formatDistanceToNow` for date formatting
- Uses `ACTIONS` from `@/lib/translations`

**Features**:
- Displays recent activities
- Shows user and group context
- Translates action types

---

## Admin Components

### CacheMonitoring.tsx
**File**: `src/components/admin/CacheMonitoring.tsx`

**Purpose**: Display React Query cache statistics

**Props**: None

**Dependencies**:
- Uses `queryClient` from `@/lib/cache/query-client`
- Uses React hooks

**Features**:
- Shows cache size and hit rate
- Displays cached queries
- Provides cache clear button

---

## Group Management Components

### CachedGroupList.tsx
**File**: `src/components/groups/CachedGroupList.tsx`

**Purpose**: Cached list of groups using React Query

**Props**: None

**Dependencies**:
- `useGroups` hook from `@/hooks/use-groups`
- `GroupCard` component

**Features**:
- Fetches groups with React Query
- Shows loading/error states
- Renders `GroupCard` for each group

---

### GroupCard.tsx
**File**: `src/components/groups/GroupCard.tsx`

**Purpose**: Display group information card

**Props**:
```typescript
{
  group: Group & {
    members?: GroupMember[];
    _count?: { scoreRecords: number; groupRules: number };
  };
  currentUserId?: string;
  onEdit?: (group: Group) => void;
  onDelete?: (group: Group) => void;
}
```

**Dependencies**:
- `Card` component from `@/components/ui/card`
- `Badge` component from `@/components/ui/badge`
- Lucide icons

**Features**:
- Shows group name, description
- Displays member count and score count
- Shows active/inactive status
- Action buttons for edit/delete

---

### GroupForm.tsx
**File**: `src/components/groups/GroupForm.tsx`

**Purpose**: Form for creating/editing groups

**Props**:
```typescript
{
  group?: Group; // If provided, edit mode
  onSuccess?: () => void;
  onCancel?: () => void;
}
```

**Dependencies**:
- `useForm` from "react-hook-form"
- `zodResolver` from "@hookform/resolvers/zod"
- Form components from `@/components/ui/form`
- Zod validation schema

**Features**:
- Create or edit group
- Validates name and description
- Submits to `/api/groups`

**Validation Schema**:
```typescript
{
  name: z.string().min(3, "Tên nhóm phải có ít nhất 3 ký tự"),
  description: z.string().optional()
}
```

---

### GroupList.tsx
**File**: `src/components/groups/GroupList.tsx`

**Purpose**: List all groups with filtering

**Props**:
```typescript
{
  groups?: (Group & {
    members?: GroupMember[];
    _count?: { scoreRecords: number; groupRules: number };
  })[];
  loading?: boolean;
  onRefresh?: () => void;
}
```

**Dependencies**:
- `CachedGroupList`
- `GroupCard`
- Search functionality

**Features**:
- Displays all user's groups
- Search/filter groups
- Refresh button

---

### MemberInvite.tsx
**File**: `src/components/groups/MemberInvite.tsx`

**Purpose**: Modal for inviting members to a group

**Props**:
```typescript
{
  group: Group;
  onSuccess?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}
```

**Dependencies**:
- `Dialog` component from `@/components/ui/dialog`
- `useForm` from "react-hook-form"
- Zod validation

**Features**:
- Invite user by email
- Select role (MEMBER/ADMIN)
- Submits to `/api/groups/[id]/members/invite`

**Validation Schema**:
```typescript
{
  email: z.string().email("Email không hợp lệ"),
  role: z.enum(["MEMBER", "ADMIN"])
}
```

---

### OwnerTransferDialog.tsx
**File**: `src/components/groups/OwnerTransferDialog.tsx`

**Purpose**: Modal for transferring group ownership

**Props**:
```typescript
{
  group: Group;
  members: GroupMember[];
  onSuccess?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}
```

**Dependencies**:
- `Dialog` component from `@/components/ui/dialog`
- `Select` component from `@/components/ui/select`

**Features**:
- Select new owner from admins
- Submits to `/api/groups/[id]/ownership`
- Confirms action

---

## Layout Components

### AppHeader.tsx
**File**: `src/components/layout/AppHeader.tsx`

**Purpose**: Main application header

**Props**: None

**Dependencies**:
- `UserAccountMenu`
- `SearchModal`
- Lucide icons

**Features**:
- Displays app title/logo
- User account menu
- Search button

---

### LandingPage.tsx
**File**: `src/components/layout/LandingPage.tsx`

**Purpose**: Public landing page

**Props**: None

**Dependencies**:
- Next.js Link
- Tailwind CSS

**Features**:
- Hero section
- Features list
- Call to action (sign in/sign up)

---

### UserAccountMenu.tsx
**File**: `src/components/layout/UserAccountMenu.tsx`

**Purpose**: Dropdown menu for user account actions

**Props**: None

**Dependencies**:
- `DropdownMenu` from `@/components/ui/dropdown-menu`
- `Avatar` from `@/components/ui/avatar`
- `signOut` from "next-auth/react"

**Features**:
- Shows user avatar and name
- Menu items: Account settings, Sign out
- Links to `/account/settings`

---

## Search Components

### SearchModal.tsx
**File**: `src/components/search/SearchModal.tsx`

**Purpose**: Modal for searching across the application with keyboard navigation

**Props**:
```typescript
{
  isOpen: boolean;
  onClose: () => void;
}
```

**State**:
- `query`: Search input string
- `results`: Array of search results
- `selectedIndex`: Currently selected result index
- `isLoading`: Loading state for async search

**Dependencies**:
- `Dialog` from `@/components/ui/dialog`
- `Input` from `@/components/ui/input`
- `Badge` from `@/components/ui/badge`
- `router` from `next/navigation`
- Lucide icons: Search, Users, Trophy, Settings, LayoutDashboard, TrendingUp, Shield, Keyboard, ArrowRight, Loader2

**Features**:
- Debounced search (300ms delay)
- Quick actions for common pages (Dashboard, Groups, Analytics, Score Records, Settings)
- Async search for groups via `/api/groups`
- Async search for members via `/api/activity-logs`
- Case-insensitive filtering using `lowerQuery` variable
- Keyboard navigation (ArrowUp/ArrowDown to navigate, Enter to select, Esc to close)
- Loading spinner during async operations
- Type badges for results (group, member, page, setting)
- Auto-focus input when modal opens
- Reset state when modal closes

**Search Result Types**:
- `group`: Groups matched by name
- `member`: Users found in activity logs
- `page`: Quick action pages (Dashboard, Groups, Analytics, Score Records, Admin Users)
- `setting`: Account settings

**Key Implementation Details**:
- `lowerQuery` is declared at function scope (line 123) for accessibility throughout `performSearch`
- Uses `Promise.all` for parallel API calls to `/api/groups` and `/api/activity-logs`
- Results filtered by title and subtitle using `includes(lowerQuery)`
- Maximum 10 results displayed

---

## UI Components (shadcn/ui based)

### alert.tsx
**Purpose**: Display alerts, warnings, or information

**Variants**: default, destructive

**Usage**:
```tsx
<Alert>
  <AlertTitle>Info</AlertTitle>
  <AlertDescription>Description text</AlertDescription>
</Alert>
```

---

### avatar.tsx
**Purpose**: Display user avatar image or initials

**Props**:
```typescript
{
  className?: string;
  src?: string;
  alt?: string;
  fallback?: string;
}
```

**Usage**:
```tsx
<Avatar>
  <AvatarImage src={user.image} />
  <AvatarFallback>{user.name[0]}</AvatarFallback>
</Avatar>
```

---

### badge.tsx
**Purpose**: Display small status indicators

**Variants**: default, secondary, destructive, outline, success

**Usage**:
```tsx
<Badge variant="success">Active</Badge>
```

---

### button.tsx
**Purpose**: Interactive buttons

**Variants**: default, destructive, outline, secondary, ghost, link
**Sizes**: default, sm, lg, icon

**Features**:
- Loading state with `LoadingSpinner`
- Disabled state

**Usage**:
```tsx
<Button variant="default" size="md" isLoading={loading}>
  Save
</Button>
```

---

### card.tsx
**Purpose**: Container for content

**Components**: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter

**Usage**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

---

### checkbox.tsx
**Purpose**: Checkbox input control

**Usage**:
```tsx
<Checkbox id="agree" />
<label htmlFor="agree">I agree</label>
```

---

### command.tsx
**Purpose**: Command palette for search and actions

**Usage**: Used in `SearchModal`

---

### dialog.tsx
**Purpose**: Modal dialog overlay

**Components**: Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter

**Usage**:
```tsx
<Dialog open={isOpen} onOpenChange={onOpenChange}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

---

### dropdown-menu.tsx
**Purpose**: Dropdown menu for actions

**Components**: DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator

**Usage**:
```tsx
<DropdownMenu>
  <DropdownMenuTrigger>Open</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Action 1</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### form.tsx
**Purpose**: Form components for react-hook-form integration

**Components**: Form, FormField, FormItem, FormLabel, FormControl, FormMessage

**Usage**:
```tsx
<Form {...form}>
  <FormField
    control={form.control}
    name="name"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Name</FormLabel>
        <FormControl><Input {...field} /></FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

---

### input.tsx
**Purpose**: Text input field

**Features**:
- Styled with shadcn/ui patterns

---

### label.tsx
**Purpose**: Label for form controls

---

### loading.tsx
**Purpose**: Loading spinner component

**Usage**:
```tsx
<LoadingSpinner className="mr-2" />
```

---

### popover.tsx
**Purpose**: Popover content positioning

**Components**: Popover, PopoverTrigger, PopoverContent

---

### rule-creation-modal.tsx
**Purpose**: Modal for creating scoring rules

**Dependencies**:
- `Dialog` component
- `useForm` from "react-hook-form"
- Zod validation

**Features**:
- Create scoring rules
- Define criteria (JSON)
- Set points value

---

### score-recording-modal.tsx
**Purpose**: Modal for recording scores

**Dependencies**:
- `Dialog` component
- `useForm` from "react-hook-form"
- Zod validation

**Features**:
- Select user
- Select rule
- Enter points
- Add notes

---

### select.tsx
**Purpose**: Dropdown select control

**Components**: Select, SelectTrigger, SelectValue, SelectContent, SelectItem

**Usage**:
```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

---

### separator.tsx
**Purpose**: Visual separator

**Orientation**: horizontal, vertical

---

### tabs.tsx
**Purpose**: Tabbed content

**Components**: Tabs, TabsList, TabsTrigger, TabsContent

**Usage**:
```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
</Tabs>
```

---

### textarea.tsx
**Purpose**: Multi-line text input

---

### tooltip.tsx
**Purpose**: Tooltip on hover

**Usage**:
```tsx
<Tooltip>
  <TooltipTrigger>Hover me</TooltipTrigger>
  <TooltipContent>Tooltip content</TooltipContent>
</Tooltip>
```

---

### user-tag.tsx
**Purpose**: Display user information as a tag

**Props**:
```typescript
{
  user: User;
  onRemove?: () => void;
}
```

**Features**:
- Shows avatar and name
- Optional remove button

---

## Component Hierarchy

### Page Level Components
```
src/app/
├── page.tsx (Landing page)
│   └── LandingPage
├── dashboard/
│   ├── page.tsx
│   │   └── DashboardClient
│   │       ├── AppHeader
│   │       │   ├── UserAccountMenu
│   │       │   └── SearchModal
│   │       └── CachedGroupList
│   │           └── GroupCard
│   └── dashboard-client.tsx
├── groups/
│   ├── page.tsx
│   │   └── GroupList
│   │       ├── GroupCard
│   │       └── SearchModal
│   └── [id]/
│       ├── page.tsx
│       │   ├── AppHeader
│       │   ├── GroupCard (view mode)
│       │   ├── ScoreRecordingModal
│       │   └── ActivityFeed
│       ├── members/page.tsx
│       │   └── MemberInvite
│       └── scores/page.tsx
│           └── ScoreRecordingModal
├── auth/
│   └── signin/
│       └── page.tsx (sign in form)
└── admin/
    ├── users/page.tsx
    │   └── User management table
    └── scoring-rules/page.tsx
        └── RuleCreationModal
```

---

## Common Patterns

### Form Pattern
All forms use this pattern:
1. `useForm` from "react-hook-form"
2. `zodResolver` with Zod schema validation
3. shadcn/ui Form components
4. `cn()` for className composition
5. Toast notifications for feedback

**Example**:
```tsx
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { name: "" }
});

const onSubmit = async (data) => {
  const response = await fetch("/api/groups", {
    method: "POST",
    body: JSON.stringify(data)
  });
  
  if (response.ok) {
    toast.success("Success!");
    onSuccess();
  } else {
    toast.error("Failed!");
  }
};
```

### Mutation Pattern
```tsx
const mutation = useMutation({
  mutationFn: (data) => createGroup(data),
  onSuccess: () => {
    toast.success("Group created!");
    queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    onSuccess();
  },
  onError: (error) => {
    toast.error(error.message);
  }
});
```

### Loading State Pattern
```tsx
{isLoading && <LoadingSpinner />}
{error && <Alert variant="destructive">{error}</Alert>}
{data && <Component data={data} />}
```

### Conditional Rendering Pattern
```tsx
{session?.user?.role === "ADMIN" && <AdminComponent />}
{isOwner && <EditButton />}
{isMember && <ViewButton />}
```

---

## Styling Conventions

### Tailwind CSS
- 2-space indentation
- `cn()` utility from `@/lib/utils` for className composition
- Responsive design with `sm:`, `md:`, `lg:` prefixes

### Color Scheme
- Primary: blue-600
- Destructive: red-600
- Success: green-600
- Background: white/gray-50/gray-100
- Text: gray-900/gray-500

### Spacing
- Standard spacing using Tailwind scale (1 = 0.25rem)
- Consistent padding: p-4, p-6, p-8

---

## Icon Usage

**Library**: Lucide React

**Common Icons**:
- `User`, `Users` - User-related
- `Settings`, `LogOut` - Account menu
- `Search` - Search
- `Plus`, `Edit`, `Trash`, `MoreVertical` - Actions
- `Activity`, `TrendingUp` - Analytics
- `ChevronDown`, `ChevronRight` - Navigation

**Usage**:
```tsx
import { Search, User, LogOut } from "lucide-react";

<Search className="h-5 w-5" />
```

---

## Toast Notifications

**Library**: react-hot-toast

**Usage**:
```tsx
import toast from "react-hot-toast";

toast.success("Success message", { id: "unique-id" });
toast.error("Error message");
toast.loading("Loading...", { id: "loading" });
```

---

## Component Composition

### Dialog Pattern
```tsx
<Dialog open={isOpen} onOpenChange={onOpenChange}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button onClick={onCancel}>Cancel</Button>
      <Button onClick={onConfirm}>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Card Pattern
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  {actions && (
    <CardFooter>
      {/* Action buttons */}
    </CardFooter>
  )}
</Card>
```

---

## Data Flow

### Props Flow
```tsx
Page Component
  ├── API Data (React Query)
  ├── Child Component
  │   ├── Child Data (mapped)
  │   ├── Action Handlers
  │   └── UI Components
  └── Loading/Error States
```

### Event Flow
```tsx
User Action
  ├── Form Submit / Button Click
  ├── Handler Function
  ├── API Call (useMutation)
  ├── Invalidate Cache
  ├── Toast Notification
  └── Callback (onSuccess/onCancel)
```

---

## Key Dependencies

| Component | Dependencies |
|-----------|-------------|
| ActivityFeed | Lucide, date-fns, translations |
| CachedGroupList | useGroups hook, GroupCard |
| GroupCard | Card, Badge, Lucide |
| GroupForm | react-hook-form, zod, Form components |
| MemberInvite | Dialog, react-hook-form, zod |
| AppHeader | UserAccountMenu, SearchModal |
| UserAccountMenu | DropdownMenu, Avatar, next-auth |

---

## Translation Integration

All user-facing text uses `@/lib/translations.ts`:
```tsx
import { LABELS, ACTIONS, MESSAGES } from "@/lib/translations";

<Label>{LABELS.GROUP_NAME}</Label>
<Button>{ACTIONS.CREATE}</Button>
{error && <Alert>{MESSAGES.ERROR.GENERAL}</Alert>}
```
