import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";
import { ActivityType } from "@/types";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Chưa được xác thực" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { name, image } = body;

    // Validation
    if (name !== undefined && typeof name !== "string") {
      return NextResponse.json(
        { success: false, message: "Tên phải là chuỗi" },
        { status: 400 },
      );
    }

    if (name !== undefined && name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Tên không được để trống" },
        { status: 400 },
      );
    }

    if (image !== undefined && typeof image !== "string") {
      return NextResponse.json(
        { success: false, message: "Ảnh phải là chuỗi URL hợp lệ" },
        { status: 400 },
      );
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name.trim();
    }
    if (image !== undefined) {
      updateData.image = image;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: ActivityType.USER_LOGIN, // We can use a generic action or add a new one
      description: "Người dùng đã cập nhật hồ sơ",
      metadata: {
        updatedFields: Object.keys(updateData),
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Cập nhật hồ sơ thành công",
    });
  } catch (error) {
    console.error("Lỗi cập nhật hồ sơ:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Không thể cập nhật hồ sơ",
      },
      { status: 500 },
    );
  }
}
