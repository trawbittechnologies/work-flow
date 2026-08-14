import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, Plus } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Board" };

export default async function BoardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [todo, inProgress, inReview, done] = await Promise.all([
    prisma.task.count({ where: { assigneeId: userId, status: "TODO" } }),
    prisma.task.count({ where: { assigneeId: userId, status: "IN_PROGRESS" } }),
    prisma.task.count({ where: { assigneeId: userId, status: "IN_REVIEW" } }),
    prisma.task.count({ where: { assigneeId: userId, status: "DONE" } }),
  ]);

  const columns = [
    { title: "To Do", count: todo, color: "bg-[#9CA3AF]" },
    { title: "In Progress", count: inProgress, color: "bg-[#F59E0B]" },
    { title: "In Review", count: inReview, color: "bg-[#7C3AED]" },
    { title: "Done", count: done, color: "bg-[#88C315]" },
  ];

  const total = todo + inProgress + inReview + done;

  return (
    <div className="space-y-5 sm:space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#111827]">
            Kanban Board
          </h1>
          <p className="text-xs sm:text-[13px] font-medium text-[#6B7280] mt-0.5">
            {total === 0
              ? "No tasks assigned yet — create a task to get started"
              : `${total} task${total !== 1 ? "s" : ""} across ${columns.filter((c) => c.count > 0).length} column${columns.filter((c) => c.count > 0).length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/tasks"
          className="inline-flex items-center justify-center gap-2 h-9 px-4 text-xs font-bold rounded-xl bg-[#88C315] hover:bg-[#77AB12] text-white transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> New Task
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {columns.map((col) => (
          <div
            key={col.title}
            className="bg-[#F8F9FA] border border-[#EAEDF2] rounded-2xl p-4 min-h-[360px] sm:min-h-[450px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                <h3 className="text-xs sm:text-sm font-bold text-[#111827]">{col.title}</h3>
              </div>
              <span className="text-xs font-bold text-[#6B7280] bg-white px-2 py-0.5 rounded-md border border-[#E5E7EB]">
                {col.count}
              </span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#D1D5DB] rounded-xl bg-white/50">
              <LayoutGrid className="h-7 w-7 sm:h-8 sm:w-8 text-[#9CA3AF] mb-2 stroke-[1.5]" />
              <p className="text-xs font-medium text-[#6B7280]">
                {col.count === 0
                  ? "No tasks here"
                  : `${col.count} task${col.count !== 1 ? "s" : ""} — open a project board`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
