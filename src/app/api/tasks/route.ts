import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTaskSchema } from "@/lib/validations/task";
import { logActivity } from "@/lib/activity";
import { createNotification } from "@/lib/notifications";

// GET /api/tasks — my tasks or tasks by project
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId");
  const assigneeId = url.searchParams.get("assigneeId");
  const status = url.searchParams.get("status");
  const priority = url.searchParams.get("priority");
  const myTasks = url.searchParams.get("myTasks") === "true";

  try {
    // If projectId specified, verify membership
    if (projectId) {
      const isMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: session.user.id } },
      });
      if (!isMember) return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const tasks = await prisma.task.findMany({
      where: {
        ...(projectId && { projectId }),
        ...(myTasks && { assigneeId: session.user.id }),
        ...(assigneeId && { assigneeId }),
        ...(status && { status: status as never }),
        ...(priority && { priority: priority as never }),
        // If no projectId, only show tasks from projects user belongs to
        ...(!projectId && {
          project: { members: { some: { userId: session.user.id } } },
        }),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        createdBy: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true, icon: true } },
        labels: { include: { label: true } },
        _count: { select: { comments: true } },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error("[GET /api/tasks]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/tasks
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const { title, description, projectId, assigneeId, priority, status, dueDate, labelIds } = parsed.data;

    // Verify user is a member of the project
    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: session.user.id } },
    });
    if (!isMember) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    // Verify assignee is a project member (if specified)
    if (assigneeId) {
      const assigneeMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: assigneeId } },
      });
      if (!assigneeMember) {
        return NextResponse.json({ error: "Assignee is not a member of this project" }, { status: 400 });
      }
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() ?? null,
        projectId,
        assigneeId: assigneeId ?? null,
        createdById: session.user.id,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        ...(labelIds && labelIds.length > 0 && {
          labels: {
            create: labelIds.map((labelId) => ({ labelId })),
          },
        }),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        createdBy: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true, icon: true } },
        labels: { include: { label: true } },
        _count: { select: { comments: true } },
      },
    });

    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { name: true } });

    await logActivity({
      projectId,
      userId: session.user.id,
      type: "TASK_CREATED",
      metadata: { taskId: task.id, taskTitle: task.title },
    });

    // Notify assignee
    if (assigneeId && assigneeId !== session.user.id) {
      await createNotification({
        userId: assigneeId,
        type: "TASK_ASSIGNED",
        title: "Task assigned to you",
        message: `You were assigned "${task.title}" in ${project?.name}`,
        projectId,
        taskId: task.id,
      });
    }

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/tasks]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
