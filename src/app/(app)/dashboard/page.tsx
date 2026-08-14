import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";
import type { Metadata } from "next";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProjectProgressChart } from "@/components/dashboard/ProjectProgressChart";
import { TasksOverviewChart } from "@/components/dashboard/TasksOverviewChart";
import { RecentProjectsList } from "@/components/dashboard/RecentProjectsList";
import { RecentActivityList } from "@/components/dashboard/RecentActivityList";
import { isAdmin } from "@/lib/role";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const admin = await isAdmin(userId);

  const projectFilter = admin
    ? undefined
    : {
        OR: [
          { members: { some: { userId } } },
          { ownerId: userId },
          { leadId: userId },
          { tasks: { some: { assigneeId: userId } } },
        ],
      };

  const [user, totalProjects, completedTasks, inProgressTasks, totalMembers, recentActivities, recentProjects] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
      prisma.project.count({ where: projectFilter }),
      prisma.task.count({
        where: {
          ...(admin ? {} : { assigneeId: userId }),
          status: { in: ["DONE", "COMPLETED"] as never },
        },
      }),
      prisma.task.count({
        where: {
          ...(admin ? {} : { assigneeId: userId }),
          status: "IN_PROGRESS",
        },
      }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.activity.findMany({
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.project.findMany({
        where: projectFilter,
        include: {
          tasks: {
            where: admin ? undefined : { assigneeId: userId },
            select: { status: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
    ]);

  const userName = user?.name || "there";

  // Build real stat for task breakdown
  const [todoTasks, inReviewTasks] = await Promise.all([
    prisma.task.count({
      where: {
        ...(admin ? {} : { assigneeId: userId }),
        status: { in: ["TODO", "PENDING"] as never },
      },
    }),
    prisma.task.count({
      where: {
        ...(admin ? {} : { assigneeId: userId }),
        status: { in: ["IN_REVIEW", "REVIEW"] as never },
      },
    }),
  ]);

  const taskStats = {
    completed: completedTasks,
    inProgress: inProgressTasks,
    todo: todoTasks,
    inReview: inReviewTasks,
    total: completedTasks + inProgressTasks + todoTasks + inReviewTasks,
  };

  // Map projects for the list
  const projectItems = recentProjects.map((p) => {
    const total = p.tasks.length;
    const done = p.tasks.filter((t) => (t.status as string) === "DONE" || (t.status as string) === "COMPLETED").length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    return {
      id: p.id,
      name: p.name,
      progress,
      status: p.status,
    };
  });

  // Map activities
  const activityItems = recentActivities.map((a) => ({
    id: a.id,
    userName: a.user.name,
    userAvatar: a.user.avatar,
    type: a.type,
    metadata: a.metadata as Record<string, unknown>,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6 pb-12">
      <DashboardHeader userName={userName} />

      {/* Row 1: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          label="My Projects"
          value={totalProjects}
          icon={<FolderKanban className="h-6 w-6 text-[#88C315]" />}
          iconBg="bg-[#F3F9DE]"
          trendText={totalProjects === 0 ? "No projects yet" : `${totalProjects} active`}
          trendType="positive"
          showArrow={false}
        />
        <StatCard
          label="Tasks Completed"
          value={completedTasks}
          icon={<CheckCircle2 className="h-6 w-6 text-[#10B981]" />}
          iconBg="bg-[#ECFDF5]"
          trendText={completedTasks === 0 ? "No tasks done yet" : "Great progress!"}
          trendType="positive"
          showArrow={false}
        />
        <StatCard
          label="In Progress"
          value={inProgressTasks}
          icon={<Clock className="h-6 w-6 text-[#F59E0B]" />}
          iconBg="bg-[#FFFBEB]"
          trendText={inProgressTasks === 0 ? "Nothing in progress" : `${inProgressTasks} active tasks`}
          trendType={inProgressTasks > 0 ? "positive" : "neutral"}
          showArrow={false}
        />
        <StatCard
          label="Team Members"
          value={totalMembers}
          icon={<Users className="h-6 w-6 text-[#9333EA]" />}
          iconBg="bg-[#F3E8FF]"
          trendText={totalMembers === 1 ? "Just you so far" : `${totalMembers} members`}
          trendType="positive"
          showArrow={false}
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ProjectProgressChart projects={projectItems} />
        </div>
        <div className="lg:col-span-5">
          <TasksOverviewChart stats={taskStats} />
        </div>
      </div>

      {/* Row 3: Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentProjectsList projects={projectItems} />
        <RecentActivityList activities={activityItems} />
      </div>
    </div>
  );
}
