import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

// PATCH /api/notifications/[id] — mark as read
export async function PATCH(_req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.notification.update({ where: { id }, data: { isRead: true } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/notifications/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
