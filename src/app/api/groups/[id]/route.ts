import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";
import { ActivityType } from "@/types";
import { API } from "@/lib/translations";
import {
  injectVirtualAdminMembership,
  canManageGroup,
} from "@/lib/utils/global-admin-permissions";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: API.ERROR.UNAUTHORIZED },
        { status: 401 },
      );
    }

    const group = await prisma.group.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
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
                role: true,
                createdAt: true,
              },
            },
          },
        },
        groupRules: {
          include: {
            rule: true,
          },
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
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
        { error: API.ERROR.GROUP_NOT_FOUND },
        { status: 404 },
      );
    }

    // No access check - all users can view all groups (read-only permission)

    // Inject virtual admin membership for global administrators
    const groupWithVirtualMember = injectVirtualAdminMembership(
      group,
      session.user as any,
    );

    // Transform groupRules to scoringRules for backward compatibility
    const groupWithScoringRules = {
      ...groupWithVirtualMember,
      scoringRules:
        groupWithVirtualMember.groupRules?.map((gr: any) => gr.rule) || [],
    };

    return NextResponse.json({ group: groupWithScoringRules });
  } catch (error) {
    console.error("API Error - Load group info:", error);
    return NextResponse.json(
      { error: API.ERROR.INTERNAL_SERVER_ERROR },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: API.ERROR.UNAUTHORIZED },
        { status: 401 },
      );
    }

    const { name, description, isActive } = await request.json();

    // Check if user is the creator or admin
    const group = await prisma.group.findUnique({
      where: { id: params.id },
      include: {
        members: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: API.ERROR.GROUP_NOT_FOUND },
        { status: 404 },
      );
    }

    const userMember = group.members[0];
    if (!userMember || !["OWNER", "ADMIN"].includes(userMember.role)) {
      return NextResponse.json(
        { error: API.ERROR.INSUFFICIENT_PERMISSIONS },
        { status: 403 },
      );
    }

    const updatedGroup = await prisma.group.update({
      where: { id: params.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && {
          description: description?.trim() || null,
        }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
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
                role: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    // Inject virtual admin membership for response
    const updatedGroupWithVirtualMember = injectVirtualAdminMembership(
      updatedGroup,
      session.user as any,
    );

    // Log activity
    await logActivity({
      userId: session.user.id,
      groupId: updatedGroup.id,
      action: ActivityType.GROUP_UPDATED,
      description: API.SUCCESS.GROUP_UPDATED.replace(
        "{name}",
        updatedGroup.name,
      ),
      metadata: { changes: { name, description, isActive } },
    });

    return NextResponse.json({ group: updatedGroupWithVirtualMember });
  } catch (error) {
    console.error("API Error - Update group:", error);
    return NextResponse.json(
      { error: API.ERROR.INTERNAL_SERVER_ERROR },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: API.ERROR.UNAUTHORIZED },
        { status: 401 },
      );
    }

    // Check if user is OWNER/ADMIN of the group
    const group = await prisma.group.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        createdById: true,
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
                role: true,
                createdAt: true,
              },
            },
          },
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
        { error: API.ERROR.GROUP_NOT_FOUND },
        { status: 404 },
      );
    }

    // Inject virtual admin membership for global administrators
    const groupWithVirtualMember = injectVirtualAdminMembership(
      group,
      session.user as any,
    );

    // Check if user can manage group (includes global admin check)
    if (!canManageGroup(session.user as any, groupWithVirtualMember.members)) {
      return NextResponse.json(
        { error: API.ERROR.ONLY_ADMIN_OWNER_DELETE_GROUP },
        { status: 403 },
      );
    }

    // Delete all related data in proper order to avoid foreign key constraint issues

    // 1. Delete all score records
    await prisma.scoreRecord.deleteMany({
      where: { groupId: params.id },
    });

    // 2. Delete all group rules associations
    await prisma.groupRule.deleteMany({
      where: { groupId: params.id },
    });

    // 3. Delete all group members
    await prisma.groupMember.deleteMany({
      where: { groupId: params.id },
    });

    const deletedGroup = await prisma.group.delete({
      where: { id: params.id },
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: ActivityType.GROUP_DELETED,
      description: API.SUCCESS.GROUP_DELETED.replace("{name}", group.name),
      metadata: { groupId: params.id, groupName: group.name },
    });

    return NextResponse.json({
      message: `Đã xóa nhóm "${group.name}" cùng với tất cả dữ liệu liên quan thành công`,
    });
  } catch (error) {
    console.error("API Error - Delete group:", error);
    return NextResponse.json(
      { error: API.ERROR.INTERNAL_SERVER_ERROR },
      { status: 500 },
    );
  }
}
