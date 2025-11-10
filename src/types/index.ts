// Database entity types
export interface User {
  id: string
  name: string | null
  email: string
  password?: string | null // Hashed password, nullable for OAuth users
  emailVerified?: Date | null
  image?: string | null
  role: UserRole
  createdAt?: Date
  updatedAt?: Date
}

export interface Group {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdById: string
  createdBy?: User
  members?: GroupMember[]
  groupRules?: GroupRule[]
  scoringRules?: ScoringRule[] // For backward compatibility with frontend
  scoreRecords?: ScoreRecord[]
  activityLogs?: ActivityLog[]
  _count?: {
    groupRules: number
    scoreRecords: number
  }
}

export interface GroupMember {
  id: string
  userId: string
  groupId: string
  role: GroupRole
  joinedAt: Date
  user?: User
  group?: Group
}

export interface GroupRule {
  id: string
  groupId: string
  ruleId: string
  isActive: boolean
  createdAt: Date
  group?: Group
  rule?: ScoringRule
}

export interface ScoringRule {
  id: string
  name: string
  description: string | null
  criteria: any // JSON type for flexible criteria
  points: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  groupRules?: GroupRule[]
  scoreRecords?: ScoreRecord[]
}

export interface ScoreRecord {
  id: string
  userId: string
  groupId: string
  ruleId: string
  points: number
  criteria: any // JSON type
  notes: string | null
  recordedAt: Date
  user?: User
  group?: Group
  rule?: ScoringRule
}

export interface ActivityLog {
  id: string
  userId: string
  groupId: string | null
  action: ActivityType
  description: string
  metadata: Record<string, any> | null
  timestamp: Date
  user?: User
  group?: Group | null
}

// Enum types
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum GroupRole {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER'
}

export enum ActivityType {
  USER_REGISTERED = 'USER_REGISTERED',
  USER_LOGIN = 'USER_LOGIN',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED = 'PASSWORD_RESET_COMPLETED',
  ADMIN_USER_CREATED = 'ADMIN_USER_CREATED',
  ADMIN_USER_ROLE_UPDATED = 'ADMIN_USER_ROLE_UPDATED',
  ADMIN_USER_DELETED = 'ADMIN_USER_DELETED',
  ADMIN_PASSWORD_RESET_BY_ADMIN = 'ADMIN_PASSWORD_RESET_BY_ADMIN',
  GROUP_CREATED = 'GROUP_CREATED',
  GROUP_UPDATED = 'GROUP_UPDATED',
  GROUP_DELETED = 'GROUP_DELETED',
  MEMBER_INVITED = 'MEMBER_INVITED',
  MEMBER_JOINED = 'MEMBER_JOINED',
  MEMBER_ADDED = 'MEMBER_ADDED',
  MEMBER_REMOVED = 'MEMBER_REMOVED',
  MEMBER_ROLE_UPDATED = 'MEMBER_ROLE_UPDATED',
  OWNERSHIP_TRANSFERRED = 'OWNERSHIP_TRANSFERRED',
  SCORING_RULE_CREATED = 'SCORING_RULE_CREATED',
  SCORING_RULE_UPDATED = 'SCORING_RULE_UPDATED',
  SCORING_RULE_TOGGLED = 'SCORING_RULE_TOGGLED',
  SCORING_RULE_DELETED = 'SCORING_RULE_DELETED',
  RULE_ADDED_TO_GROUP = 'RULE_ADDED_TO_GROUP',
  RULE_REMOVED_FROM_GROUP = 'RULE_REMOVED_FROM_GROUP',
  SCORE_RECORDED = 'SCORE_RECORDED',
  SCORE_UPDATED = 'SCORE_UPDATED',
  SCORE_DELETED = 'SCORE_DELETED'
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

// Form types
export interface CreateGroupForm {
  name: string
  description?: string
}

export interface UpdateGroupForm {
  name?: string
  description?: string
  isActive?: boolean
}

export interface CreateScoringRuleForm {
  name: string
  description?: string
  criteria: Record<string, any>
  points: number
}

export interface UpdateScoringRuleForm {
  name?: string
  description?: string
  criteria?: Record<string, any>
  points?: number
  isActive?: boolean
}

export interface CreateScoreRecordForm {
  groupId: string
  ruleId: string
  criteria?: Record<string, any>
  notes?: string
}

export interface AddMemberForm {
  email: string
  role: GroupRole
}

export interface UpdateMemberForm {
  role: GroupRole
}

// Authentication form types
export interface RegisterForm {
  name: string
  email: string
  password: string
}

export interface LoginForm {
  email: string
  password: string
}

export interface ResetPasswordForm {
  email: string
}

export interface ChangePasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Component props types
export interface GroupCardProps {
  group: Group
  onEdit?: (group: Group) => void
  onDelete?: (group: Group) => void
  onManageMembers?: (group: Group) => void
  onViewDetails?: (group: Group) => void
}

export interface GroupListProps {
  groups: Group[]
  isLoading?: boolean
  onGroupSelect?: (group: Group) => void
  onEdit?: (group: Group) => void
  onDelete?: (group: Group) => void
  onManageMembers?: (group: Group) => void
  onViewDetails?: (group: Group) => void
  onCreateGroup?: () => void
  showActions?: boolean
}

export interface ScoringRuleListProps {
  rules: ScoringRule[]
  groupId: string
  isLoading?: boolean
  onCreate?: () => void
  onEdit?: (rule: ScoringRule) => void
  onDelete?: (rule: ScoringRule) => void
  onToggleActive?: (rule: ScoringRule) => void
  showActions?: boolean
}

export interface ScoreRecordListProps {
  records: ScoreRecord[]
  isLoading?: boolean
  onRecordSelect?: (record: ScoreRecord) => void
  showActions?: boolean
}

// Analytics types
export interface ScoreAnalytics {
  period: 'week' | 'month' | 'year'
  dateRange: {
    start: string
    end: string
  }
  summary: {
    totalPoints: number
    recordCount: number
    averagePoints: number
    previousPeriod: {
      totalPoints: number
      recordCount: number
      pointsChange: number
      pointsChangePercent: number
    } | null
  }
  trendData: Array<{
    date: string
    points: number
  }>
  ruleBreakdown: Array<{
    ruleId: string
    name: string
    totalPoints: number
    count: number
    averagePoints: number
  }>
}

// Error types
export interface ApiError {
  error: string
  details?: any
  status?: number
}

export interface ValidationError {
  field: string
  message: string
}

// Utility types
export type SortOrder = 'asc' | 'desc'
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'
export type DialogState = 'open' | 'closed'

// Filter and search types
export interface GroupFilters {
  search?: string
  isActive?: boolean
  createdBy?: string
}

export interface ScoreRecordFilters {
  groupId?: string
  userId?: string
  startDate?: string
  endDate?: string
  ruleId?: string
}

export interface ScoringRuleFilters {
  groupId?: string
  isActive?: boolean
  search?: string
}

// Dashboard types
export interface DashboardStats {
  totalGroups: number
  totalScoreRecords: number
  totalPoints: number
  recentActivity: ActivityLog[]
}

export interface UserPerformance {
  userId: string
  userName: string
  userEmail: string
  totalRecords: number
  totalPoints: number
  averagePoints: number
}

export interface GroupStats {
  group: Group
  totalMembers: number
  activeRules: number
  totalScoreRecords: number
  totalPoints: number
  // New weekly metrics
  weeklyRecords: number
  weeklyScore: number
  // Performance rankings
  topPerformers: UserPerformance[]
  bottomPerformers: UserPerformance[]
}