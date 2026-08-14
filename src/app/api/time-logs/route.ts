import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const timeLogs = await prisma.timeLog.findMany({
      where: { userId: session.user.id },
      include: {
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { startTime: "desc" },
    });
    return NextResponse.json({ success: true, data: timeLogs });
  } catch (error) {
    console.error("[GET /api/time-logs]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { projectId, taskId, description, startTime, endTime, duration } = body;

    const timeLog = await prisma.timeLog.create({
      data: {
        userId: session.user.id,
        projectId: projectId || null,
        taskId: taskId || null,
        description: description || null,
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : null,
        duration: duration || null,
      },
      include: {
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ success: true, data: timeLog });
  } catch (error) {
    console.error("[POST /api/time-logs]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
