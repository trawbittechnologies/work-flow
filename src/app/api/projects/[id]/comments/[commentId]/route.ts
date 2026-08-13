import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/role";

type RouteParams = { params: Promise<{ id: string; commentId: string }> };

// PATCH /api/projects/[id]/comments/[commentId]
export async function PATCH(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { commentId } = await params;

  try {
    const comment = await prisma.projectComment.findUnique({ where: { id: commentId } });
    if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

    const admin = await isAdmin(session.user.id);
    if (!admin && comment.userId !== session.user.id) {
      return NextResponse.json({ error: "Cannot edit others' comments" }, { status: 403 });
    }

    const { content } = await req.json();
    if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

    const updated = await prisma.projectComment.update({
      where: { id: commentId },
      data: { content: content.trim() },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PATCH /api/projects/[id]/comments/[commentId]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/projects/[id]/comments/[commentId]
export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { commentId } = await params;

  try {
    const comment = await prisma.projectComment.findUnique({ where: { id: commentId } });
    if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

    const admin = await isAdmin(session.user.id);
    if (!admin && comment.userId !== session.user.id) {
      return NextResponse.json({ error: "Cannot delete others' comments" }, { status: 403 });
    }

    await prisma.projectComment.delete({ where: { id: commentId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/projects/[id]/comments/[commentId]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
