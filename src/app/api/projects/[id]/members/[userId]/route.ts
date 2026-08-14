import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { isAdmin } from "@/lib/role";

type RouteParams = { params: Promise<{ id: string; userId: string }> };

// DELETE /api/projects/[id]/members/[userId]
export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, userId } = await params;

  try {
    const admin = await isAdmin(session.user.id);
    const currentMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: session.user.id } },
    });

    const project = await prisma.project.findUnique({ where: { id }, select: { ownerId: true, leadId: true } });

    if (!admin && !currentMember) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isOwner = currentMember?.role === "OWNER" || project?.ownerId === session.user.id;
    const isLead = project?.leadId === session.user.id;
    const isSelf = session.user.id === userId;

    // Only admins, owners, leads can remove others; members can remove themselves
    if (!admin && !isOwner && !isLead && !isSelf) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Can't remove the project owner
    if (project?.ownerId === userId && !admin) {
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
