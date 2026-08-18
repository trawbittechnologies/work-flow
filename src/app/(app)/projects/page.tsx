import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { calculateProgress } from "@/lib/utils";
import { ProjectsTable } from "@/components/projects/ProjectsTable";
import { isAdmin } from "@/lib/role";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const admin = await isAdmin(userId);

  const projects = await prisma.project.findMany({
    where: admin
      ? undefined
      : {
          OR: [
            { members: { some: { userId } } },
            { ownerId: userId },
            { leadId: userId },
            { tasks: { some: { assigneeId: userId } } },
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
        where: admin ? undefined : { assigneeId: userId },
        select: { id: true, status: true },
      },
      _count: { select: { tasks: true, members: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const withProgress = projects.map((p) => {
    const completedTasks = p.tasks.filter(
      (t) => (t.status as string) === "DONE" || (t.status as string) === "COMPLETED"
    ).length;
    const totalTasks = p.tasks.length;
    return {
      ...p,
      progress: calculateProgress(completedTasks, totalTasks),
      completedTasks,
      totalTasks,
    };
  });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black font-display uppercase tracking-tight text-[#071A49]">
          Workspace Projects
        </h1>
        <p className="text-[13px] font-medium text-[#586274] mt-0.5">
          Manage project roadmaps, track team progress, and update status instantly.
        </p>
      </div>

      <ProjectsTable initialProjects={withProgress} isAdminUser={admin} />
    </div>
  );
}
