// TypeScript type definitions for authentication API

// Request/Response Types for Registration
export interface RegistrationRequest {
  name?: string;
  email: string;
  password: string;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface User {
  id: string;
  name?: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

// Request/Response Types for Password Reset
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

// Error Response Type
export interface ErrorResponse {
  success: false;
  error:
    | "VALIDATION_ERROR"
    | "USER_EXISTS"
    | "INVALID_CREDENTIALS"
    | "SERVER_ERROR"
    | "NOT_FOUND";
  message: string;
}

// NextAuth User Type Extensions
export interface UserWithPassword {
  id: string;
  name?: string;
  email: string;
  password?: string;
  role: "USER" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
}

// Prisma User Model Extensions
export interface PrismaUserCreateInput {
  name?: string;
  email: string;
  password?: string;
  role?: "USER" | "ADMIN";
}

// Activity Log Types for Authentication Events
export interface AuthActivityLog {
  action:
    | "USER_REGISTERED"
    | "USER_LOGIN"
    | "LOGIN_FAILED"
    | "PASSWORD_RESET_REQUESTED"
    | "PASSWORD_RESET_COMPLETED"
    | "ADMIN_USER_CREATED";
  description: string;
  metadata?: Record<string, any>;
}

// Database Migration Types
export interface DatabaseMigration {
  up: () => Promise<void>;
  down: () => Promise<void>;
}

// API Route Handler Types
export interface ApiRouteHandler {
  register: (request: Request) => Promise<Response>;
  resetPassword: (request: Request) => Promise<Response>;
}

// Authentication Utilities
export interface PasswordUtils {
  hash: (password: string) => Promise<string>;
  verify: (password: string, hash: string) => Promise<boolean>;
  validateStrength: (password: string) => ValidationResult;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Validation Schemas (for Zod)
export const registrationSchema = {
  name: {
    type: "string",
    minLength: 1,
    maxLength: 100,
    optional: true,
  },
  email: {
    type: "string",
    format: "email",
    required: true,
  },
  password: {
    type: "string",
    minLength: 8,
    maxLength: 100,
    required: true,
    pattern:
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]",
  },
} as const;

export const passwordResetSchema = {
  email: {
    type: "string",
    format: "email",
    required: true,
  },
} as const;

// Configuration Types
export interface AuthConfig {
  bcryptRounds: number;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordResetExpiration: number;
}

export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  bcryptRounds: 12,
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  maxLoginAttempts: 5,
  passwordResetExpiration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
} as const;

// Environment Variables
export interface EnvVars {
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  DATABASE_URL: string;
}

// Database Index Requirements
export interface DatabaseIndexes {
  users: {
    email: "unique";
    password: "index WHERE password IS NOT NULL";
  };
  activityLogs: {
    timestamp: "index";
    action: "index";
    userId: "index";
  };
}
