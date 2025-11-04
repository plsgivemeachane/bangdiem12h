/**
 * Custom error types for the application
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = this.constructor.name
    
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 400, true)
    this.name = 'ValidationError'
    
    if (field) {
      this.message = `${field}: ${message}`
    }
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Xác thực thất bại') {
    super(message, 401, true)
    this.name = 'AuthError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Không đủ quyền') {
    super(message, 403, true)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Không tìm thấy tài nguyên') {
    super(message, 404, true)
    this.name = 'NotFoundError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Thao tác cơ sở dữ liệu thất bại', originalError?: any) {
    super(message, 500, true)
    this.name = 'DatabaseError'
    
    if (originalError) {
      this.message += `: ${originalError.message || originalError}`
    }
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Quá nhiều yêu cầu') {
    super(message, 429, true)
    this.name = 'RateLimitError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Xung đột tài nguyên') {
    super(message, 409, true)
    this.name = 'ConflictError'
  }
}

// Error handling utilities
export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }
  
  if (error instanceof Error) {
    return new AppError(error.message, 500, false)
  }
  
  return new AppError('Đã xảy ra lỗi không xác định', 500, false)
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError
}

export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError
}