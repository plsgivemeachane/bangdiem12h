# Implementation Plan: Password Verification and Registration System

**Branch**: `main` | **Date**: 2025-10-31 | **Spec**: [link to specs/main/spec.md]
**Input**: Feature specification from `/specs/main/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement password verification and user registration system for existing group scoring application. Extend current NextAuth.js setup with password-based authentication, bcrypt hashing, and role-based registration. Default new users to USER role with optional admin creation script.

## Technical Context

**Language/Version**: TypeScript 5.0+  
**Primary Dependencies**: Next.js 14.0.3, NextAuth.js 4.24.5, Prisma 6.18.0, bcryptjs 2.4.3  
**Storage**: PostgreSQL (existing Supabase instance)  
**Testing**: Jest/React Testing Library (need verification)  
**Target Platform**: Web application (Next.js)  
**Project Type**: Web application with API routes  
**Performance Goals**: Maintain existing performance (<100ms p95 for auth operations)  
**Constraints**: Must maintain backward compatibility with existing OAuth users  
**Scale/Scope**: Single web application, extend existing user model and auth system

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Post-Design Verification (Phase 1 Complete)

**Security Requirements** ✅
- ✅ Password hashing using bcryptjs with 12 rounds (research validated)
- ✅ Activity logging for auth events (existing infrastructure extended)
- ✅ Secure password validation (8+ chars, complexity requirements)
- ✅ No sensitive data exposure in responses (generic error messages)
- ✅ No plaintext password storage or logging
- ✅ Rate limiting considerations documented

**Integration Requirements** ✅
- ✅ Extend existing User model (password field nullable - maintains OAuth compatibility)
- ✅ Maintain NextAuth.js compatibility (password verification integrated)
- ✅ Preserve OAuth authentication flow (existing users unaffected)
- ✅ Use existing Prisma database structure (minimal schema changes)
- ✅ Follow existing code patterns and conventions (API routes, types, utils)
- ✅ Maintain existing project structure (single Next.js app)

**Data Model Validation** ✅
- ✅ User entity properly extended with password field
- ✅ UserRole enum maintained (USER default, ADMIN for admins)
- ✅ ActivityLog enhanced with new auth event types
- ✅ Database relationships preserved
- ✅ Migration strategy documented and safe

**API Design Validation** ✅
- ✅ RESTful endpoints following project conventions
- ✅ OpenAPI specification created with full documentation
- ✅ TypeScript types generated for type safety
- ✅ Error handling standardized
- ✅ Input validation using Zod schemas (existing pattern)

**Performance & Scalability** ✅
- ✅ Database indexes planned for auth operations
- ✅ bcrypt rounds optimized (12 = good security/performance balance)
- ✅ Session management maintains existing performance
- ✅ No breaking changes to current features

**✅ ALL GATES PASSED** - Implementation ready to proceed to Phase 2 (Tasks)

## Project Structure

### Documentation (this feature)

```text
specs/main/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Option 1: Single project (CURRENT - Next.js web app)
src/
├── app/api/auth/        # Existing auth routes + new registration
├── lib/
│   ├── auth.ts         # Extend with password utilities
│   └── utils/          # Password hashing utilities
└── types/              # Extend user types

prisma/
├── schema.prisma       # Add password field to User model
├── seed.js             # Create default admin user
└── admin-setup.js      # Database wipe and admin creation

tests/
├── api/                # Test new registration endpoints
├── auth/               # Test password verification
└── integration/        # Test auth flow integration
```

**Structure Decision**: Extending existing Next.js single project structure. Add password utilities, registration endpoint, and admin scripts while maintaining current organization.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None required | Current structure sufficient | N/A |