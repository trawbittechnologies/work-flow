import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCommentSchema } from "@/lib/validations/task";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/tasks/[id]/comments
export async function GET(_req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const task = await prisma.task.findUnique({ where: { id }, select: { projectId: true } });
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId: session.user.id } },
    });
    if (!isMember) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const comments = await prisma.taskComment.findMany({
      where: { taskId: id },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: comments });
  } catch (error) {
    console.error("[GET /api/tasks/[id]/comments]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/tasks/[id]/comments
export async function POST(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const task = await prisma.task.findUnique({ where: { id }, select: { projectId: true } });
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId: session.user.id } },
    });
    if (!isMember) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid comment" }, { status: 400 });
    }

    const comment = await prisma.taskComment.create({
      data: {
        taskId: id,
        userId: session.user.id,
        content: parsed.data.content.trim(),
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/tasks/[id]/comments]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
