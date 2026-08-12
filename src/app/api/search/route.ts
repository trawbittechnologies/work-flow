import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();

  if (!q) return NextResponse.json({ success: true, data: { projects: [], tasks: [], users: [] } });

  try {
    const userId = session.user.id;

    const [projects, tasks, users] = await Promise.all([
      prisma.project.findMany({
        where: {
          members: { some: { userId } },
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
          ],
        },
        select: { id: true, name: true, description: true, icon: true, status: true },
        take: 5,
      }),

      prisma.task.findMany({
        where: {
          project: { members: { some: { userId } } },
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          project: { select: { id: true, name: true, icon: true } },
        },
        take: 8,
      }),

      prisma.user.findMany({
        where: {
          projectMembships: {
            some: {
              project: { members: { some: { userId } } },
            },
          },
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
          ],
        },
        select: { id: true, name: true, email: true, avatar: true },
        take: 5,
      }),
    ]);

    return NextResponse.json({ success: true, data: { projects, tasks, users } });
  } catch (error) {
    console.error("[GET /api/search]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
