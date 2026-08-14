import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const timeLog = await prisma.timeLog.findUnique({ where: { id } });
    if (!timeLog) return NextResponse.json({ error: "Time log not found" }, { status: 404 });
    if (timeLog.userId !== session.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await req.json();
    const { endTime, duration, description } = body;

    const updatedLog = await prisma.timeLog.update({
      where: { id },
      data: {
        endTime: endTime ? new Date(endTime) : undefined,
        duration: duration !== undefined ? duration : undefined,
        description: description !== undefined ? description : undefined,
      },
      include: {
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ success: true, data: updatedLog });
  } catch (error) {
    console.error("[PATCH /api/time-logs/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const timeLog = await prisma.timeLog.findUnique({ where: { id } });
    if (!timeLog) return NextResponse.json({ error: "Time log not found" }, { status: 404 });
    if (timeLog.userId !== session.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    await prisma.timeLog.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/time-logs/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
