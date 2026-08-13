import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/role";
import { calculateProgress } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, FolderKanban, Users, AlertTriangle, TrendingUp, ShieldCheck } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const admin = await isAdmin(session.user.id);
  if (!admin) redirect("/dashboard");

  const now = new Date();
  const upcomingDeadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    totalProjects,
    activeProjects,
    completedProjects,
    archivedProjects,
    totalMembers,
    pendingTasks,
    overdueTasks,
    recentActivities,
    projectsNeedingAttention,
    allProjects,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: "IN_PROGRESS" } }),
    prisma.project.count({ where: { status: "COMPLETED" } }),
    prisma.project.count({ where: { status: "ARCHIVED" } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.task.count({ where: { status: { not: "DONE" } } }),
    prisma.task.count({ where: { status: { not: "DONE" }, dueDate: { lt: now } } }),
    prisma.activity.findMany({
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    // Projects near deadline or with overdue tasks
    prisma.project.findMany({
      where: {
        status: { not: "COMPLETED" },
        OR: [
          { deadline: { lt: upcomingDeadline } },
          { tasks: { some: { status: { not: "DONE" }, dueDate: { lt: now } } } },
        ],
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        lead: { select: { id: true, name: true, email: true, avatar: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
        tasks: { select: { id: true, status: true } },
        _count: { select: { tasks: true, members: true } },
      },
      take: 4,
    }),
    prisma.project.findMany({
      where: { status: { not: "ARCHIVED" } },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        lead: { select: { id: true, name: true, email: true, avatar: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
        tasks: { select: { id: true, status: true } },
        _count: { select: { tasks: true, members: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
  ]);

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Admin Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Workspace Overview</h1>
          <p className="text-sm font-medium text-text-secondary mt-1">Full visibility across all projects and members</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/members"
            className="inline-flex items-center gap-2 h-9 px-4 text-sm rounded-lg border border-border bg-surface hover:bg-surface-alt text-text-primary font-semibold transition-colors"
          >
            <Users className="h-4 w-4" /> Members
          </Link>
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-2 h-9 px-4 text-sm rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold transition-colors shadow-sm"
          >
            <FolderKanban className="h-4 w-4" /> All Projects
          </Link>
        </div>
      </div>

      {/* Stats */}
      <section>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Workspace Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          <StatCard label="Total Projects" value={totalProjects} color="indigo" />
          <StatCard label="Active Projects" value={activeProjects} color="blue" />
          <StatCard label="Total Members" value={totalMembers} color="emerald" />
          <StatCard label="Overdue Tasks" value={overdueTasks} color="red" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <StatCard label="Completed Projects" value={completedProjects} color="emerald" />
          <StatCard label="Archived Projects" value={archivedProjects} color="amber" />
          <StatCard label="Pending Tasks" value={pendingTasks} color="amber" />
          <StatCard label="On Track" value={activeProjects - (projectsNeedingAttention?.length ?? 0)} color="indigo" />
        </div>
      </section>

      {/* Projects Needing Attention */}
      {projectsNeedingAttention.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Needs Attention ({projectsNeedingAttention.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectsNeedingAttention.map((project) => {
              const completedTasks = project.tasks.filter((t) => t.status === "DONE").length;
              const totalTasks = project.tasks.length;
              const progress = calculateProgress(completedTasks, totalTasks);
              return (
                <ProjectCard
                  key={project.id}
                  project={{ ...project, progress, completedTasks, totalTasks }}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Projects + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold tracking-tight text-text-primary flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Recent Projects
            </h2>
            <Link
              href="/admin/projects"
              className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary transition-colors"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allProjects.map((project) => {
              const completedTasks = project.tasks.filter((t) => t.status === "DONE").length;
              const totalTasks = project.tasks.length;
              const progress = calculateProgress(completedTasks, totalTasks);
              return (
                <ProjectCard
                  key={project.id}
                  project={{ ...project, progress, completedTasks, totalTasks }}
                />
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold tracking-tight text-text-primary">Recent Activity</h2>
          </div>
          <ActivityFeed activities={recentActivities} />
        </section>
      </div>
    </div>
  );
}
