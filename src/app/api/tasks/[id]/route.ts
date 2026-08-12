import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateTaskSchema } from "@/lib/validations/task";
import { logActivity } from "@/lib/activity";
import { createNotification } from "@/lib/notifications";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/tasks/[id]
export async function GET(_req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        createdBy: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true, icon: true } },
        labels: { include: { label: true } },
        comments: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { comments: true } },
      },
    });

    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    // Verify user is a project member
    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId: session.user.id } },
    });
    if (!isMember) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error("[GET /api/tasks/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/tasks/[id]
export async function PATCH(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: existingTask.projectId, userId: session.user.id } },
    });
    if (!isMember) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const body = await req.json();
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const { title, description, assigneeId, priority, status, dueDate, labelIds } = parsed.data;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description }),
        ...(assigneeId !== undefined && { assigneeId }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
        ...(labelIds !== undefined && {
          labels: {
            deleteMany: {},
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

    const project = await prisma.project.findUnique({
      where: { id: task.projectId },
      select: { name: true },
    });

    // Log status changes
    if (status && status !== existingTask.status) {
      await logActivity({
        projectId: task.projectId,
        userId: session.user.id,
        type: "TASK_STATUS_CHANGED",
        metadata: { taskId: id, taskTitle: task.title, from: existingTask.status, to: status },
      });

      if (status === "DONE" && task.assigneeId && task.assigneeId !== session.user.id) {
        await createNotification({
          userId: task.assigneeId,
          type: "TASK_COMPLETED",
          title: "Task completed",
          message: `"${task.title}" was marked as done`,
          projectId: task.projectId,
          taskId: id,
        });
      }
    }

    // Log priority changes
    if (priority && priority !== existingTask.priority) {
      await logActivity({
        projectId: task.projectId,
        userId: session.user.id,
        type: "TASK_PRIORITY_CHANGED",
        metadata: { taskId: id, taskTitle: task.title, from: existingTask.priority, to: priority },
      });
    }

    // Notify new assignee
    if (
      assigneeId !== undefined &&
      assigneeId !== null &&
      assigneeId !== existingTask.assigneeId &&
      assigneeId !== session.user.id
    ) {
      await logActivity({
        projectId: task.projectId,
        userId: session.user.id,
        type: "TASK_ASSIGNED",
        metadata: { taskId: id, taskTitle: task.title, assigneeId },
      });

      await createNotification({
        userId: assigneeId,
        type: "TASK_ASSIGNED",
        title: "Task assigned to you",
        message: `You were assigned "${task.title}" in ${project?.name}`,
        projectId: task.projectId,
        taskId: id,
      });
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error("[PATCH /api/tasks/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId: session.user.id } },
    });
    if (!isMember) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    // Only task creator or project owner can delete
    const isOwner = await prisma.project.findUnique({
      where: { id: task.projectId, ownerId: session.user.id },
    });

    if (task.createdById !== session.user.id && !isOwner) {
      return NextResponse.json({ error: "You can only delete tasks you created" }, { status: 403 });
    }

    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/tasks/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
