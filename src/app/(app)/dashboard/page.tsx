import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { calculateProgress } from "@/lib/utils";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DashboardTaskList } from "@/components/dashboard/DashboardTaskList";
import Link from "next/link";
import { ArrowRight, Plus, FolderKanban } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const now = new Date();

  const [
    user,
    projects,
    myTasks,
    overdueTasks,
    activities,
    totalProjects,
    activeProjects,
    completedProjects,
    pendingTasks,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    }),
    prisma.project.findMany({
      where: { members: { some: { userId } } },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
        tasks: { select: { id: true, status: true } },
        _count: { select: { tasks: true, members: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.task.findMany({
      where: {
        assigneeId: userId,
        status: { not: "DONE" },
        project: { members: { some: { userId } } },
      },
      include: {
        project: { select: { id: true, name: true, icon: true } },
        assignee: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
      take: 8,
    }),
    prisma.task.count({
      where: {
        assigneeId: userId,
        status: { not: "DONE" },
        dueDate: { lt: now },
        project: { members: { some: { userId } } },
      },
    }),
    prisma.activity.findMany({
      where: { project: { members: { some: { userId } } } },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.project.count({ where: { members: { some: { userId } } } }),
    prisma.project.count({
      where: { members: { some: { userId } }, status: "IN_PROGRESS" },
    }),
    prisma.project.count({
      where: { members: { some: { userId } }, status: "COMPLETED" },
    }),
    prisma.task.count({
      where: { assigneeId: userId, status: { not: "DONE" } },
    }),
  ]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            {greeting()}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm font-medium text-text-secondary mt-1">
            {format(now, "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 h-9 px-4 text-sm rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      {/* Stats */}
      <section aria-label="Your focus">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Your focus</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Overdue Tasks" value={overdueTasks} color="red" />
          <StatCard label="Due Today" value={pendingTasks} color="amber" />
          <StatCard label="Active Projects" value={activeProjects} color="indigo" />
          <StatCard label="Completed Projects" value={completedProjects} color="emerald" />
        </div>
      </section>

      {/* Projects */}
      <section aria-labelledby="projects-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="projects-heading" className="text-lg font-bold tracking-tight text-text-primary">
            Active Projects
          </h2>
          <Link
            href="/projects"
            className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary transition-colors"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => {
              const completedTasks = project.tasks.filter((t) => t.status === "DONE").length;
              const totalTasks = project.tasks.length;
              const progress = calculateProgress(completedTasks, totalTasks);
              return (
                <ProjectCard
                  key={project.id}
                  project={{
                    ...project,
                    progress,
                    completedTasks,
                    totalTasks,
                  }}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-surface border border-border border-dashed rounded-xl px-6 py-12 text-center">
            <div className="h-12 w-12 bg-surface-alt rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
              <FolderKanban className="h-6 w-6 text-text-muted" />
            </div>
            <h3 className="text-base font-semibold text-text-primary mb-1">No projects yet</h3>
            <p className="text-sm text-text-muted mb-4 max-w-sm mx-auto">Create your first project and start organizing your work.</p>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 h-9 px-4 text-sm rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Create project
            </Link>
          </div>
        )}
      </section>

      {/* My Tasks + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
        <section aria-labelledby="tasks-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="tasks-heading" className="text-lg font-bold tracking-tight text-text-primary">
              My Tasks
            </h2>
            <Link
              href="/tasks"
              className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary transition-colors"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <DashboardTaskList tasks={myTasks} />
        </section>

        <section aria-labelledby="activity-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="activity-heading" className="text-lg font-bold tracking-tight text-text-primary">
              Recent Activity
            </h2>
          </div>
          <ActivityFeed activities={activities} />
        </section>
      </div>
    </div>
  );
}
