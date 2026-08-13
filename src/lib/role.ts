import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Get the role of a user from the DB.
 */
export async function getUserRole(userId: string): Promise<"ADMIN" | "MEMBER"> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return (user?.role as "ADMIN" | "MEMBER") ?? "MEMBER";
}

/**
 * Check if the current session user is an admin.
 * Uses DB as source of truth (not JWT, to avoid stale tokens).
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "ADMIN";
}

/**
 * Returns the userId if the user is an admin, otherwise returns null.
 * Use this in API routes that require admin access.
 */
export async function requireAdmin(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const admin = await isAdmin(session.user.id);
  return admin ? session.user.id : null;
}
