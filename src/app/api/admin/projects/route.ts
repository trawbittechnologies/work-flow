import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/role";
import { prisma } from "@/lib/prisma";

// GET /api/admin/projects — all projects overview for admin
export async function GET() {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const projects = await prisma.project.findMany({
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        lead: { select: { id: true, name: true, email: true, avatar: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
        tasks: { select: { id: true, status: true } },
        _count: { select: { tasks: true, members: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error("[GET /api/admin/projects]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
