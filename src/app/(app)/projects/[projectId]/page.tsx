import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DashboardTaskList } from "@/components/dashboard/DashboardTaskList";
import { AvatarGroup } from "@/components/ui/Avatar";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Project Overview" };

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectOverviewPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
      },
      tasks: {
        include: {
          project: { select: { id: true, name: true, icon: true } },
          assignee: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
      activities: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        take: 8,
      },
    },
  });

  if (!project) notFound();

  const userId = session.user.id;
  const isMember = project.members.some((m) => m.userId === userId);
  if (!isMember) notFound();

  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((t) => t.status === "DONE").length;
  const inProgressTasks = project.tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const overdueTasks = project.tasks.filter(
    (t) => t.status !== "DONE" && t.dueDate && new Date(t.dueDate) < new Date()
  ).length;

  const recentTasks = project.tasks.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Tasks" value={totalTasks} color="indigo" />
        <StatCard label="In Progress" value={inProgressTasks} color="blue" />
        <StatCard label="Completed Tasks" value={completedTasks} color="emerald" />
        <StatCard label="Overdue Tasks" value={overdueTasks} color="red" />
      </div>

      {/* Grid Layout for Tasks & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-6">
          {/* Recent Tasks */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Recent Tasks
              </h2>
              <div className="flex items-center gap-3">
                <Link
                  href={`/projects/${projectId}/tasks`}
                  className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
            <DashboardTaskList tasks={recentTasks} />
          </section>

          {/* Quick Actions / Team */}
          <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[14px] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Project Team</h3>
                <p className="text-xs text-[var(--text-secondary)]">{project.members.length} team members active</p>
              </div>
              <Link
                href={`/projects/${projectId}/team`}
                className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-[8px] bg-[var(--primary-subtle)] text-[var(--primary)] font-medium hover:bg-[var(--primary)] hover:text-white transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Manage Team
              </Link>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {project.members.map((m) => (
                <div key={m.id} className="flex items-center gap-2 bg-[var(--background)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-[8px]">
                  <span className="text-xs font-medium text-[var(--text-primary)]">{m.user.name}</span>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase bg-[var(--surface)] px-1.5 py-0.5 rounded border border-[var(--border)] font-semibold">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Activity Feed Sidebar */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Activity Feed
            </h2>
            <Link
              href={`/projects/${projectId}/activity`}
              className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ActivityFeed activities={project.activities} />
        </section>
      </div>
    </div>
  );
}
