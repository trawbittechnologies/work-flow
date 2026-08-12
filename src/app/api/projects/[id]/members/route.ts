import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logActivity } from "@/lib/activity";
import { createNotification } from "@/lib/notifications";

type RouteParams = { params: Promise<{ id: string }> };

const inviteSchema = z.object({
  email: z.string().email("Invalid email"),
});

// GET /api/projects/[id]/members
export async function GET(_req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: session.user.id } },
    });
    if (!isMember) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const members = await prisma.projectMember.findMany({
      where: { projectId: id },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { joinedAt: "asc" },
    });

    // Add task counts
    const memberIds = members.map((m) => m.userId);
    const taskCounts = await prisma.task.groupBy({
      by: ["assigneeId", "status"],
      where: { projectId: id, assigneeId: { in: memberIds } },
      _count: true,
    });

    const enriched = members.map((m) => {
      const assigned = taskCounts
        .filter((t) => t.assigneeId === m.userId)
        .reduce((acc, t) => acc + t._count, 0);
      const completed = taskCounts
        .filter((t) => t.assigneeId === m.userId && t.status === "DONE")
        .reduce((acc, t) => acc + t._count, 0);
      return { ...m, assignedTasks: assigned, completedTasks: completed };
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch (error) {
    console.error("[GET /api/projects/[id]/members]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/projects/[id]/members — invite by email
export async function POST(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const ownerMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: session.user.id } },
    });
    if (!ownerMember || ownerMember.role !== "OWNER") {
      return NextResponse.json({ error: "Only project owners can invite members" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const invitedUser = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
      select: { id: true, name: true, email: true, avatar: true },
    });

    if (!invitedUser) {
      return NextResponse.json(
        { error: "No user found with that email address." },
        { status: 404 }
      );
    }

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: invitedUser.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "User is already a member of this project" }, { status: 409 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      select: { name: true },
    });

    const member = await prisma.projectMember.create({
      data: { projectId: id, userId: invitedUser.id, role: "MEMBER" },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    await logActivity({
      projectId: id,
      userId: session.user.id,
      type: "MEMBER_ADDED",
      metadata: { memberName: invitedUser.name, memberId: invitedUser.id },
    });

    await createNotification({
      userId: invitedUser.id,
      type: "PROJECT_INVITE",
      title: "You were added to a project",
      message: `You were added to "${project?.name}"`,
      projectId: id,
    });

    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/projects/[id]/members]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
