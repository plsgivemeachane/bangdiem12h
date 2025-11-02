import { z } from 'zod'
import { PASSWORD_CONFIG } from '@/lib/utils/password'

// Base email validation schema
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .max(254, 'Email is too long')
  .transform((email) => email.toLowerCase().trim())

// Password validation schema with strength requirements
export const passwordSchema = z
  .string()
  .min(PASSWORD_CONFIG.minLength, `Password must be at least ${PASSWORD_CONFIG.minLength} characters long`)
  .max(PASSWORD_CONFIG.maxLength, `Password must not exceed ${PASSWORD_CONFIG.maxLength} characters`)
  .refine((password) => {
    const uppercaseCount = (password.match(/[A-Z]/g) || []).length
    return uppercaseCount >= PASSWORD_CONFIG.minUppercase
  }, `Password must contain at least ${PASSWORD_CONFIG.minUppercase} uppercase letter(s)`)
  .refine((password) => {
    const lowercaseCount = (password.match(/[a-z]/g) || []).length
    return lowercaseCount >= PASSWORD_CONFIG.minLowercase
  }, `Password must contain at least ${PASSWORD_CONFIG.minLowercase} lowercase letter(s)`)
  .refine((password) => {
    const numberCount = (password.match(/\d/g) || []).length
    return numberCount >= PASSWORD_CONFIG.minNumbers
  }, `Password must contain at least ${PASSWORD_CONFIG.minNumbers} number(s)`)
  .refine((password) => {
    const specialCount = (password.match(/[^A-Za-z0-9]/g) || []).length
    return specialCount >= PASSWORD_CONFIG.minSpecial
  }, `Password must contain at least ${PASSWORD_CONFIG.minSpecial} special character(s)`)

// Registration form validation schema
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name is too long')
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
    message: 'Password is too common. Please choose a more secure password.',
    path: ['password'],
  })

// Login form validation schema
export const loginSchema = z
  .object({
    email: emailSchema,
    password: z
      .string()
      .min(1, 'Password is required'),
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
      .min(1, 'Reset token is required')
      .max(500, 'Reset token is invalid'),
    password: passwordSchema,
  })

// Change password schema (for logged-in users)
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })

// User profile update schema (for authenticated users)
export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name is too long')
      .trim()
      .optional(),
    email: emailSchema.optional(),
  })

// Admin user creation schema
export const createAdminUserSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name is too long')
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
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong'
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
    feedback.push(`Password must be at least ${PASSWORD_CONFIG.minLength} characters`)
  }
  
  if (!/[A-Z]/.test(password)) {
    feedback.push('Add uppercase letters')
  }
  
  if (!/[a-z]/.test(password)) {
    feedback.push('Add lowercase letters')
  }
  
  if (!/\d/.test(password)) {
    feedback.push('Add numbers')
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    feedback.push('Add special characters')
  }
  
  // Determine label
  let label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong'
  if (score <= 1) label = 'Very Weak'
  else if (score <= 2) label = 'Weak'
  else if (score <= 3) label = 'Fair'
  else if (score <= 4) label = 'Good'
  else if (score <= 5) label = 'Strong'
  else label = 'Very Strong'
  
  return {
    score,
    label,
    feedback,
  }
}