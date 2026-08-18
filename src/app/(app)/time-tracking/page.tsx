import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TimeTrackingDashboard } from "./TimeTrackingDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Time Tracking" };

export default async function TimeTrackingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // Fetch initial data for the dashboard
  const [timeLogs, projects, tasks] = await Promise.all([
    prisma.timeLog.findMany({
      where: { userId },
      include: {
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { startTime: "desc" },
    }),
    prisma.project.findMany({
      where: { members: { some: { userId } } },
      select: { id: true, name: true },
    }),
    prisma.task.findMany({
      where: { assigneeId: userId, status: { not: "DONE" } },
      select: { id: true, title: true, projectId: true },
    }),
  ]);

  return (
    <div className="space-y-5 sm:space-y-6 pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-black font-display uppercase tracking-tight text-[#071A49]">
          Time Tracking
        </h1>
        <p className="text-xs sm:text-[13px] font-medium text-[#586274] mt-0.5">
          Record billable hours, monitor task time, and boost productivity.
        </p>
      </div>

      <TimeTrackingDashboard
        initialLogs={timeLogs}
        projects={projects}
        tasks={tasks}
      />
    </div>
  );
}
