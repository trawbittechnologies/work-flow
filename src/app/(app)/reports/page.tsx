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
          <h1 className="text-xl sm:text-2xl font-black font-display uppercase tracking-tight text-[#071A49]">
            Analytics &amp; Reports
          </h1>
          <p className="text-xs sm:text-[13px] font-medium text-[#586274] mt-0.5">
            Measure project velocity, team output, and resource allocation.
          </p>
        </div>
      </div>

      {isEmpty ? (
        <div className="bg-white border border-[#DDE2D8] rounded-[2px] p-10 shadow-xs flex flex-col items-center justify-center text-center bg-tech-grid">
          <BarChart2 className="h-12 w-12 text-[#8E99A8] mb-4 stroke-[1.5]" />
          <p className="text-base font-bold uppercase font-display text-[#071A49]">No data yet</p>
          <p className="text-sm text-[#586274] mt-1">
            Create projects and complete tasks to see analytics here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <div className="bg-white border border-[#DDE2D8] rounded-[2px] p-4 sm:p-5 shadow-xs">
            <p className="text-xs font-mono font-bold uppercase text-[#586274]">Task Completion Rate</p>
            <h3 className="text-xl sm:text-2xl font-black font-display text-[#071A49] mt-1">{completionRate}%</h3>
            <p className="text-xs font-mono font-bold text-[#16A34A] mt-1 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              {completedTasks} of {totalTasks} tasks done
            </p>
          </div>

          <div className="bg-white border border-[#DDE2D8] rounded-[2px] p-4 sm:p-5 shadow-xs">
            <p className="text-xs font-mono font-bold uppercase text-[#586274]">Project Completion</p>
            <h3 className="text-xl sm:text-2xl font-black font-display text-[#071A49] mt-1">{projectCompletion}%</h3>
            <p className="text-xs font-mono font-bold text-[#16A34A] mt-1 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              {completedProjects} of {totalProjects} projects complete
            </p>
          </div>

          <div className="bg-white border border-[#DDE2D8] rounded-[2px] p-4 sm:p-5 shadow-xs">
            <p className="text-xs font-mono font-bold uppercase text-[#586274]">Workspace Members</p>
            <h3 className="text-xl sm:text-2xl font-black font-display text-[#071A49] mt-1">{totalMembers}</h3>
            <p className="text-xs font-mono font-bold text-[#7C3AED] mt-1">
              {totalMembers === 1 ? "Just you so far" : `${totalMembers} active members`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
