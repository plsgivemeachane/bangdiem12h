import { prisma } from "@/lib/prisma";
import { ActivityType } from "@/types";

interface LogActivityParams {
  userId?: string | null;
  groupId?: string;
  action: ActivityType;
  description: string;
  metadata?: Record<string, any>;
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
        ...(userId && { userId }),
        ...(groupId && { groupId }),
        action,
        description,
        ...(metadata && { metadata }),
      },
    });
  } catch (error) {
    console.error("Ghi nhật ký hoạt động thất bại:", error);
    // Don't throw error to avoid breaking the main flow
  }
}

// Authentication-specific logging functions

/**
 * Log user registration event
 */
export async function logUserRegistration(
  userId: string,
  userData: {
    email: string;
    name?: string;
    role: string;
  },
) {
  return logActivity({
    userId,
    action: ActivityType.USER_REGISTERED,
    description: `Người dùng đăng ký với email ${userData.email}`,
    metadata: {
      email: userData.email,
      name: userData.name,
      role: userData.role,
    },
  });
}

/**
 * Log successful user login
 */
export async function logUserLogin(
  userId: string,
  loginData: {
    email: string;
    method: "password" | "oauth";
    provider?: string;
  },
) {
  const methodLabel = loginData.method === "password" ? "mật khẩu" : "OAuth";
  return logActivity({
    userId,
    action: ActivityType.USER_LOGIN,
    description: `Người dùng đăng nhập qua ${methodLabel}`,
    metadata: {
      email: loginData.email,
      loginMethod: loginData.method,
      provider: loginData.provider,
    },
  });
}

/**
 * Log failed login attempt
 */
export async function logLoginFailed(
  email: string,
  reason: string,
  ipAddress?: string,
) {
  return logActivity({
    userId: null, // No valid user for failed login attempts
    action: ActivityType.LOGIN_FAILED,
    description: `Đăng nhập thất bại cho ${email}`,
    metadata: {
      email,
      reason,
      ipAddress,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Log password reset request
 */
export async function logPasswordResetRequested(
  userId: string,
  email: string,
  ipAddress?: string,
) {
  return logActivity({
    userId,
    action: ActivityType.PASSWORD_RESET_REQUESTED,
    description: `Yêu cầu đặt lại mật khẩu cho ${email}`,
    metadata: {
      email,
      ipAddress,
    },
  });
}

/**
 * Log password reset completion
 */
export async function logPasswordResetCompleted(
  userId: string,
  email: string,
  ipAddress?: string,
) {
  return logActivity({
    userId,
    action: ActivityType.PASSWORD_RESET_COMPLETED,
    description: `Hoàn tất đặt lại mật khẩu cho ${email}`,
    metadata: {
      email,
      ipAddress,
    },
  });
}

/**
 * Log admin user creation
 */
export async function logAdminUserCreated(
  userId: string,
  adminData: {
    email: string;
    name?: string;
    createdBy: string;
  },
) {
  return logActivity({
    userId,
    action: ActivityType.ADMIN_USER_CREATED,
    description: `Tài khoản quản trị được tạo: ${adminData.email}`,
    metadata: {
      email: adminData.email,
      name: adminData.name,
      createdBy: adminData.createdBy,
    },
  });
}
