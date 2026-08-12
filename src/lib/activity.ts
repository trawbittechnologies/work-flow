import { prisma } from "@/lib/prisma";

interface LogActivityInput {
  projectId: string;
  userId: string;
  type: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity(input: LogActivityInput) {
  try {
    await prisma.activity.create({
      data: {
        projectId: input.projectId,
        userId: input.userId,
        type: input.type,
        metadata: JSON.stringify(input.metadata ?? {}),
      },
    });
  } catch (error) {
    console.error("[activity] Failed to log activity:", error);
  }
}
