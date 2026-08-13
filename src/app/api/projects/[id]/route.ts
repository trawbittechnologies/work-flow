import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProjectSchema } from "@/lib/validations/project";
import { logActivity } from "@/lib/activity";
import { isAdmin } from "@/lib/role";

type RouteParams = { params: Promise<{ id: string }> };

async function getProjectAndVerifyAccess(projectId: string, userId: string) {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    include: { project: true },
  });
  return member;
}

// GET /api/projects/[id]
export async function GET(_req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const admin = await isAdmin(session.user.id);
    
    if (!admin) {
      const member = await getProjectAndVerifyAccess(id, session.user.id);
      if (!member) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        lead: { select: { id: true, name: true, email: true, avatar: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
          orderBy: { joinedAt: "asc" },
        },
        tasks: {
          select: { id: true, status: true, priority: true, title: true, assigneeId: true, dueDate: true },
          orderBy: { createdAt: "desc" },
        },
        labels: true,
        _count: { select: { tasks: true, members: true, messages: true } },
      },
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("[GET /api/projects/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/projects/[id]
export async function PATCH(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const admin = await isAdmin(session.user.id);
    const member = await getProjectAndVerifyAccess(id, session.user.id);

    // Must be admin or member of the project
    if (!admin && !member) {
      return NextResponse.json({ error: "Only project members and admins can update this project" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const oldProject = member?.project ?? await prisma.project.findUnique({ where: { id }, select: { status: true, leadId: true, name: true } });

    // If leadId is specified, verify they are a project member
    if (parsed.data.leadId) {
      const leadMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: id, userId: parsed.data.leadId } },
      });
      if (!leadMember) {
        return NextResponse.json({ error: "Lead must be a project member" }, { status: 400 });
      }
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(parsed.data.name && { name: parsed.data.name.trim() }),
        ...(parsed.data.description !== undefined && { description: parsed.data.description }),
        ...(parsed.data.icon && { icon: parsed.data.icon }),
        ...(parsed.data.status && { status: parsed.data.status }),
        ...(parsed.data.priority && { priority: parsed.data.priority }),
        ...(parsed.data.leadId !== undefined && { leadId: parsed.data.leadId }),
        ...(parsed.data.startDate !== undefined && {
          startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
        }),
        ...(parsed.data.deadline !== undefined && {
          deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
        }),
      },
    });

    const actorId = session.user.id;

    if (parsed.data.status && parsed.data.status !== oldProject?.status) {
      await logActivity({
        projectId: id,
        userId: actorId,
        type: "PROJECT_STATUS_CHANGED",
        metadata: { from: oldProject?.status, to: parsed.data.status },
      });
    }

    if (parsed.data.leadId !== undefined && parsed.data.leadId !== oldProject?.leadId) {
      await logActivity({
        projectId: id,
        userId: actorId,
        type: "PROJECT_LEAD_CHANGED",
        metadata: { leadId: parsed.data.leadId },
      });
    }

    if (parsed.data.name || parsed.data.description !== undefined || parsed.data.priority) {
      await logActivity({
        projectId: id,
        userId: actorId,
        type: "PROJECT_EDITED",
        metadata: { updatedFields: Object.keys(parsed.data) },
      });
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("[PATCH /api/projects/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/projects/[id]
export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const admin = await isAdmin(session.user.id);
    const project = await prisma.project.findUnique({
      where: { id },
      select: { ownerId: true, name: true },
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    if (!admin && project.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Only the project owner or admin can delete this project" }, { status: 403 });
    }

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/projects/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
