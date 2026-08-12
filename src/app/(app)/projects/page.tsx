import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { calculateProgress } from "@/lib/utils";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
      },
      tasks: { select: { id: true, status: true } },
      _count: { select: { tasks: true, members: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const withProgress = projects.map((p) => {
    const completedTasks = p.tasks.filter((t) => t.status === "DONE").length;
    const totalTasks = p.tasks.length;
    return { ...p, progress: calculateProgress(completedTasks, totalTasks), completedTasks, totalTasks };
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Projects</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-1.5 h-9 px-3.5 text-sm rounded-[10px] bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      {withProgress.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to get started with your team."
          action={
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 text-sm rounded-[10px] bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create project
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {withProgress.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
