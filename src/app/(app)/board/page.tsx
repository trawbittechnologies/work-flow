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
          <h1 className="text-xl sm:text-2xl font-black font-display uppercase tracking-tight text-[#071A49]">
            Kanban Board
          </h1>
          <p className="text-xs sm:text-[13px] font-medium text-[#586274] mt-0.5">
            {total === 0
              ? "No tasks assigned yet — create a task to get started"
              : `${total} task${total !== 1 ? "s" : ""} across ${columns.filter((c) => c.count > 0).length} column${columns.filter((c) => c.count > 0).length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/tasks"
          className="inline-flex items-center justify-center gap-2 h-9 px-4 text-xs font-bold font-mono uppercase rounded-[2px] bg-[#071A49] hover:bg-[#041030] text-[#B7D600] transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> New Task
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {columns.map((col) => (
          <div
            key={col.title}
            className="bg-[#F8F9F6] border border-[#DDE2D8] rounded-[2px] p-4 min-h-[360px] sm:min-h-[450px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-[2px] ${col.color}`} />
                <h3 className="text-xs sm:text-sm font-bold font-display uppercase text-[#071A49]">{col.title}</h3>
              </div>
              <span className="text-xs font-mono font-bold text-[#071A49] bg-white px-2 py-0.5 rounded-[2px] border border-[#DDE2D8]">
                {col.count}
              </span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#DDE2D8] rounded-[2px] bg-white/50">
              <LayoutGrid className="h-7 w-7 sm:h-8 sm:w-8 text-[#8E99A8] mb-2 stroke-[1.5]" />
              <p className="text-xs font-medium text-[#586274]">
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
