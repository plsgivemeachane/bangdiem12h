import { GroupMember, GroupRole, User } from "@/types";

/**
 * Check if a user is a global administrator
 */
export function isGlobalAdmin(user: User | null | undefined): boolean {
  return user?.role === "ADMIN";
}

/**
 * Inject virtual admin membership for global administrators
 * This ensures global admins have ADMIN role in all groups
 */
export function injectVirtualAdminMembership(
  group: any,
  currentUser: User | null | undefined,
): any {
  if (!isGlobalAdmin(currentUser)) {
    return group;
  }

  // Check if user is already a member of the group
  const existingMember = group.members?.find(
    (member: GroupMember) => member.userId === currentUser?.id,
  );

  // If user is already a member, don't inject virtual membership
  if (existingMember) {
    return group;
  }

  // Inject virtual admin membership
  const virtualMember: GroupMember = {
    id: `virtual-${currentUser?.id}-${group.id}`,
    userId: currentUser?.id || "",
    groupId: group.id,
    role: GroupRole.ADMIN,
    joinedAt: new Date(),
    user: {
      id: currentUser?.id || "",
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      role: currentUser?.role || ("USER" as any),
      createdAt: currentUser?.createdAt || new Date(),
    },
  };

  return {
    ...group,
    members: [...(group.members || []), virtualMember],
  };
}

/**
 * Enhanced permission check that includes global admin privileges
 */
export function hasGroupPermission(
  user: User | null | undefined,
  groupMembers: GroupMember[],
  requiredRoles: GroupRole[],
): boolean {
  if (isGlobalAdmin(user)) {
    return true;
  }

  const userMember = groupMembers.find((member) => member.userId === user?.id);
  if (!userMember) {
    return false;
  }

  return requiredRoles.includes(userMember.role);
}

/**
 * Check if user can manage group (OWNER or ADMIN or Global ADMIN)
 */
export function canManageGroup(
  user: User | null | undefined,
  groupMembers: GroupMember[],
): boolean {
  return hasGroupPermission(user, groupMembers, [
    GroupRole.OWNER,
    GroupRole.ADMIN,
  ]);
}

/**
 * Check if user is group owner (including virtual ownership check)
 */
export function isGroupOwner(
  user: User | null | undefined,
  groupMembers: GroupMember[],
): boolean {
  if (isGlobalAdmin(user)) {
    // Global admins are not owners, they are admins
    return false;
  }

  const userMember = groupMembers.find((member) => member.userId === user?.id);
  return userMember?.role === GroupRole.OWNER || false;
}

/**
 * Get user's effective role in a group (includes virtual admin role)
 */
export function getUserGroupRole(
  user: User | null | undefined,
  groupMembers: GroupMember[],
): GroupRole {
  if (isGlobalAdmin(user)) {
    const existingMember = groupMembers.find(
      (member) => member.userId === user?.id,
    );
    if (existingMember) {
      return existingMember.role;
    }
    return GroupRole.ADMIN;
  }

  const userMember = groupMembers.find((member) => member.userId === user?.id);
  return userMember?.role || GroupRole.MEMBER;
}
