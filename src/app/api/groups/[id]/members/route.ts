import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";
import { GroupRole, ActivityType } from "@/types";
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
        { error: "Chưa được xác thực" },
        { status: 401 },
      );
    }

    // Fetch group and members (no access check - users can view all groups)
    const group = await prisma.group.findUnique({
      where: { id: params.id },
      include: {
        members: {
          include: {
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

    if (!group) {
      return NextResponse.json(
        { error: "Không tìm thấy nhóm" },
        { status: 404 },
      );
    }

    // Inject virtual admin membership for global administrators
    const groupWithVirtualMember = injectVirtualAdminMembership(
      group,
      session.user as any,
    );

    return NextResponse.json({
      members: groupWithVirtualMember.members.map((member: any) => ({
        ...member,
        user: {
          ...member.user,
          // Don't expose sensitive info
          password: undefined,
        },
      })),
    });
  } catch (error) {
    console.error("Lỗi tải thành viên nhóm:", error);
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}

export async function POST(
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

    const { email, role = GroupRole.MEMBER } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email là bắt buộc" }, { status: 400 });
    }

    // Verify user has admin permissions for this group
    const group = await prisma.group.findUnique({
      where: { id: params.id },
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
                role: true,
                createdAt: true,
              },
            },
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

    // Inject virtual admin membership for global administrators
    const groupWithVirtualMember = injectVirtualAdminMembership(
      group,
      session.user as any,
    );

    // Check if user can manage group (includes global admin check)
    if (!canManageGroup(session.user as any, groupWithVirtualMember.members)) {
      return NextResponse.json({ error: "Không đủ quyền" }, { status: 403 });
    }

    // Find the user to add
    const userToAdd = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!userToAdd) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng" },
        { status: 404 },
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: userToAdd.id,
          groupId: params.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Người dùng đã là thành viên của nhóm này" },
        { status: 400 },
      );
    }

    // Create the group member
    const groupMember = await prisma.groupMember.create({
      data: {
        userId: userToAdd.id,
        groupId: params.id,
        role: role as GroupRole,
      },
      include: {
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
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      groupId: params.id,
      action: ActivityType.MEMBER_INVITED,
      description: `Đã thêm ${userToAdd.email} với vai trò ${role} vào nhóm "${group.name}"`,
      metadata: {
        memberEmail: userToAdd.email,
        memberId: userToAdd.id,
        role: role,
      },
    });

    return NextResponse.json(
      {
        member: {
          ...groupMember,
          user: {
            ...groupMember.user,
            // Don't expose sensitive info
            password: undefined,
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Lỗi thêm thành viên nhóm:", error);
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
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
        { error: "Chưa được xác thực" },
        { status: 401 },
      );
    }

    const { memberId, role } = await request.json();

    if (!memberId || !role) {
      return NextResponse.json(
        { error: "Cần cung cấp mã thành viên và vai trò" },
        { status: 400 },
      );
    }

    // Verify user has admin permissions for this group
    const group = await prisma.group.findUnique({
      where: { id: params.id },
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
                role: true,
                createdAt: true,
              },
            },
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

    // Inject virtual admin membership for global administrators
    const groupWithVirtualMember = injectVirtualAdminMembership(
      group,
      session.user as any,
    );

    // Check if user can manage group (includes global admin check)
    if (!canManageGroup(session.user as any, groupWithVirtualMember.members)) {
      return NextResponse.json({ error: "Không đủ quyền" }, { status: 403 });
    }

    // Get the member being updated
    const targetMember = await prisma.groupMember.findUnique({
      where: { id: memberId },
      include: {
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
    });

    if (!targetMember) {
      return NextResponse.json(
        { error: "Không tìm thấy thành viên" },
        { status: 404 },
      );
    }

    // Check if this is an ownership transfer
    if (role === GroupRole.OWNER) {
      // Only current owner can transfer ownership
      if (targetMember.role !== GroupRole.OWNER) {
        return NextResponse.json(
          { error: "Chỉ chủ sở hữu hiện tại mới có thể chuyển quyền" },
          { status: 403 },
        );
      }

      // Cannot transfer ownership to yourself
      if (targetMember.userId === session.user.id) {
        return NextResponse.json(
          { error: "Bạn đã là chủ nhóm" },
          { status: 400 },
        );
      }

      // Perform ownership transfer (update both members in a transaction)
      const [updatedMember, downgradedOwner] = await prisma.$transaction([
        // Update target member to OWNER
        prisma.groupMember.update({
          where: { id: memberId },
          data: { role: GroupRole.OWNER },
          include: {
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
        }),
        // Downgrade current owner to ADMIN
        prisma.groupMember.update({
          where: { id: targetMember.id },
          data: { role: GroupRole.ADMIN },
          include: {
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
        }),
      ]);

      // Log ownership transfer activity
      await logActivity({
        userId: session.user.id,
        groupId: params.id,
        action: ActivityType.OWNERSHIP_TRANSFERRED,
        description: `Đã chuyển quyền sở hữu "${group.name}" từ ${downgradedOwner.user.email} sang ${updatedMember.user.email}`,
        metadata: {
          previousOwnerId: downgradedOwner.userId,
          previousOwnerEmail: downgradedOwner.user.email,
          newOwnerId: updatedMember.userId,
          newOwnerEmail: updatedMember.user.email,
        },
      });

      return NextResponse.json({
        member: {
          ...updatedMember,
          user: {
            ...updatedMember.user,
            password: undefined,
          },
        },
      });
    }

    // Regular role update (non-ownership transfer)
    const updatedMember = await prisma.groupMember.update({
      where: { id: memberId },
      data: { role: role as GroupRole },
      include: {
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
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      groupId: params.id,
      action: ActivityType.MEMBER_ROLE_UPDATED,
      description: `Đã cập nhật vai trò của ${updatedMember.user.email} thành ${role} trong nhóm "${group.name}"`,
      metadata: {
        memberId: updatedMember.id,
        memberEmail: updatedMember.user.email,
        newRole: role,
      },
    });

    return NextResponse.json({
      member: {
        ...updatedMember,
        user: {
          ...updatedMember.user,
          password: undefined,
        },
      },
    });
  } catch (error) {
    console.error("Lỗi cập nhật thành viên nhóm:", error);
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
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
        { error: "Chưa được xác thực" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json(
        { error: "Cần cung cấp mã thành viên" },
        { status: 400 },
      );
    }

    // Verify user has admin permissions for this group
    const group = await prisma.group.findUnique({
      where: { id: params.id },
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
                role: true,
                createdAt: true,
              },
            },
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

    // Inject virtual admin membership for global administrators
    const groupWithVirtualMember = injectVirtualAdminMembership(
      group,
      session.user as any,
    );

    // Check if user can manage group (includes global admin check)
    if (!canManageGroup(session.user as any, groupWithVirtualMember.members)) {
      return NextResponse.json({ error: "Không đủ quyền" }, { status: 403 });
    }

    // Get the member to be removed
    const memberToRemove = await prisma.groupMember.findUnique({
      where: { id: memberId },
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

    if (!memberToRemove) {
      return NextResponse.json(
        { error: "Không tìm thấy thành viên" },
        { status: 404 },
      );
    }

    // Don't allow removing the group owner
    if (memberToRemove.role === "OWNER") {
      return NextResponse.json(
        { error: "Không thể xóa chủ nhóm" },
        { status: 403 },
      );
    }

    // Remove the member
    await prisma.groupMember.delete({
      where: { id: memberId },
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      groupId: params.id,
      action: ActivityType.MEMBER_REMOVED,
      description: `Đã xóa ${memberToRemove.user.email} khỏi nhóm "${group.name}"`,
      metadata: {
        removedMemberId: memberToRemove.id,
        removedMemberEmail: memberToRemove.user.email,
      },
    });

    return NextResponse.json({ message: "Đã xóa thành viên thành công" });
  } catch (error) {
    console.error("Lỗi xóa thành viên nhóm:", error);
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
