import { z } from 'zod'
import { PASSWORD_CONFIG } from '@/lib/utils/password'

// Base email validation schema
export const emailSchema = z
  .string()
  .min(1, 'Email là bắt buộc')
  .email('Định dạng email không hợp lệ')
  .max(254, 'Email quá dài')
  .transform((email) => email.toLowerCase().trim())

// Password validation schema with strength requirements
export const passwordSchema = z
  .string()
  .min(PASSWORD_CONFIG.minLength, `Mật khẩu phải có ít nhất ${PASSWORD_CONFIG.minLength} ký tự`)
  .max(PASSWORD_CONFIG.maxLength, `Mật khẩu không được vượt quá ${PASSWORD_CONFIG.maxLength} ký tự`)
  .refine((password) => {
    const uppercaseCount = (password.match(/[A-Z]/g) || []).length
    return uppercaseCount >= PASSWORD_CONFIG.minUppercase
  }, `Mật khẩu phải có ít nhất ${PASSWORD_CONFIG.minUppercase} chữ hoa`)
  .refine((password) => {
    const lowercaseCount = (password.match(/[a-z]/g) || []).length
    return lowercaseCount >= PASSWORD_CONFIG.minLowercase
  }, `Mật khẩu phải có ít nhất ${PASSWORD_CONFIG.minLowercase} chữ thường`)
  .refine((password) => {
    const numberCount = (password.match(/\d/g) || []).length
    return numberCount >= PASSWORD_CONFIG.minNumbers
  }, `Mật khẩu phải có ít nhất ${PASSWORD_CONFIG.minNumbers} chữ số`)
  .refine((password) => {
    const specialCount = (password.match(/[^A-Za-z0-9]/g) || []).length
    return specialCount >= PASSWORD_CONFIG.minSpecial
  }, `Mật khẩu phải có ít nhất ${PASSWORD_CONFIG.minSpecial} ký tự đặc biệt`)

// Registration form validation schema
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Tên là bắt buộc')
      .max(100, 'Tên quá dài')
      .trim(),
    email: emailSchema,
    password: passwordSchema,
  })
  .refine((data) => {
    // Check for common passwords
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ]
    return !commonPasswords.includes(data.password.toLowerCase())
  }, {
    message: 'Mật khẩu quá phổ biến. Vui lòng chọn mật khẩu an toàn hơn.',
    path: ['password'],
  })

// Login form validation schema
export const loginSchema = z
  .object({
    email: emailSchema,
    password: z
      .string()
      .min(1, 'Mật khẩu là bắt buộc'),
  })

// Password reset request schema
export const resetPasswordRequestSchema = z
  .object({
    email: emailSchema,
  })

// Password reset confirmation schema
export const resetPasswordConfirmSchema = z
  .object({
    token: z
      .string()
      .min(1, 'Mã đặt lại là bắt buộc')
      .max(500, 'Mã đặt lại không hợp lệ'),
    password: passwordSchema,
  })

// Change password schema (for logged-in users)
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Mật khẩu hiện tại là bắt buộc'),
    newPassword: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, 'Xác nhận mật khẩu là bắt buộc'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
    path: ['newPassword'],
  })

// User profile update schema (for authenticated users)
export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Tên là bắt buộc')
      .max(100, 'Tên quá dài')
      .trim()
      .optional(),
    email: emailSchema.optional(),
  })

// Admin user creation schema
export const createAdminUserSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Tên là bắt buộc')
      .max(100, 'Tên quá dài')
      .trim(),
    email: emailSchema,
    password: passwordSchema,
  })

// Validation result types
export type RegisterFormData = z.infer<typeof registerSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type ResetPasswordRequestData = z.infer<typeof resetPasswordRequestSchema>
export type ResetPasswordConfirmData = z.infer<typeof resetPasswordConfirmSchema>
export type ChangePasswordData = z.infer<typeof changePasswordSchema>
export type UpdateProfileData = z.infer<typeof updateProfileSchema>
export type CreateAdminUserData = z.infer<typeof createAdminUserSchema>

// Validation utility functions
export function validateFormData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: true
  data: T
} | {
  success: false
  errors: Array<{ field: string; message: string }>
} {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return {
      success: true,
      data: result.data,
    }
  }
  
  return {
    success: false,
    errors: result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  }
}

// Password strength checker
export function getPasswordStrength(password: string): {
  score: number // 0-5
  label: 'Rất yếu' | 'Yếu' | 'Trung bình' | 'Tốt' | 'Mạnh' | 'Rất mạnh'
  feedback: string[]
} {
  let score = 0
  const feedback: string[] = []
  
  // Length scoring
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  
  // Character type scoring
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  
  // Additional checks
  if (password.length < PASSWORD_CONFIG.minLength) {
    feedback.push(`Mật khẩu phải có ít nhất ${PASSWORD_CONFIG.minLength} ký tự`)
  }
  
  if (!/[A-Z]/.test(password)) {
    feedback.push('Thêm chữ hoa')
  }
  
  if (!/[a-z]/.test(password)) {
    feedback.push('Thêm chữ thường')
  }
  
  if (!/\d/.test(password)) {
    feedback.push('Thêm chữ số')
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    feedback.push('Thêm ký tự đặc biệt')
  }
  
  // Determine label
  let label: 'Rất yếu' | 'Yếu' | 'Trung bình' | 'Tốt' | 'Mạnh' | 'Rất mạnh'
  if (score <= 1) label = 'Rất yếu'
  else if (score <= 2) label = 'Yếu'
  else if (score <= 3) label = 'Trung bình'
  else if (score <= 4) label = 'Tốt'
  else if (score <= 5) label = 'Mạnh'
  else label = 'Rất mạnh'
  
  return {
    score,
    label,
    feedback,
  }
}