import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Users,
  Calendar,
  ChevronDown,
} from "lucide-react";
import type { Metadata } from "next";

import { StatCard } from "@/components/dashboard/StatCard";
import { ProjectProgressChart } from "@/components/dashboard/ProjectProgressChart";
import { TasksOverviewChart } from "@/components/dashboard/TasksOverviewChart";
import { RecentProjectsList } from "@/components/dashboard/RecentProjectsList";
import { RecentActivityList } from "@/components/dashboard/RecentActivityList";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  const userName = user?.name || "Athul Krishna";

  return (
    <div className="space-y-6 pb-12">
      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#111827]">
            Dashboard
          </h1>
          <p className="text-[13px] font-medium text-[#6B7280] mt-0.5">
            Welcome back, {userName} 👋
          </p>
        </div>

        {/* Date Filter Button */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#374151] hover:bg-[#F9FAFB] shadow-2xs transition-colors cursor-pointer">
            <Calendar className="h-4 w-4 text-[#6B7280]" />
            <span>May 12 - May 18, 2025</span>
            <ChevronDown className="h-3.5 w-3.5 text-[#9CA3AF]" />
          </button>
        </div>
      </div>

      {/* Row 1: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          label="Total Projects"
          value={12}
          icon={<FolderKanban className="h-6 w-6 text-[#88C315]" />}
          iconBg="bg-[#F3F9DE]"
          trendText="2 new this week"
          trendType="positive"
          showArrow={true}
        />
        <StatCard
          label="Tasks Completed"
          value={34}
          icon={<CheckCircle2 className="h-6 w-6 text-[#10B981]" />}
          iconBg="bg-[#ECFDF5]"
          trendText="+12% from last week"
          trendType="positive"
          showArrow={true}
        />
        <StatCard
          label="In Progress"
          value={18}
          icon={<Clock className="h-6 w-6 text-[#F59E0B]" />}
          iconBg="bg-[#FFFBEB]"
          trendText="3 behind schedule"
          trendType="negative"
          showArrow={false}
        />
        <StatCard
          label="Team Members"
          value={24}
          icon={<Users className="h-6 w-6 text-[#9333EA]" />}
          iconBg="bg-[#F3E8FF]"
          trendText="2 new members"
          trendType="positive"
          showArrow={true}
        />
      </div>

      {/* Row 2: Charts (Project Progress + Tasks Overview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ProjectProgressChart />
        </div>
        <div className="lg:col-span-5">
          <TasksOverviewChart />
        </div>
      </div>

      {/* Row 3: Lists (Recent Projects + Recent Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentProjectsList />
        <RecentActivityList />
      </div>
    </div>
  );
}
