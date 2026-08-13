import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/activity";
import { createNotification } from "@/lib/notifications";
import { isAdmin } from "@/lib/role";

type RouteParams = { params: Promise<{ id: string }> };

const addMemberSchema = z.union([
  z.object({
    email: z.string().email("Invalid email"),
    name: z.string().optional(),
    password: z.string().optional(),
    userId: z.undefined(),
  }),
  z.object({
    userId: z.string().min(1),
    email: z.undefined().optional(),
    name: z.undefined().optional(),
    password: z.undefined().optional(),
  }),
]);

// GET /api/projects/[id]/members
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

    const members = await prisma.projectMember.findMany({
      where: { projectId: id },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { joinedAt: "asc" },
    });

    const memberIds = members.map((m: { userId: string }) => m.userId);
    const taskCounts = await prisma.task.groupBy({
      by: ["assigneeId", "status"],
      where: { projectId: id, assigneeId: { in: memberIds } },
      _count: true,
    });

    // Get the project to know the lead
    const project = await prisma.project.findUnique({
      where: { id },
      select: { leadId: true },
    });

    const enriched = members.map((m: Record<string, unknown> & { userId: string }) => {
      const assigned = taskCounts
        .filter((t: { assigneeId: string | null }) => t.assigneeId === m.userId)
        .reduce((acc: number, t: { _count: number }) => acc + t._count, 0);
      const completed = taskCounts
        .filter((t: { assigneeId: string | null; status: string }) => t.assigneeId === m.userId && t.status === "DONE")
        .reduce((acc: number, t: { _count: number }) => acc + t._count, 0);
      return {
        ...m,
        assignedTasks: assigned,
        completedTasks: completed,
        isLead: project?.leadId === m.userId,
      };
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch (error) {
    console.error("[GET /api/projects/[id]/members]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/projects/[id]/members — add member by email (create if not exists) or by userId
export async function POST(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const admin = await isAdmin(session.user.id);
    const ownerMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: session.user.id } },
    });

    if (!admin && (!ownerMember || ownerMember.role !== "OWNER")) {
      return NextResponse.json({ error: "Only project owners can add members" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = addMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    let targetUser: { id: string; name: string; email: string; avatar: string | null } | null = null;

    if (parsed.data.userId) {
      // Add existing user by userId
      targetUser = await prisma.user.findUnique({
        where: { id: parsed.data.userId },
        select: { id: true, name: true, email: true, avatar: true },
      });
      if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    } else if (parsed.data.email) {
      const email = parsed.data.email.toLowerCase();
      targetUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true, avatar: true },
      });

      // If user does not exist, create account
      if (!targetUser) {
        const rawPassword = parsed.data.password || "password123";
        const passwordHash = await bcrypt.hash(rawPassword, 10);
        const userName = parsed.data.name?.trim() || email.split("@")[0];

        const newUser = await prisma.user.create({
          data: { name: userName, email, passwordHash },
        });

        targetUser = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          avatar: newUser.avatar,
        };
      }
    } else {
      return NextResponse.json({ error: "Must provide email or userId" }, { status: 400 });
    }

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: targetUser.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "User is already a member of this project" }, { status: 409 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      select: { name: true },
    });

    const member = await prisma.projectMember.create({
      data: { projectId: id, userId: targetUser.id, role: "MEMBER" },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    await logActivity({
      projectId: id,
      userId: session.user.id,
      type: "MEMBER_ADDED",
      metadata: { memberName: targetUser.name, memberId: targetUser.id },
    });

    await createNotification({
      userId: targetUser.id,
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
