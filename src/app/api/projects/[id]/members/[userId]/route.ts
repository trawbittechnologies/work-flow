import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

type RouteParams = { params: Promise<{ id: string; userId: string }> };

// DELETE /api/projects/[id]/members/[userId]
export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, userId } = await params;

  try {
    const currentMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: session.user.id } },
    });

    if (!currentMember) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Only owners can remove others; members can remove themselves
    if (currentMember.role !== "OWNER" && session.user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Can't remove the project owner
    const project = await prisma.project.findUnique({ where: { id }, select: { ownerId: true } });
    if (project?.ownerId === userId) {
      return NextResponse.json({ error: "Cannot remove the project owner" }, { status: 400 });
    }

    const removedMember = await prisma.projectMember.delete({
      where: { projectId_userId: { projectId: id, userId } },
      include: { user: { select: { name: true } } },
    });

    await logActivity({
      projectId: id,
      userId: session.user.id,
      type: "MEMBER_REMOVED",
      metadata: { memberName: removedMember.user.name, memberId: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/projects/[id]/members/[userId]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
