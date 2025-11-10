import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/utils/password'
import { logUserRegistration, logUserLogin, logLoginFailed } from '@/lib/activity-logger'
import { UserRole } from '@/types'

class DatabaseError extends Error {
  constructor(message: string, originalError?: any) {
    super(message)
    this.name = 'DatabaseError'
    
    if (originalError) {
      this.message += `: ${originalError.message || originalError}`
    }
  }
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role?: UserRole
}

export interface LoginData {
  email: string
  password: string
}

export interface UserData {
  id: string
  email: string
  name: string | null
  role: UserRole
  emailVerified: Date | null
  createdAt?: Date
}

export interface AuthServiceResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Authentication service for handling user registration, login, and management
 */
export class AuthService {
  /**
   * Create a new user with hashed password
   */
  static async createUser(userData: CreateUserData): Promise<AuthServiceResult<UserData>> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      })

      if (existingUser) {
        return {
          success: false,
          error: 'Người dùng với email này đã tồn tại'
        }
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password)

      // Create user in transaction
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role || UserRole.USER,
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            emailVerified: true,
            createdAt: true,
          }
        })

        // Log the registration activity
        await logUserRegistration(user.id, {
          email: user.email,
          name: user.name || undefined,
          role: user.role,
        })

        return user
      })

      return {
        success: true,
        data: result as UserData,
      }
    } catch (error) {
      console.error('Tạo người dùng thất bại:', error)
      
      if (error instanceof Error) {
        // Handle specific database errors
        if (error.message.includes('Unique constraint')) {
          return {
            success: false,
            error: 'Người dùng với email này đã tồn tại'
          }
        }
      }
      
      throw new DatabaseError('Không thể tạo người dùng', error)
    }
  }

  /**
   * Verify user credentials and return user data
   */
  static async login(loginData: LoginData): Promise<AuthServiceResult<UserData>> {
    try {
      // Find user by email (include password for verification)
      const user = await prisma.user.findUnique({
        where: { email: loginData.email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          role: true,
          emailVerified: true,
        }
      })

      if (!user) {
        // Log failed login attempt (generic message for security)
        await logLoginFailed(loginData.email, 'user_not_found')
        return {
          success: false,
          error: 'Email hoặc mật khẩu không hợp lệ'
        }
      }

      // Check if user has a password (OAuth users won't have passwords)
      if (!user.password) {
        await logLoginFailed(loginData.email, 'oauth_user_no_password')
        return {
          success: false,
          error: 'Email hoặc mật khẩu không hợp lệ'
        }
      }

      // Verify password
      const isValidPassword = await verifyPassword(loginData.password, user.password)
      
      if (!isValidPassword) {
        await logLoginFailed(loginData.email, 'invalid_password')
        return {
          success: false,
          error: 'Email hoặc mật khẩu không hợp lệ'
        }
      }

      // Log successful login
      await logUserLogin(user.id, {
        email: user.email,
        method: 'password',
      })

      // Return user data without password
      const { password, ...userData } = user
      return {
        success: true,
        data: userData as UserData,
      }
    } catch (error) {
      console.error('Đăng nhập thất bại:', error)
      await logLoginFailed(loginData.email, 'system_error')
      
      throw new DatabaseError('Đăng nhập thất bại', error)
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(userId: string, newPassword: string): Promise<AuthServiceResult<void>> {
    try {
      // Hash new password
      const hashedPassword = await hashPassword(newPassword)

      // Update password in transaction
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { password: hashedPassword }
        })
      })

      return {
        success: true,
      }
    } catch (error) {
      console.error('Cập nhật mật khẩu thất bại:', error)
      throw new DatabaseError('Không thể cập nhật mật khẩu', error)
    }
  }

  /**
   * Find user by ID
   */
  static async findUserById(userId: string): Promise<AuthServiceResult<UserData>> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
        }
      })

      if (!user) {
        return {
          success: false,
          error: 'Không tìm thấy người dùng'
        }
      }

      return {
        success: true,
        data: user as UserData,
      }
    } catch (error) {
      console.error('Tra cứu người dùng thất bại:', error)
      throw new DatabaseError('Không thể tìm người dùng', error)
    }
  }

  /**
   * Find user by email
   */
  static async findUserByEmail(email: string): Promise<AuthServiceResult<UserData>> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
        }
      })

      if (!user) {
        return {
          success: false,
          error: 'Không tìm thấy người dùng'
        }
      }

      return {
        success: true,
        data: user as UserData,
      }
    } catch (error) {
      console.error('Tra cứu người dùng thất bại:', error)
      throw new DatabaseError('Không thể tìm người dùng', error)
    }
  }

  /**
   * Check if user is admin
   */
  static async isAdmin(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      })

      return user?.role === UserRole.ADMIN
    } catch (error) {
      console.error('Kiểm tra quyền quản trị thất bại:', error)
      return false
    }
  }

  /**
   * Delete user and all related data
   */
  static async deleteUser(userId: string): Promise<AuthServiceResult<void>> {
    try {
      await prisma.$transaction(async (tx) => {
        // Delete user (cascade will handle related data)
        await tx.user.delete({
          where: { id: userId }
        })
      })

      return {
        success: true,
      }
    } catch (error) {
      console.error('Xóa người dùng thất bại:', error)
      throw new DatabaseError('Không thể xóa người dùng', error)
    }
  }
}