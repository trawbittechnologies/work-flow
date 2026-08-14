import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/role";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();

  if (!q) return NextResponse.json({ success: true, data: { projects: [], tasks: [], users: [] } });

  try {
    const userId = session.user.id;
    const admin = await isAdmin(userId);

    const [projects, tasks, users] = await Promise.all([
      prisma.project.findMany({
        where: {
          ...(admin
            ? {}
            : {
                OR: [
                  { members: { some: { userId } } },
                  { ownerId: userId },
                  { leadId: userId },
                  { tasks: { some: { assigneeId: userId } } },
                ],
              }),
          AND: [
            {
              OR: [
                { name: { contains: q, mode: "insensitive" as const } },
                { description: { contains: q, mode: "insensitive" as const } },
              ],
            },
          ],
        },
        select: { id: true, name: true, description: true, icon: true, status: true },
        take: 5,
      }),

      prisma.task.findMany({
        where: {
          ...(admin ? {} : { assigneeId: userId }),
          AND: [
            {
              OR: [
                { title: { contains: q, mode: "insensitive" as const } },
                { description: { contains: q, mode: "insensitive" as const } },
              ],
            },
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
