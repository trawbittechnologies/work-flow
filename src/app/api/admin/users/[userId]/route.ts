import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/role";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ userId: string }> };

// PATCH /api/admin/users/[userId] — update user role or active status
export async function PATCH(req: Request, { params }: RouteParams) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await params;

  try {
    // Prevent self-demotion
    if (userId === adminId) {
      return NextResponse.json({ error: "Cannot modify your own account" }, { status: 400 });
    }

    const { role, isActive } = await req.json();

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role !== undefined && { role }),
        ...(isActive !== undefined && { isActive }),
      },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("[PATCH /api/admin/users/[userId]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/users/[userId] — remove user from workspace
export async function DELETE(_req: Request, { params }: RouteParams) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await params;

  try {
    if (userId === adminId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/users/[userId]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
