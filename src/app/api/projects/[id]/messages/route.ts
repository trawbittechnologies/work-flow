import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMessageSchema } from "@/lib/validations/message";
import { createNotificationsForProjectMembers } from "@/lib/notifications";
import { publishEvent } from "@/lib/ably";

type RouteParams = { params: Promise<{ id: string }> };

async function getOrCreateProjectConversation(projectId: string) {
  let conv = await prisma.conversation.findFirst({
    where: { projectId, type: "PROJECT" }
  });
  if (!conv) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });
    if (!project) return null;
    conv = await prisma.conversation.create({
      data: {
        type: "PROJECT",
        projectId: project.id,
        name: project.name,
        members: {
          create: project.members.map((m: any) => ({ userId: m.userId }))
        }
      }
    });
  }
  return conv;
}

// GET /api/projects/[id]/messages
export async function GET(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const url = new URL(req.url);
  const cursor = url.searchParams.get("cursor");
  const limit = 50;

  try {
    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: session.user.id } },
    });
    if (!isMember) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const conv = await getOrCreateProjectConversation(id);
    if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const messages = await prisma.message.findMany({
      where: { conversationId: conv.id },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });

    return NextResponse.json({
      success: true,
      data: messages.reverse(),
      nextCursor: messages.length === limit ? messages[0]?.id : null,
    });
  } catch (error) {
    console.error("[GET /api/projects/[id]/messages]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/projects/[id]/messages
export async function POST(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: session.user.id } },
    });
    if (!isMember) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const conv = await getOrCreateProjectConversation(id);
    if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const message = await prisma.message.create({
      data: {
        conversationId: conv.id,
        senderId: session.user.id,
        content: parsed.data.content.trim(),
        projectId: id,
      },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });

    const project = await prisma.project.findUnique({ where: { id }, select: { name: true } });

    await createNotificationsForProjectMembers(id, session.user.id, {
      type: "NEW_PROJECT_MESSAGE",
      title: `New message in ${project?.name}`,
      message: `${message.sender.name}: ${message.content.slice(0, 80)}`,
      taskId: undefined,
    });
    
    await publishEvent(`conversation:${conv.id}`, "message.created", message);

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/projects/[id]/messages]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
