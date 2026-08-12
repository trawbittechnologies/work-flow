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
import { ArrowRight, Plus } from "lucide-react";
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
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            {greeting()}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            {format(now, "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-1.5 h-7 px-2.5 text-xs rounded-[8px] bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Projects" value={totalProjects} color="indigo" />
        <StatCard label="Active Projects" value={activeProjects} color="blue" />
        <StatCard label="Pending Tasks" value={pendingTasks} color="amber" />
        <StatCard label="Overdue Tasks" value={overdueTasks} color="red" />
      </div>

      {/* Projects */}
      <section aria-labelledby="projects-heading">
        <div className="flex items-center justify-between mb-3">
          <h2 id="projects-heading" className="text-sm font-semibold text-[var(--text-primary)]">
            Active Projects
          </h2>
          <Link
            href="/projects"
            className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
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
          <div className="bg-[var(--surface)] border border-[var(--border)] border-dashed rounded-[12px] px-6 py-10 text-center">
            <p className="text-sm text-[var(--text-muted)] mb-3">No projects yet. Create your first project.</p>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-1.5 h-7 px-2.5 text-xs rounded-[8px] bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Create project
            </Link>
          </div>
        )}
      </section>

      {/* My Tasks + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <section aria-labelledby="tasks-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="tasks-heading" className="text-sm font-semibold text-[var(--text-primary)]">
              My Tasks
            </h2>
            <Link
              href="/tasks"
              className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <DashboardTaskList tasks={myTasks} />
        </section>

        <section aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            Recent Activity
          </h2>
          <ActivityFeed activities={activities} />
        </section>
      </div>
    </div>
  );
}
