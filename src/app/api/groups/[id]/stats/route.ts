import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek } from "date-fns";
import { UserPerformance, GroupStats } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Chưa được xác thực" },
        { status: 401 },
      );
    }

    const groupId = params.id;

    // Verify user has access to this group
    const groupMembership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id,
      },
    });

    if (!groupMembership) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 },
      );
    }

    // Get group data with basic stats
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          select: {
            id: true,
            userId: true,
            role: true,
            joinedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        groupRules: {
          include: {
            rule: true,
          },
          where: { isActive: true },
        },
        _count: {
          select: {
            scoreRecords: true,
            groupRules: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Không tìm thấy nhóm" },
        { status: 404 },
      );
    }

    // Calculate total points
    const totalPoints = await prisma.scoreRecord.aggregate({
      where: { groupId },
      _sum: { points: true },
    });

    // Get this week's data
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const weeklyRecords = await prisma.scoreRecord.findMany({
      where: {
        groupId,
        recordedAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });

    const weeklyScore = weeklyRecords.reduce(
      (sum, record) => sum + record.points,
      0,
    );

    // Calculate user performance metrics
    const userPerformanceMap = new Map<string, UserPerformance>();

    // Initialize performance tracking for all members
    group.members.forEach((member: any) => {
      userPerformanceMap.set(member.userId, {
        userId: member.userId,
        userName: member.user?.name || "Người dùng chưa xác định",
        userEmail: member.user?.email || "Không có email",
        totalRecords: 0,
        totalPoints: 0,
        averagePoints: 0,
      });
    });

    // Get all score records for the group
    const allRecords = await prisma.scoreRecord.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Calculate performance metrics for each user
    allRecords.forEach((record) => {
      const performance = userPerformanceMap.get(record.userId);
      if (performance) {
        performance.totalRecords += 1;
        performance.totalPoints += record.points;
        performance.averagePoints =
          performance.totalRecords > 0
            ? performance.totalPoints / performance.totalRecords
            : 0;
      }
    });

    // Convert to array and sort
    const allPerformances = Array.from(userPerformanceMap.values());

    // Sort by total points (descending) for top performers
    const topPerformers = [...allPerformances]
      .filter((p) => p.totalRecords > 0)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 3);

    // Sort by total points (ascending) for bottom performers (only those with records)
    const bottomPerformers = [...allPerformances]
      .filter((p) => p.totalRecords > 0)
      .sort((a, b) => a.totalPoints - b.totalPoints)
      .slice(0, 3);

    // Create the enhanced GroupStats object
    const groupStats: GroupStats = {
      group: {
        ...group,
        members: group.members as any, // Type assertion to handle the structure
        scoringRules: group.groupRules?.map((gr) => gr.rule) || [], // Transform for backward compatibility
      },
      totalMembers: group.members.length,
      activeRules: group.groupRules?.length || 0,
      totalScoreRecords: group._count.scoreRecords,
      totalPoints: totalPoints._sum.points || 0,
      // New weekly metrics
      weeklyRecords: weeklyRecords.length,
      weeklyScore,
      // Performance rankings
      topPerformers,
      bottomPerformers,
    };

    return NextResponse.json({
      success: true,
      data: groupStats,
    });
  } catch (error) {
    console.error("Lỗi tải thống kê nhóm:", error);
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
