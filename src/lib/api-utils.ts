import { NextRequest, NextResponse } from "next/server";

export interface ApiError {
  error: string;
  details?: any;
}

export function createErrorResponse(
  error: string,
  status: number = 500,
  details?: any,
): NextResponse {
  return NextResponse.json(
    {
      error,
      ...(details && { details }),
    } as ApiError,
    { status },
  );
}

export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
): NextResponse {
  return NextResponse.json(data, { status });
}

export async function parseJsonRequest<T>(request: NextRequest): Promise<T> {
  try {
    return await request.json();
  } catch (error) {
    throw new Error("JSON trong nội dung yêu cầu không hợp lệ");
  }
}

export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[],
): void {
  const missing = requiredFields.filter(
    (field) => !data[field] && data[field] !== 0,
  );

  if (missing.length > 0) {
    throw new Error(`Thiếu các trường bắt buộc: ${missing.join(", ")}`);
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateString(
  value: any,
  minLength: number = 0,
  maxLength: number = 1000,
): boolean {
  if (typeof value !== "string") return false;
  return value.length >= minLength && value.length <= maxLength;
}

export function validateNumber(
  value: any,
  min?: number,
  max?: number,
): boolean {
  const num = Number(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
}

export function sanitizeString(str: string, maxLength: number = 1000): string {
  return str.trim().slice(0, maxLength);
}

export async function handleApiError(
  error: unknown,
  context: string,
): Promise<NextResponse> {
  console.error(`API Error in ${context}:`, error);

  if (error instanceof Error) {
    if (
      error.message.includes("Missing required fields") ||
      error.message.includes("Thiếu các trường bắt buộc")
    ) {
      return createErrorResponse(error.message, 400);
    }
    if (
      error.message.includes("Invalid JSON") ||
      error.message.includes("JSON trong nội dung yêu cầu không hợp lệ")
    ) {
      return createErrorResponse(error.message, 400);
    }
    if (error.message.includes("not found")) {
      return createErrorResponse(error.message, 404);
    }
    if (
      error.message.includes("Access denied") ||
      error.message.includes("Insufficient permissions") ||
      error.message.includes("Không đủ quyền")
    ) {
      return createErrorResponse(error.message, 403);
    }
    if (
      error.message.includes("Unauthorized") ||
      error.message.includes("Chưa được xác thực")
    ) {
      return createErrorResponse(error.message, 401);
    }
  }

  return createErrorResponse("Lỗi máy chủ nội bộ", 500);
}
