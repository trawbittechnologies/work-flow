import { prisma } from "@/lib/prisma";
import type { ActivityType, Prisma } from "@prisma/client";

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
        type: input.type,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonObject,
      },
    });
  } catch (error) {
    console.error("[activity] Failed to log activity:", error);
  }
}
