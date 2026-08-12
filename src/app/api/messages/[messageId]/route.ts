import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publishEvent } from "@/lib/ably";

export async function PATCH(request: Request, { params }: { params: { messageId: string } }) {
  try {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { messageId } = await params;
    const body = await request.json();
    const { content } = body;

    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (message.senderId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { content, editedAt: new Date() },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        attachments: true,
        mentions: { include: { user: { select: { id: true, name: true } } } },
        reactions: { include: { user: { select: { id: true, name: true } } } },
        replyTo: { include: { sender: { select: { id: true, name: true } } } }
      }
    });

    await publishEvent(`conversation:${message.conversationId}`, "message.updated", updated);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { messageId: string } }) {
  try {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { messageId } = await params;
    const message = await prisma.message.findUnique({ where: { id: messageId } });
    
    if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (message.senderId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const deleted = await prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date(), content: "" }, // Soft delete & clear content
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        attachments: true,
        mentions: { include: { user: { select: { id: true, name: true } } } },
        reactions: { include: { user: { select: { id: true, name: true } } } },
        replyTo: { include: { sender: { select: { id: true, name: true } } } }
      }
    });

    await publishEvent(`conversation:${message.conversationId}`, "message.deleted", deleted);
    return NextResponse.json(deleted);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
