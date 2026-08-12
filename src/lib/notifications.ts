import { prisma } from "@/lib/prisma";

export type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_COMPLETED"
  | "TASK_STATUS_CHANGED"
  | "TASK_DUE_SOON"
  | "TASK_OVERDUE"
  | "PROJECT_INVITE"
  | "MENTION"
  | "NEW_PROJECT_MESSAGE";

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  projectId?: string;
  taskId?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type as any,
        title: input.title,
        message: input.message,
        projectId: input.projectId,
        taskId: input.taskId,
      },
    });
  } catch (error) {
    console.error("[notifications] Failed to create notification:", error);
  }
}

export async function createNotificationsForProjectMembers(
  projectId: string,
  excludeUserId: string,
  input: Omit<CreateNotificationInput, "userId" | "projectId">
) {
  try {
    const members = await prisma.projectMember.findMany({
      where: { projectId, userId: { not: excludeUserId } },
      select: { userId: true },
    });

    await prisma.notification.createMany({
      data: members.map((m: { userId: string }) => ({
        userId: m.userId,
        projectId,
        ...input,
        type: input.type as any,
      })),
    });
  } catch (error) {
    console.error("[notifications] Failed to create bulk notifications:", error);
  }
}
