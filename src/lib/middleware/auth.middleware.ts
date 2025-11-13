import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
}

/**
 * Middleware to check if user is authenticated
 */
export async function requireAuth(): Promise<AuthenticatedRequest | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    },
  };
}

/**
 * Middleware to check if user is admin
 */
export async function requireAdmin(): Promise<AuthenticatedRequest | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    },
  };
}

/**
 * Middleware to check if user is authenticated or return limited access
 */
export async function getOptionalAuth(): Promise<AuthenticatedRequest | null> {
  try {
    return await requireAuth();
  } catch {
    return null;
  }
}
