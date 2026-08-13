import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publishEvent } from "@/lib/ably";
import { createNotification } from "@/lib/notifications";

export async function GET(request: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = 30;

    const { conversationId } = await params;

    // Verify membership
    const membership = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id
        }
      }
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1 // skip the cursor itself
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true }
        },
        attachments: true,
        mentions: {
          include: { user: { select: { id: true, name: true } } }
        },
        reactions: {
          include: { user: { select: { id: true, name: true } } }
        },
        replyTo: {
           include: { sender: { select: { id: true, name: true } } }
        }
      }
    });

    let nextCursor: string | null = null;
    if (messages.length > limit) {
      const nextItem = messages.pop();
      nextCursor = nextItem!.id;
    }

    return NextResponse.json({
      messages: messages.reverse(), // return in chronological order for UI
      nextCursor
    });

  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { conversationId } = await params;

    // Verify membership
    const membership = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      }
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { content, type, replyToId, projectId, taskId, attachments, mentions } = body;

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: content || "",
        type: type || "TEXT",
        replyToId,
        projectId,
        taskId,
        attachments: {
          create: attachments || []
        },
        mentions: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          create: (mentions || []).map((m: any) => ({ userId: m.userId }))
        }
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true }
        },
        attachments: true,
        mentions: {
          include: { user: { select: { id: true, name: true } } }
        },
        reactions: true,
        replyTo: {
           include: { sender: { select: { id: true, name: true } } }
        }
      }
    });

    // Update conversation's updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    // Publish to Ably
    await publishEvent(`conversation:${conversationId}`, "message.created", message);

    // Send Push & DB Notification to offline/other members
    const otherMembers = await prisma.conversationMember.findMany({
      where: { conversationId, userId: { not: userId } },
      select: { userId: true }
    });

    const senderName = message.sender?.name || "Someone";
    const previewText = message.content ? message.content.slice(0, 100) : "Sent an attachment";

    for (const m of otherMembers) {
      createNotification({
        userId: m.userId,
        type: "MESSAGE",
        title: `New message from ${senderName}`,
        message: previewText,
        link: `/chat?conversationId=${conversationId}`,
      }).catch((err) => console.error("[notifications] Message notification error:", err));
    }

    return NextResponse.json(message);

  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
