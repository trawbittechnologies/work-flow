import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logActivity } from "@/lib/activity";
import { createNotification } from "@/lib/notifications";
import { isAdmin } from "@/lib/role";

type RouteParams = { params: Promise<{ id: string }> };

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(2000),
  parentId: z.string().optional().nullable(),
});

// GET /api/projects/[id]/comments
export async function GET(_req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const admin = await isAdmin(session.user.id);
    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: session.user.id } },
    });
    if (!admin && !isMember) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Fetch top-level comments with their replies
    const comments = await prisma.projectComment.findMany({
      where: { projectId: id, parentId: null },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        replies: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: comments });
  } catch (error) {
    console.error("[GET /api/projects/[id]/comments]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/projects/[id]/comments
export async function POST(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const admin = await isAdmin(session.user.id);
    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: session.user.id } },
    });
    if (!admin && !isMember) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const comment = await prisma.projectComment.create({
      data: {
        projectId: id,
        userId: session.user.id,
        content: parsed.data.content,
        parentId: parsed.data.parentId ?? null,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    const project = await prisma.project.findUnique({
      where: { id },
      select: { name: true, members: { select: { userId: true } } },
    });

    // Notify all project members (except the commenter)
    if (project) {
      const notifyUserIds = project.members
        .map((m: { userId: string }) => m.userId)
        .filter((uid: string) => uid !== session.user.id);

      for (const uid of notifyUserIds) {
        await createNotification({
          userId: uid,
          type: "NEW_COMMENT",
          title: "New project comment",
          message: `Someone commented on "${project.name}"`,
          projectId: id,
        });
      }
    }

    if (!parsed.data.parentId) {
      await logActivity({
        projectId: id,
        userId: session.user.id,
        type: "COMMENT_ADDED",
        metadata: { commentId: comment.id },
      });
    }

    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/projects/[id]/comments]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
