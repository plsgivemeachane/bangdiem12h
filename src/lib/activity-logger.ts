import { prisma } from '@/lib/prisma'
import { ActivityType } from '@/types'

interface LogActivityParams {
  userId: string
  groupId?: string
  action: ActivityType
  description: string
  metadata?: Record<string, any>
}

export async function logActivity({
  userId,
  groupId,
  action,
  description,
  metadata,
}: LogActivityParams) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        groupId: groupId || null,
        action,
        description,
        metadata: metadata ? metadata : undefined,
      },
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
    // Don't throw error to avoid breaking the main flow
  }
}

// Authentication-specific logging functions

/**
 * Log user registration event
 */
export async function logUserRegistration(userId: string, userData: {
  email: string
  name?: string
  role: string
}) {
  return logActivity({
    userId,
    action: ActivityType.USER_REGISTERED,
    description: `User registered with email ${userData.email}`,
    metadata: {
      email: userData.email,
      name: userData.name,
      role: userData.role,
    },
  })
}

/**
 * Log successful user login
 */
export async function logUserLogin(userId: string, loginData: {
  email: string
  method: 'password' | 'oauth'
  provider?: string
}) {
  return logActivity({
    userId,
    action: ActivityType.USER_LOGIN,
    description: `User logged in via ${loginData.method}`,
    metadata: {
      email: loginData.email,
      loginMethod: loginData.method,
      provider: loginData.provider,
    },
  })
}

/**
 * Log failed login attempt
 */
export async function logLoginFailed(email: string, reason: string, ipAddress?: string) {
  return logActivity({
    userId: 'anonymous', // Use a system user ID or handle differently
    action: ActivityType.LOGIN_FAILED,
    description: `Failed login attempt for ${email}`,
    metadata: {
      email,
      reason,
      ipAddress,
      timestamp: new Date().toISOString(),
    },
  })
}

/**
 * Log password reset request
 */
export async function logPasswordResetRequested(userId: string, email: string, ipAddress?: string) {
  return logActivity({
    userId,
    action: ActivityType.PASSWORD_RESET_REQUESTED,
    description: `Password reset requested for ${email}`,
    metadata: {
      email,
      ipAddress,
    },
  })
}

/**
 * Log password reset completion
 */
export async function logPasswordResetCompleted(userId: string, email: string, ipAddress?: string) {
  return logActivity({
    userId,
    action: ActivityType.PASSWORD_RESET_COMPLETED,
    description: `Password reset completed for ${email}`,
    metadata: {
      email,
      ipAddress,
    },
  })
}

/**
 * Log admin user creation
 */
export async function logAdminUserCreated(userId: string, adminData: {
  email: string
  name?: string
  createdBy: string
}) {
  return logActivity({
    userId,
    action: ActivityType.ADMIN_USER_CREATED,
    description: `Admin user created: ${adminData.email}`,
    metadata: {
      email: adminData.email,
      name: adminData.name,
      createdBy: adminData.createdBy,
    },
  })
}