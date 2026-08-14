import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProjectSchema } from "@/lib/validations/project";
import { logActivity } from "@/lib/activity";
import { isAdmin } from "@/lib/role";

function generateProjectKey(name: string): string {
  const base = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4);
  const suffix = Math.floor(Math.random() * 900 + 100);
  return `${base || "PRJ"}${suffix}`;
}

// GET /api/projects — get projects (all for admin, assigned for member)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = await isAdmin(session.user.id);

    const projects = await prisma.project.findMany({
      where: admin
        ? undefined // Admin sees all
        : {
            OR: [
              { members: { some: { userId: session.user.id } } },
              { ownerId: session.user.id },
              { leadId: session.user.id },
              { tasks: { some: { assigneeId: session.user.id } } },
            ],
          },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        lead: { select: { id: true, name: true, email: true, avatar: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
        tasks: {
          where: admin ? undefined : { assigneeId: session.user.id },
          select: { id: true, status: true },
        },
        _count: { select: { tasks: true, members: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error("[GET /api/projects]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/projects — create a new project
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, description, icon, status, priority, leadId, startDate, deadline } = parsed.data;

    // Generate unique project key
    let key = generateProjectKey(name);
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.project.findUnique({ where: { key } });
      if (!existing) break;
      key = generateProjectKey(name);
      attempts++;
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() ?? null,
        icon: icon ?? "Clipboard",
        key,
        status: status ?? "PLANNING",
        priority: priority ?? "MEDIUM",
        ownerId: session.user.id,
        leadId: leadId ?? null,
        startDate: startDate ? new Date(startDate) : null,
        deadline: deadline ? new Date(deadline) : null,
        // Auto-add creator as OWNER member
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER",
          },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        lead: { select: { id: true, name: true, email: true, avatar: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
        _count: { select: { tasks: true, members: true } },
      },
    });

    await logActivity({
      projectId: project.id,
      userId: session.user.id,
      type: "PROJECT_CREATED",
      metadata: { projectName: project.name },
    });

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/projects]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
