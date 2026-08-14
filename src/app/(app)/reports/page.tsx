import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TrendingUp, BarChart2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [totalTasks, completedTasks, totalProjects, completedProjects, totalMembers] =
    await Promise.all([
      prisma.task.count({ where: { assigneeId: userId } }),
      prisma.task.count({ where: { assigneeId: userId, status: "DONE" } }),
      prisma.project.count({ where: { members: { some: { userId } } } }),
      prisma.project.count({ where: { members: { some: { userId } }, status: "COMPLETED" } }),
      prisma.user.count({ where: { isActive: true } }),
    ]);

  const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : "0";
  const projectCompletion = totalProjects > 0 ? ((completedProjects / totalProjects) * 100).toFixed(1) : "0";
  const isEmpty = totalTasks === 0 && totalProjects === 0;

  return (
    <div className="space-y-5 sm:space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#111827]">
            Analytics &amp; Reports
          </h1>
          <p className="text-xs sm:text-[13px] font-medium text-[#6B7280] mt-0.5">
            Measure project velocity, team output, and resource allocation.
          </p>
        </div>
      </div>

      {isEmpty ? (
        <div className="bg-white border border-[#EAEDF2] rounded-2xl p-10 shadow-2xs flex flex-col items-center justify-center text-center">
          <BarChart2 className="h-12 w-12 text-[#D1D5DB] mb-4 stroke-[1.5]" />
          <p className="text-base font-bold text-[#9CA3AF]">No data yet</p>
          <p className="text-sm text-[#C4C9D4] mt-1">
            Create projects and complete tasks to see analytics here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <div className="bg-white border border-[#EAEDF2] rounded-2xl p-4 sm:p-5 shadow-2xs">
            <p className="text-xs font-semibold text-[#6B7280]">Task Completion Rate</p>
            <h3 className="text-xl sm:text-2xl font-black text-[#111827] mt-1">{completionRate}%</h3>
            <p className="text-xs font-semibold text-[#16A34A] mt-1 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              {completedTasks} of {totalTasks} tasks done
            </p>
          </div>

          <div className="bg-white border border-[#EAEDF2] rounded-2xl p-4 sm:p-5 shadow-2xs">
            <p className="text-xs font-semibold text-[#6B7280]">Project Completion</p>
            <h3 className="text-xl sm:text-2xl font-black text-[#111827] mt-1">{projectCompletion}%</h3>
            <p className="text-xs font-semibold text-[#16A34A] mt-1 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              {completedProjects} of {totalProjects} projects complete
            </p>
          </div>

          <div className="bg-white border border-[#EAEDF2] rounded-2xl p-4 sm:p-5 shadow-2xs">
            <p className="text-xs font-semibold text-[#6B7280]">Workspace Members</p>
            <h3 className="text-xl sm:text-2xl font-black text-[#111827] mt-1">{totalMembers}</h3>
            <p className="text-xs font-semibold text-[#7C3AED] mt-1">
              {totalMembers === 1 ? "Just you so far" : `${totalMembers} active members`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
