import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Get all conversations the user is a member of
    const conversations = await prisma.conversation.findMany({
      where: {
        members: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          }
        },
        project: {
          select: { id: true, name: true, icon: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await request.json();
    const { type, name, projectId, memberIds } = body;

    // Validate members
    if (!memberIds || !Array.isArray(memberIds)) {
      return NextResponse.json({ error: "Invalid members" }, { status: 400 });
    }
    
    // Ensure current user is in the members list
    const allMembers = Array.from(new Set([...memberIds, userId]));

    // Check if a direct conversation already exists between these 2 users
    if (type === "DIRECT" && allMembers.length === 2) {
      const existing = await prisma.conversation.findFirst({
        where: {
          type: "DIRECT",
          AND: [
            { members: { some: { userId: allMembers[0] } } },
            { members: { some: { userId: allMembers[1] } } }
          ]
        },
        include: {
           members: true
        }
      });
      // if it has exactly 2 members, return it
      if (existing && existing.members.length === 2) {
        return NextResponse.json(existing);
      }
    }

    const conversation = await prisma.conversation.create({
      data: {
        type,
        name,
        projectId,
        members: {
          create: allMembers.map(id => ({ userId: id }))
        }
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, avatar: true } }
          }
        }
      }
    });

    // Notify other member when a new direct conversation is started
    if (type === "DIRECT" && allMembers.length === 2) {
      const senderUser = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, avatar: true } });
      const targetUserId = allMembers.find((id) => id !== userId);
      if (targetUserId && senderUser) {
        createNotification({
          userId: targetUserId,
          type: "MESSAGE",
          title: `New Direct Message`,
          message: `${senderUser.name} started a direct message conversation with you`,
          link: `/chat?conversationId=${conversation.id}`,
          senderAvatar: senderUser.avatar || undefined,
        }).catch((err) => console.error("[notifications] DM creation error:", err));
      }
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
