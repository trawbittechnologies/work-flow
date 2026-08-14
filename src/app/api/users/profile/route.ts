import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/users/profile — update current user's designation, avatar, onboardingComplete
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { designation, avatar, onboardingComplete } = body;

    const updateData: Record<string, unknown> = {};
    if (designation !== undefined) updateData.designation = designation.trim();
    if (avatar !== undefined) updateData.avatar = avatar;
    if (onboardingComplete !== undefined) updateData.onboardingComplete = onboardingComplete;

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        designation: true,
        role: true,
        onboardingComplete: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PATCH /api/users/profile]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/users/profile — get current user profile
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        designation: true,
        role: true,
        onboardingComplete: true,
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("[GET /api/users/profile]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
