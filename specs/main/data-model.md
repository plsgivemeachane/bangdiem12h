# Data Model: Password Verification and Registration System

## Entities Extracted from Feature Specification

### User Entity (Extended)
**Primary Entity**: Extended from existing User model

**Fields**:
- `id: String` (Primary Key) - Existing
- `name: String?` (Optional) - Existing  
- `email: String` (Unique, Required) - Existing
- `password: String?` (Hashed, Optional, NEW) - Hashed using bcrypt
- `emailVerified: DateTime?` - Existing
- `image: String?` - Existing
- `role: UserRole` (Required, Default: USER) - Existing
- `createdAt: DateTime` (Required, Default: now()) - Existing
- `updatedAt: DateTime` (Required) - Existing

**Validation Rules**:
- Email must be unique and valid format
- Password optional for OAuth users, required for email/password registration
- Password must meet complexity requirements (min 8 chars, mixed case, numbers, special chars)
- Role must be valid UserRole enum value

**Relationships**:
- User → Account[] (NextAuth accounts)
- User → Session[] (NextAuth sessions)  
- User → Group[] (created groups)
- User → GroupMember[] (group memberships)
- User → ScoreRecord[] (scoring records)
- User → ActivityLog[] (activity log entries)

### UserRole Enum
**Definition**: 
```
enum UserRole {
  USER  = "USER"    // Default role for new registrations
  ADMIN = "ADMIN"   // Administrative privileges
}
```

**Rules**:
- USER: Basic access, can join groups, receive scores
- ADMIN: Full system access, can manage users, create admin users

### ActivityLog Entity (Extended)
**Enhanced for security events**

**New/Extended Fields**:
- `userId: String` (Required) - Existing
- `action: ActivityType` (Required) - Existing, including new security actions
- `description: String` (Required) - Existing
- `metadata: Json?` (Optional) - Existing, enhanced for security context

**New Activity Types for Authentication**:
- `USER_REGISTERED` - New user registration
- `USER_LOGIN` - Successful login
- `LOGIN_FAILED` - Failed login attempt
- `PASSWORD_RESET_REQUESTED` - Password reset requested
- `PASSWORD_RESET_COMPLETED` - Password reset completed
- `ADMIN_USER_CREATED` - Admin user created via script

## Database Schema Updates Required

### User Model Migration
```sql
-- Add password field to existing User table
ALTER TABLE "User" ADD COLUMN "password" TEXT;

-- Create index for password lookup (performance)
CREATE INDEX "User_password_idx" ON "User"("password") WHERE "password" IS NOT NULL;
```

### Activity Log Enhancements
```sql
-- No schema changes required, using existing ActivityType enum
-- New enum values added to ActivityType enum:
-- LOGIN_FAILED, PASSWORD_RESET_REQUESTED, PASSWORD_RESET_COMPLETED, ADMIN_USER_CREATED
```

## Validation Rules from Requirements

### Registration Validation
1. **Email Uniqueness**: Email must not already exist in database
2. **Password Complexity**: 
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter  
   - At least one number
   - At least one special character
3. **Role Assignment**: Default to USER role unless creating admin via script
4. **Activity Logging**: Log all registration events with user metadata

### Password Verification Rules
1. **Hash Comparison**: Verify bcrypt hash matches stored password
2. **Salt Rounds**: Use 12 rounds for bcrypt hashing
3. **Error Handling**: Generic error messages to prevent enumeration
4. **Rate Limiting**: Monitor failed attempts (implementation level)

### Database Transaction Rules
1. **Registration Transaction**: 
   - Create user record with hashed password
   - Log registration activity
   - Rollback on any failure
2. **Admin Creation**:
   - Wipe existing users (script only)
   - Create single admin user
   - Log admin user creation

## State Transitions

### User Registration Flow
```
Unauthenticated → Registration Attempt → Validating → 
[Success] → User Created → Logged In
[Failure] → Validation Error → Back to Registration
```

### Password Verification Flow
```
Login Attempt → Credentials Submitted → Database Lookup →
[Match] → Session Created → Authenticated User
[No Match] → Generic Error → Failed Attempt Logged
```

### Admin Creation Flow
```
Script Executed → Database Wiped → Admin User Created → 
Admin User Logged In
```

## Data Integrity Constraints

### Referential Integrity
- User.id referenced by all related entities
- User.email must be unique across all users
- User.role must be valid UserRole enum value

### Security Constraints
- Password field must be hashed before database storage
- Plaintext passwords never stored or logged
- OAuth users have null password field
- Admin users created only via authorized script

### Performance Constraints
- Email field indexed for login lookups
- Password field indexed for auth operations
- ActivityLog timestamp indexed for audit queries
- User role field indexed for permission checks

## Migration Strategy

### Phase 1: Schema Migration
1. Add password field to User table (nullable)
2. Add new ActivityType enum values
3. Create necessary indexes

### Phase 2: Data Migration (if needed)
1. No existing data migration required
2. Existing OAuth users maintain null password

### Phase 3: Rollback Strategy
1. Remove password field if needed
2. Remove new ActivityType values if needed
3. Drop added indexes if needed

## Backward Compatibility

### Existing OAuth Users
- Password field remains null
- OAuth authentication unchanged
- No impact on existing functionality

### Existing Database Structure
- All existing fields preserved
- All existing relationships maintained
- No breaking changes to existing queries

### API Compatibility
- Existing authentication endpoints unchanged
- New registration endpoint added
- Password verification integrated into existing flow