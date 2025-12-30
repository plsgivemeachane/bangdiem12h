# Agent Guidelines

### Project Overview
Next.js 14 application for classroom management ("Quản lý lớp học 12H") with role-based access control, group scoring systems, and activity logging. Tech stack: Next.js, TypeScript, Prisma, NextAuth, React Query, Radix UI/shadcn/ui.

### Commands
- npm run dev - Start development server
- npm run build - Build for production
- npm run lint - Run ESLint (Next.js config)
- npm run format - Format with Prettier: npx prettier --write "src/**/*.ts" "src/**/*.tsx"
- npm run db:generate - Generate Prisma client
- npm run db:push - Push schema changes to database
- npm run db:migrate - Run migrations in development
- npm run db:studio - Open Prisma Studio
- npm run db:seed - Seed database
- npm run seed:admin - Seed admin user
- Tests: No test framework configured. Jest-style tests (describe/it/expect) are used in codebase. Test patterns: *.test.ts, *.test.tsx, *.spec.ts, *.spec.tsx. If framework added: npm test -- password.test.ts or npm test -- -t "hashPassword"

### Code Style Guidelines

**Path Aliases**: @/* (root), @/components/*, @/lib/*, @/types/*, @/utils/* for internal imports.

**Imports**: External packages first, then internal modules. Use named imports.

**Formatting**: 2-space indentation, Prettier enforced. Use cn() utility from @/lib/utils for className composition.

**Types**: Strict TypeScript. Interfaces for object shapes, type aliases for unions. Result pattern: success: boolean; data?: T; error?: string. Extend modules in global.d.ts or inline.

**Naming**: camelCase variables/functions, PascalCase components/classes, UPPER_SNAKE_CASE constants.

**Error Handling**: Try-catch with console.error (Vietnamese). Custom error classes extend Error. Use @/lib/api-utils.ts helpers. Log activity via logActivity() for user actions.

**API Routes (src/app/api/**)**: Export GET/POST/PUT/DELETE. Validate session with getServerSession(authOptions) from @/lib/auth. Check roles. Use NextResponse.json(). Add caching via getCacheHeaders() from @/lib/cache/http-headers for GET endpoints. Use translations from @/lib/translations.

**Components**: Add "use client"; directive. Use Radix UI primitives with shadcn/ui patterns and Lucide icons. Use forwardRef for interactive components. Use cva for variants. Use react-hook-form with zodResolver. Use LoadingSpinner with <LoadingSpinner className="mr-2" /> in buttons. Toast notifications: react-hot-toast with toast.success() and toast.error().

**Forms**: react-hook-form with zod validation. Import: useForm from "react-hook-form", zodResolver from "@hookform/resolvers/zod", z from "zod". Use shadcn/ui Form components: FormField, FormItem, FormLabel, FormControl, FormMessage from @/components/ui/form. Use cn() for className composition.

**Services (src/lib/services/)**: Static class methods for business logic. Use Prisma transactions (await prisma.$transaction()) for multi-step operations. Return AuthServiceResult pattern. Custom error classes extend Error.

**Database**: Single Prisma client from @/lib/prisma. Use @/lib/prisma.ts exports, not new PrismaClient(). PostgreSQL database. Use onDelete: Cascade for foreign keys.

**Localization**: Vietnamese translations in @/lib/translations.ts. Import: LABELS, ACTIONS, MESSAGES, API, COMPONENTS. Use for all user-facing text.

**Activity Logging**: Import logActivity from @/lib/activity-logger. Call after significant operations with userId, groupId, action (ActivityType enum), description, metadata. Examples: user registration, login, group operations, score records. Import ActivityType from @/types.

**Authentication**: NextAuth with authOptions from @/lib/auth. Session extends next-auth module to include role, id, createdAt. Use getServerSession(authOptions) for API routes.

**Role-Based Access**: Check session.user.role === "ADMIN" for admin operations. Group roles: OWNER, ADMIN, MEMBER. Use injectVirtualAdminMembership() from @/lib/utils/global-admin-permissions for virtual admin.

**Password Utilities**: Import from @/lib/utils/password: hashPassword, verifyPassword, validatePasswordStrength, generateSecurePassword. PASSWORD_CONFIG contains validation rules.

**React Query**: Use @tanstack/react-query. Import useQuery and useMutation. Use DevTools: @tanstack/react-query-devtools.

**ESLint**: no-var, prefer-const, no-img-element (use Next.js Image), react/no-unescaped-entities.

**Prisma Enums**: UserRole (USER, ADMIN), GroupRole (MEMBER, ADMIN, OWNER), ActivityType.

### Project Structure
- src/app/api/** - API route handlers
- src/app/** - Page components (Next.js App Router)
- src/components/** - Reusable UI components
- src/lib/** - Utilities, services, configurations
- prisma/** - Database schema and migrations

### Workflow Protocol

Follow this process for every task: Plan before explore, update todo list showing finished tasks, one task at a time, approval loop before implementation, validate after changes.

**Phases**:
1. Phase 0: Formulate Investigation Strategy
2. Phase 1: Investigate & Explore Codebase
3. Phase 2: Approval Loop (Propose, Refine, Confirm) - STOP until user approves
4. Phase 3: Implement Feature
5. Phase 4: Validate

**Task Lifecycle**: Every actionable task follows [ ] -> [-] -> [x]. Mark [-] before [x].

**Todo List Format**:
[x] Phase 0: Formulate Investigation Strategy
[x] Phase 1: Investigate & Explore Codebase
[-] Phase 2: The Approval Loop (Propose, Refine, Confirm)
[ ]   - Synthesize findings and formulate implementation plan.
[ ]   - Present plan for approval using ask_followup_question.
[ ] Phase 3: Implement Feature (LOCKED until approved)
[ ] Phase 4: Validate
---
[ ] I will always create a plan (Phase 0) before exploring (Phase 1).
[ ] I will follow this entire process for every task.
[ ] I will always show complete, expanded plan with finished tasks visible.
[ ] I will mark task [-] (in progress) before [x] (done).
[ ] I must revise plan during Phase 2 if needed and not proceed without Yes.
[ ] The entire feature is complete only when Phase 4 is fully [x].

**Execution Cycle**: Announce task -> Update to [-] -> Execute -> Announce result -> Update to [x].

### Core Tools

Use ask_followup_question at approval points:
- question: Clear summary of proposed plan
- follow_up: Optional list of 2-4 suggested answers

### Rules of Engagement

1. The Process is Non-Negotiable: Follow this operational protocol for every task, no shortcuts.
2. Show complete, expanded plan in every update, keeping finished tasks visible.
3. Work on only one actionable task at a time.
4. Update and present todo list after every single state change to an actionable task.
5. Final sign-off: Feature complete only when Phase 4 is fully [x].
