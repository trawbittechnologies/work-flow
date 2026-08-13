import { prisma } from "@/lib/prisma";

export type ActivityType =
  | "PROJECT_CREATED"
  | "PROJECT_EDITED"
  | "PROJECT_STATUS_CHANGED"
  | "PROJECT_LEAD_CHANGED"
  | "MEMBER_ADDED"
  | "MEMBER_REMOVED"
  | "TASK_CREATED"
  | "TASK_ASSIGNED"
  | "TASK_REASSIGNED"
  | "TASK_STATUS_CHANGED"
  | "TASK_PRIORITY_CHANGED"
  | "TASK_COMPLETED"
  | "COMMENT_ADDED"
  | "FILE_UPLOADED"
  | "ANNOUNCEMENT_POSTED";

interface LogActivityInput {
  projectId: string;
  userId: string;
  type: ActivityType;
  metadata?: Record<string, unknown>;
}

export async function logActivity(input: LogActivityInput) {
  try {
    await prisma.activity.create({
      data: {
        projectId: input.projectId,
        userId: input.userId,
        type: input.type as any,
        metadata: (input.metadata ?? {}) as any,
      },
    });
  } catch (error) {
    console.error("[activity] Failed to log activity:", error);
  }
}
