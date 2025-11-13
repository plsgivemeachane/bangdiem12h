import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Chưa được xác thực" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const groupId = searchParams.get("groupId");
    const searchTerm = query?.trim().toLowerCase() || "";

    // Build search conditions - if no query, return all users (for initial load)
    const whereConditions: any = {
      // Always exclude current user from search results
      id: {
        not: session.user.id,
      },
    };

    // If groupId is provided, exclude existing members of that group
    if (groupId) {
      // First, get existing member IDs for this group
      const existingMemberIds = await prisma.groupMember.findMany({
        where: { groupId },
        select: { userId: true },
      });

      const existingIds = existingMemberIds.map((member) => member.userId);

      // Add condition to exclude existing members
      whereConditions.id = {
        not: session.user.id,
        notIn: existingIds,
      };
    }

    // Add search filters only if query is provided
    if (searchTerm.length > 0) {
      whereConditions.OR = [
        {
          email: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ];
    }

    // Search users by email or name
    const users = await prisma.user.findMany({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: [
        {
          email: "asc",
        },
        {
          name: "asc",
        },
      ],
      // Limit search results to prevent abuse
      take: 20,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Lỗi tìm kiếm người dùng:", error);
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
