import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { isAdmin } from "@/lib/role";

type RouteParams = { params: Promise<{ id: string }> };

// PATCH /api/projects/[id]/lead — assign or change project lead
export async function PATCH(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const admin = await isAdmin(session.user.id);
    const ownerMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: session.user.id } },
    });

    if (!admin && (!ownerMember || ownerMember.role !== "OWNER")) {
      return NextResponse.json({ error: "Only project owners can assign a lead" }, { status: 403 });
    }

    const { leadId } = await req.json();

    if (leadId) {
      // Verify lead is a project member
      const leadMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: id, userId: leadId } },
      });
      if (!leadMember) {
        return NextResponse.json({ error: "Lead must be a project member" }, { status: 400 });
      }
    }

    const project = await prisma.project.update({
      where: { id },
      data: { leadId: leadId ?? null },
      include: {
        lead: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    await logActivity({
      projectId: id,
      userId: session.user.id,
      type: "PROJECT_LEAD_CHANGED",
      metadata: { leadId: leadId ?? null },
    });

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("[PATCH /api/projects/[id]/lead]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/projects/[id]/lead — remove project lead
export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const admin = await isAdmin(session.user.id);
    const ownerMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: session.user.id } },
    });

    if (!admin && (!ownerMember || ownerMember.role !== "OWNER")) {
      return NextResponse.json({ error: "Only project owners can remove the lead" }, { status: 403 });
    }

    await prisma.project.update({ where: { id }, data: { leadId: null } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/projects/[id]/lead]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
