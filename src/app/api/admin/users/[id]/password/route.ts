import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  validatePasswordStrength,
  isCommonPassword,
} from "@/lib/utils/password";
import { ActivityType } from "@/types";

// PUT /api/admin/users/[id]/password - Reset user password
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authReq = await requireAdmin();
  if (!authReq) {
    return NextResponse.json(
      { error: "Không có quyền truy cập" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword) {
      return NextResponse.json(
        { error: "Mật khẩu mới là bắt buộc" },
        { status: 400 },
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng" },
        { status: 404 },
      );
    }

    // Validate password strength
    const validation = validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: "Mật khẩu không đáp ứng yêu cầu", details: validation.errors },
        { status: 400 },
      );
    }

    // Check if password is common
    if (isCommonPassword(newPassword)) {
      return NextResponse.json(
        {
          error:
            "Mật khẩu này quá phổ biến. Vui lòng chọn mật khẩu an toàn hơn.",
        },
        { status: 400 },
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await prisma.user.update({
      where: { id: params.id },
      data: { password: hashedPassword },
    });

    // Log password reset
    await prisma.activityLog.create({
      data: {
        userId: params.id,
        action: ActivityType.ADMIN_PASSWORD_RESET_BY_ADMIN,
        description: `Quản trị viên ${authReq.user.email} đã đặt lại mật khẩu cho người dùng ${user.email}`,
        metadata: {
          resetBy: authReq.user.id,
          resetByEmail: authReq.user.email,
          targetUser: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Đặt lại mật khẩu thành công",
    });
  } catch (error) {
    console.error("Lỗi đặt lại mật khẩu:", error);
    return NextResponse.json(
      { error: "Không thể đặt lại mật khẩu" },
      { status: 500 },
    );
  }
}
