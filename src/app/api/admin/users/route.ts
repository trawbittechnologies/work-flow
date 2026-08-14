import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/role";

// GET /api/admin/users — list all workspace users
export async function GET() {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            projectMembships: true,
            assignedTasks: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("[GET /api/admin/users]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/users — create a new user (admin only)
export async function POST(req: Request) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { name, email, password, role, designation } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "name, email, and password are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 409 });

    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        passwordHash,
        role: role === "ADMIN" ? "ADMIN" : "MEMBER",
        designation: designation ? designation.trim() : undefined,
        onboardingComplete: false,
      },
      select: { id: true, name: true, email: true, role: true, designation: true, isActive: true, createdAt: true },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/users]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
