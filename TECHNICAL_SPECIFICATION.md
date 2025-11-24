# Quản lý lớp học (Class Management) - Technical Specification

**System Name**: Quản lý lớp học (Class Management System)  
**Version**: 1.0.0  
**Last Updated**: 2025-11-10  
**Status**: Production Ready  

## Executive Summary

Quản lý lớp học is a comprehensive web-based class management and scoring system built with modern technologies. The platform enables educators to create groups, define custom scoring rules, track student performance, and maintain detailed activity logs. The system supports both OAuth and email/password authentication with role-based access control.

## 1. System Architecture

### 1.1 Technology Stack

**Core Framework:**
- **Next.js 14.0.3** with App Router
- **TypeScript 5.0+** for type safety
- **React 18+** for UI components

**Backend & Database:**
- **Prisma ORM 6.18.0** with PostgreSQL
- **Supabase** as database hosting solution
- **API Routes** for backend logic

**Authentication & Security:**
- **NextAuth.js 4.24.5** for authentication
- **bcryptjs 2.4.3** for password hashing (12 salt rounds)
- **JWT** tokens for session management

**UI & Styling:**
- **Tailwind CSS** for responsive design
- **Headless UI** components
- **Radix UI** primitives
- **Lucide React** for icons

**Development & Testing:**
- **ESLint** for code linting
- **Jest/React Testing Library** (configured)

### 1.2 Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     BangDiemLop System                      │
├─────────────────────────────────────────────────────────────┤
│  Frontend Layer (Next.js App Router)                       │
│  ├── Dashboard & Analytics                                  │
│  ├── Group Management (Create, Members, Rules, Scoring)    │
│  ├── User Account & Settings                               │
│  ├── Admin Panel (User Management)                         │
│  └── Authentication (Sign In, Registration)                │
├─────────────────────────────────────────────────────────────┤
│  API Layer (Next.js API Routes)                            │
│  ├── /api/auth/* (Registration, Login, Password Reset)     │
│  ├── /api/groups/* (Group CRUD Operations)                 │
│  ├── /api/admin/* (User Management)                        │
│  ├── /api/score-records/* (Scoring Operations)             │
│  ├── /api/analytics/* (Analytics Data)                     │
│  └── /api/activity-logs/* (Activity Tracking)              │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                      │
│  ├── Authentication Service                                │
│  ├── Group Management Service                              │
│  ├── Scoring Rules Engine                                  │
│  ├── Activity Logging Service                              │
│  └── Analytics Service                                     │
├─────────────────────────────────────────────────────────────┤
│  Data Access Layer (Prisma)                                │
│  ├── User Management                                       │
│  ├── Group & Membership Data                               │
│  ├── Scoring Rules & Records                               │
│  ├── Activity Logs                                         │
│  └── Analytics Data                                        │
├─────────────────────────────────────────────────────────────┤
│  Database (PostgreSQL via Supabase)                        │
│  ├── Users, Groups, Activities                             │
│  ├── Scoring Rules, Records                                │
│  ├── User Sessions & Auth Data                             │
│  └── System Configuration                                  │
└─────────────────────────────────────────────────────────────┘
```

## 2. Core Features & Modules

### 2.1 Authentication System

**Dual Authentication Support:**
- **OAuth Integration**: Google, GitHub, Facebook providers
- **Email/Password**: Custom registration with secure hashing
- **Session Management**: JWT-based with NextAuth.js

**Security Features:**
- bcrypt hashing with 12 rounds
- Password complexity validation (8+ chars, mixed case, numbers, special chars)
- Generic error messages (prevent user enumeration)
- Rate limiting considerations
- Activity logging for all auth events

**User Roles:**
- **USER**: Basic access, group participation
- **ADMIN**: Full system management, user administration

### 2.2 Group Management System

**Group Operations:**
- Create and manage groups
- Member invitation via email
- Owner transfer functionality
- Group settings and configuration

**Membership Management:**
- Add/remove members
- Role assignment within groups
- Invitation tracking
- Member status monitoring

### 2.3 Scoring System

**Scoring Rules Engine:**
- Custom rule creation with point values
- Flexible criteria configuration
- Rule activation/deactivation
- Rule modification and versioning

**Score Recording:**
- Point assignment based on rules
- Timestamp tracking
- Criteria validation
- Score history and audit trail

**Analytics & Reporting:**
- Weekly, monthly, yearly analytics
- Performance trend analysis
- Score distribution statistics
- Group comparison metrics

### 2.4 Activity Logging & Monitoring

**Comprehensive Activity Tracking:**
- User registration and authentication
- Group operations (create, join, leave)
- Scoring events and rule changes
- Admin actions and system changes

**Audit Trail:**
- Timestamped activity records
- User attribution for all actions
- Metadata storage for context
- Searchable activity history

## 3. Data Model

### 3.1 Core Entities

**User Entity:**
```typescript
interface User {
  id: string                    // Primary key
  name: string | null           // Optional full name
  email: string                 // Unique email address
  password: string | null       // Hashed password (nullable for OAuth)
  role: UserRole               // USER | ADMIN
  image: string | null          // Profile image URL
  emailVerified: Date | null    // Email verification timestamp
  createdAt: Date              // Creation timestamp
  updatedAt: Date              // Last update timestamp
}
```

**Group Entity:**
```typescript
interface Group {
  id: string                   // Primary key
  name: string                 // Group name
  description: string | null   // Optional description
  ownerId: string              // Group owner reference
  isActive: boolean            // Group status
  createdAt: Date             // Creation timestamp
  updatedAt: Date             // Last update timestamp
}
```

**ScoringRule Entity:**
```typescript
interface ScoringRule {
  id: string                  // Primary key
  name: string                // Rule name
  description: string | null  // Rule description
  criteria: any              // JSON criteria configuration
  points: number             // Point value
  isActive: boolean          // Rule status
  createdAt: Date           // Creation timestamp
  updatedAt: Date           // Last update timestamp
}
```

**ScoreRecord Entity:**
```typescript
interface ScoreRecord {
  id: string                 // Primary key
  userId: string            // User reference
  groupId: string           // Group reference
  ruleId: string            // Scoring rule reference
  points: number            // Points awarded
  criteria: any            // Applied criteria
  recordedBy: string       // User who recorded
  createdAt: Date         // Recording timestamp
}
```

**ActivityLog Entity:**
```typescript
interface ActivityLog {
  id: string          // Primary key
  userId: string     // User reference
  action: string     // Action type
  description: string // Activity description
  metadata: any      // Additional context data
  createdAt: Date   // Activity timestamp
}
```

### 3.2 Database Relationships

- **User → Groups**: One-to-Many (owned groups)
- **User → GroupMembers**: One-to-Many (group memberships)
- **User → ScoreRecords**: One-to-Many (score history)
- **User → ActivityLogs**: One-to-Many (activity history)
- **Group → GroupMembers**: One-to-Many
- **Group → ScoreRecords**: One-to-Many
- **Group → ScoringRules**: One-to-Many
- **ScoringRule → ScoreRecords**: One-to-Many

## 4. API Architecture

### 4.1 Authentication Endpoints

```yaml
POST /api/auth/register
  - User registration with email/password
  - Default USER role assignment
  - Activity logging

POST /api/auth/reset-password
  - Password reset request
  - Email validation
  - Secure token generation

GET/POST /api/auth/[...nextauth]
  - OAuth and credential authentication
  - Session management
  - JWT token handling
```

### 4.2 Group Management Endpoints

```yaml
GET /api/groups
  - List user's groups
  - Pagination support
  - Search and filter

POST /api/groups
  - Create new group
  - Owner assignment
  - Default settings

GET/PUT/DELETE /api/groups/[id]
  - Group detail operations
  - Update group settings
  - Group deletion

GET/POST /api/groups/[id]/members
  - Group member management
  - Member invitation
  - Role assignment
```

### 4.3 Scoring System Endpoints

```yaml
GET/POST /api/scoring-rules
  - Scoring rules CRUD
  - Rule validation
  - Activation control

GET/POST /api/score-records
  - Score recording
  - Score history retrieval
  - Analytics data
```

### 4.4 Admin Endpoints

```yaml
GET/POST /api/admin/users
  - User management
  - Role assignment
  - User search and filtering

GET/POST /api/admin/users/[id]
  - Individual user operations
  - Password management
  - Account status control
```

### 4.5 Analytics Endpoints

```yaml
GET /api/analytics
  - Performance analytics
  - Trend data
  - Report generation

GET /api/activity-logs
  - System activity
  - Audit trail
  - Search and filter
```

## 5. Security Implementation

### 5.1 Authentication Security

**Password Security:**
- bcrypt hashing with 12 rounds
- Strong password requirements
- No plaintext password storage
- Secure session management

**OAuth Security:**
- Secure token handling
- Provider integration security
- CSRF protection
- Session timeout management

### 5.2 Data Protection

**Input Validation:**
- Zod schema validation
- SQL injection prevention
- XSS protection
- Rate limiting

**Data Privacy:**
- Generic error messages
- Sensitive data exclusion
- Activity logging without exposure
- Secure API responses

### 5.3 Access Control

**Role-Based Access:**
- USER and ADMIN role separation
- Endpoint permission validation
- Resource-level access control
- Action-based permissions

## 6. Internationalization

### 6.1 Vietnamese Localization System

**Translation Architecture:**
- Centralized translation management
- Type-safe translation keys
- 50+ translation categories
- IDE autocompletion support

**Translation Categories:**
```typescript
ACTIONS, LABELS, MESSAGES, COMPONENTS, VALIDATION,
SCORE_RECORDING, USER_ACCOUNT, ADMIN_USERS, API,
NAV, USER_ROLES, GROUP_ROLES, DESCRIPTIONS, PLACEHOLDERS
```

**Developer Guidelines:**
- Comprehensive translation guidelines
- ESLint rules for enforcement
- TypeScript interface validation
- Best practices documentation

## 7. Performance & Scalability

### 7.1 Performance Targets

**Response Time Goals:**
- Authentication operations: <100ms p95
- Group operations: <150ms p95
- Analytics queries: <500ms p95
- Dashboard loading: <200ms p95

**Database Optimization:**
- Indexes on frequently queried fields
- Optimized relational queries
- Efficient pagination
- Connection pooling

### 7.2 Caching Strategy

**Application Level:**
- User session caching
- Group data caching
- Analytics result caching
- Static content caching

## 8. Development Guidelines

### 8.1 Code Standards

**TypeScript Conventions:**
- Strict mode enabled
- Interface definitions for all types
- Proper error handling
- Type safety throughout

**Code Organization:**
- Feature-based directory structure
- Separation of concerns
- Reusable component design
- Utility function organization

### 8.2 API Design Principles

**RESTful Design:**
- Consistent endpoint naming
- Appropriate HTTP methods
- Standardized response formats
- Proper status code usage

**Documentation:**
- OpenAPI 3.0 specification
- TypeScript type definitions
- API examples and use cases
- Error response documentation

## 9. Deployment & Infrastructure

### 9.1 Development Environment

**Local Development:**
- Next.js dev server
- Supabase local development
- Environment variable configuration
- Hot reloading support

**Database Migration:**
- Prisma migration system
- Seed data management
- Version control integration
- Rollback procedures

### 9.2 Production Considerations

**Environment Configuration:**
- Production database setup
- Authentication provider configuration
- Environment variable management
- Security certificate setup

**Monitoring & Logging:**
- Activity log monitoring
- Error tracking
- Performance monitoring
- User analytics

## 10. Testing Strategy

### 10.1 Testing Framework

**Unit Testing:**
- Jest for utility functions
- React Testing Library for components
- API route testing
- Database operation testing

**Integration Testing:**
- End-to-end authentication flow
- Group management workflows
- Scoring system integration
- Admin functionality testing

### 10.2 Quality Assurance

**Code Quality:**
- ESLint configuration
- TypeScript strict mode
- Prettier code formatting
- Git hooks for quality checks

## 11. Future Enhancements

### 11.1 Planned Features

**Short Term (3-6 months):**
- Real-time notifications
- Advanced analytics dashboard
- Mobile responsiveness improvements
- Email notification system

**Medium Term (6-12 months):**
- Mobile application
- Advanced reporting features
- Integration with external systems
- Multi-language support expansion

**Long Term (12+ months):**
- Machine learning insights
- Advanced group management features
- Third-party integrations
- Enterprise features

### 11.2 Technical Improvements

**Performance Optimization:**
- Database query optimization
- Frontend bundle optimization
- CDN implementation
- Caching strategy enhancement

**Security Enhancements:**
- Advanced threat protection
- Compliance certifications
- Security audit implementation
- Enhanced monitoring

## 12. Conclusion

BangDiemLop represents a modern, comprehensive group scoring and class management system built with industry best practices and modern technologies. The system's architecture supports scalability, security, and maintainability while providing a rich user experience for educators and students.

The platform's dual authentication system, comprehensive group management, flexible scoring rules, and detailed analytics make it a powerful tool for educational environments. The Vietnamese localization system and TypeScript implementation ensure both accessibility and code quality.

**Key Strengths:**
- Modern, scalable architecture
- Comprehensive feature set
- Strong security implementation
- Type-safe development
- Comprehensive documentation
- Internationalization support

**Development Priorities:**
1. Complete translation system coverage
2. Enhanced mobile experience
3. Advanced analytics features
4. Performance optimization
5. Security enhancements

This technical specification serves as the foundation for ongoing development and provides clear guidance for feature implementation, architectural decisions, and system maintenance.