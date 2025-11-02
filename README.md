# Group Scoring System

A comprehensive group scoring and tracking system built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## Features

### Core Functionality (Based on Specification)
- **Group Creation and Management** - Users can create and manage groups with proper access controls
- **Scoring Rules Configuration** - Admins can define custom scoring rules with point values and criteria
- **Score Recording and Tracking** - Members can record scores and track their progress
- **Analytics Dashboard** - Weekly, monthly, and yearly analytics with trend analysis
- **Activity Logging** - Complete audit trail for transparency

### User Stories Implemented
1. ✅ **P1: Group Creation and Management** - Admins can create groups, invite members, and manage membership
2. ✅ **P2: Scoring Rules Configuration** - Custom scoring rules with flexible criteria
3. ✅ **P3: Score Recording and Tracking** - Score history with filtering capabilities

### Technical Features
- Next.js 14 with App Router
- TypeScript for type safety
- Prisma ORM with PostgreSQL
- NextAuth.js for authentication
- Email notifications for invitations
- Responsive design with Tailwind CSS
- Real-time analytics with trend data
- Comprehensive activity logging
- Role-based access control

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js (Google OAuth + Email)
- **Styling**: Tailwind CSS
- **Email**: Nodemailer
- **Charts**: Recharts
- **UI Components**: Radix UI primitives

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # NextAuth endpoints
│   │   ├── groups/        # Group management
│   │   ├── scoring-rules/ # Scoring rules
│   │   ├── score-records/ # Score recording
│   │   └── analytics/     # Analytics
│   ├── auth/              # Authentication pages
│   └── globals.css        # Global styles
├── components/            # React components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   ├── email.ts          # Email service
│   └── activity-logger.ts # Activity logging
└── types/                # TypeScript types
```

## Database Schema

### Core Models
- **User** - User accounts with roles (USER, ADMIN)
- **Group** - User groups with membership management
- **GroupMember** - Group membership with roles (MEMBER, ADMIN, OWNER)
- **ScoringRule** - Flexible scoring rules with JSON criteria
- **ScoreRecord** - Individual score records with timestamps
- **ActivityLog** - Complete audit trail

### Key Features
- PostgreSQL with proper indexing
- Foreign key relationships
- JSON fields for flexible criteria
- Comprehensive timestamps
- Activity logging for all major actions

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Google OAuth credentials (optional)
- Email service credentials

### 1. Environment Setup
```bash
cp .env.example .env
```

Configure your `.env` file:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/group_scoring_system"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
GOOGLE_CLIENT_ID="your-google-client-id"  # Optional
GOOGLE_CLIENT_SECRET="your-google-client-secret"  # Optional

# Email Configuration
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourapp.com"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Optional: Open Prisma Studio
npm run db:studio
```

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## API Endpoints

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

### Groups
- `GET /api/groups` - List user's groups
- `POST /api/groups` - Create new group
- `GET /api/groups/[id]` - Get group details
- `PATCH /api/groups/[id]` - Update group
- `DELETE /api/groups/[id]` - Delete group

### Scoring Rules
- `POST /api/scoring-rules` - Create scoring rule

### Score Records
- `GET /api/score-records` - Get score records with filters
- `POST /api/score-records` - Record a new score

### Analytics
- `GET /api/analytics` - Get analytics data

## Usage Guide

### For Administrators
1. **Create Group**: Use the dashboard to create a new group
2. **Invite Members**: Send email invitations to group members
3. **Define Rules**: Create scoring rules with custom criteria and point values
4. **Monitor Activity**: View activity logs for transparency

### For Members
1. **Join Groups**: Accept invitations via email
2. **Record Scores**: Use scoring rules to record achievements
3. **Track Progress**: View personal score history and analytics
4. **View Analytics**: See trends and performance over time

## Key Features by Requirement

### FR-001: Group Management ✅
- Users can create and manage groups
- Role-based access control (OWNER, ADMIN, MEMBER)
- Group membership tracking

### FR-002: Scoring Rules ✅
- Custom scoring rules with flexible JSON criteria
- Point values (positive/negative)
- Rule activation/deactivation

### FR-003: Score Recording ✅
- Timestamp-based score records
- Associated criteria and notes
- User and group associations

### FR-004: Analytics ✅
- Weekly, monthly, yearly analytics
- Trend analysis with comparisons
- Rule breakdown and performance metrics

### FR-005: Activity Logging ✅
- Comprehensive audit trail
- All major actions logged
- Metadata tracking for context

## Testing the System

### Basic Flow
1. Register with email or Google OAuth
2. Create a new group
3. Define scoring rules
4. Record some scores
5. View analytics and progress

### Edge Cases Handled
- Duplicate group names
- Invalid scoring rule criteria
- Permission validation
- Date range filtering
- Score record pagination

## Deployment

### Database
- Set up PostgreSQL database
- Run migrations: `npm run db:migrate`

### Environment Variables
- Configure production environment variables
- Set secure `NEXTAUTH_SECRET`
- Configure production domain in `NEXTAUTH_URL`

### Build and Deploy
```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the specification document
2. Review API documentation
3. Open an issue with detailed reproduction steps

---

**Author**: Kilo Code  
**Version**: 1.0.0  
**Last Updated**: 2025-10-31