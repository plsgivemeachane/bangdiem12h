# Quickstart: Password Verification and Registration System

## Overview

This implementation adds password-based authentication to your existing Next.js group scoring system while maintaining full backward compatibility with OAuth users.

## What You Get

✅ **Secure Password Registration** - New users can register with email/password  
✅ **Password Verification** - Secure login with bcrypt hashing  
✅ **Role-Based Access** - New users default to USER role  
✅ **Admin Setup Script** - Create and manage admin users  
✅ **Database Management** - Migration scripts and admin tools  
✅ **Security Logging** - All auth events tracked  

## Prerequisites

- Existing Next.js 14 project with authentication
- PostgreSQL database (Supabase)
- Node.js 16+
- All dependencies already installed

## Quick Setup

### 1. Apply Database Migration

```bash
# Generate Prisma client with new password field
npm run db:generate

# Apply database migration
npm run db:push
```

### 2. Create Admin User (Optional)

```bash
# Wipe database and create default admin
npm run seed:admin
```

### 3. Test Registration

```bash
# Start development server
npm run dev

# Test registration endpoint
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com", 
    "password": "SecurePass123!"
  }'
```

## API Usage

### Register New User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

# Response (201)
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "clp123abc",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2025-10-31T09:29:16.000Z"
  }
}
```

### Reset Password
```bash
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "john@example.com"
}

# Response (200)
{
  "success": true,
  "message": "Password reset email sent"
}
```

## Integration Points

### Existing Authentication Flow
- New password verification integrates with NextAuth.js
- OAuth users continue to work unchanged
- Session management maintains existing behavior

### Database Changes
- Added optional `password` field to User model
- Existing users retain null password (OAuth users)
- New users have hashed passwords stored securely

### Activity Logging
- All authentication events logged automatically
- New log types: USER_REGISTERED, USER_LOGIN, LOGIN_FAILED
- Extends existing activity logging system

## File Changes Made

### New Files
```
src/lib/utils/password.ts           # Password hashing utilities
src/app/api/auth/register/route.ts  # Registration endpoint
prisma/admin-setup.js               # Admin user creation script
prisma/migrate-password.js          # Password field migration
specs/main/contracts/              # API specifications
```

### Modified Files
```
prisma/schema.prisma               # Added password field to User
src/lib/auth.ts                    # Added password verification
src/types/index.ts                 # Extended user types
package.json                       # Added migration scripts
```

## Security Features

### Password Requirements
- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter  
- Must contain number
- Must contain special character

### Security Measures
- bcryptjs hashing with 12 salt rounds
- No plaintext password storage
- Generic error messages (prevents enumeration)
- Activity logging for security events
- Backward compatibility with OAuth

## Configuration

### Environment Variables
No additional environment variables required. Uses existing:
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` 
- `DATABASE_URL`

### Password Settings
```typescript
// In src/lib/utils/password.ts
export const PASSWORD_CONFIG = {
  rounds: 12,              // bcrypt rounds
  minLength: 8,           // minimum password length
  maxLength: 100,         // maximum password length
}
```

## Testing

### Manual Testing
1. Register new user via API
2. Test password verification during login
3. Verify OAuth users still work
4. Test password validation
5. Check activity logs

### Automated Testing
```bash
# Run existing test suite
npm test

# Add new auth tests
npm run test:auth
```

## Troubleshooting

### Common Issues

**Migration Failed**
```bash
# Reset database and re-migrate
npm run db:push --force-reset
```

**Password Verification Not Working**
- Check bcryptjs is installed: `npm install bcryptjs@2.4.3`
- Verify password field in database
- Check authentication middleware

**Admin User Creation**
```bash
# Force recreate admin user
node prisma/admin-setup.js --force
```

### Debug Mode
```bash
# Enable detailed logging
DEBUG=auth:* npm run dev
```

## Production Deployment

### Pre-deployment Checklist
- [ ] Database migration applied successfully
- [ ] Admin user created and tested
- [ ] Password validation working
- [ ] OAuth integration tested
- [ ] Environment variables configured

### Security Considerations
- Ensure `NEXTAUTH_SECRET` is set to strong value
- Configure proper CORS settings
- Set up rate limiting for auth endpoints
- Monitor failed login attempts
- Regular security audits

### Performance Monitoring
- Monitor registration endpoint performance
- Track password hashing CPU usage
- Monitor database query performance
- Set up alerts for failed authentication

## Support

### Documentation
- [Feature Specification](specs/main/spec.md)
- [Data Model](specs/main/data-model.md)
- [API Contracts](specs/main/contracts/openapi.yaml)
- [Research Notes](specs/main/research.md)

### Architecture Decision Records
All technical decisions and rationale are documented in the research.md file.

---

**Next Steps**: Review the implementation plan in `specs/main/plan.md` for detailed technical specifications and proceed with coding the password utilities, registration endpoint, and admin scripts.