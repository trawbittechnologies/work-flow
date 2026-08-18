import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Calendar" };

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  const monthName = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // First day of month and total days
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const totalDays = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  // Fetch tasks with due dates this month
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

  const dueTasks = await prisma.task.findMany({
    where: {
      assigneeId: userId,
      dueDate: { gte: monthStart, lte: monthEnd },
    },
    select: { id: true, title: true, dueDate: true, status: true },
  });

  // Group tasks by day
  const tasksByDay: Record<number, typeof dueTasks> = {};
  for (const task of dueTasks) {
    if (task.dueDate) {
      const d = new Date(task.dueDate).getDate();
      if (!tasksByDay[d]) tasksByDay[d] = [];
      tasksByDay[d].push(task);
    }
  }

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  // Build calendar grid (leading empty cells + days)
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  // Pad to full rows
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-5 sm:space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display uppercase tracking-tight text-[#071A49]">
            Calendar &amp; Schedule
          </h1>
          <p className="text-xs sm:text-[13px] font-medium text-[#586274] mt-0.5">
            Keep track of project milestones, sprint deadlines, and team meetings.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-white border border-[#DDE2D8] rounded-[2px] p-1 shadow-xs">
            <button className="p-1 hover:bg-[#F0F2EC] rounded-[2px] text-[#586274] cursor-pointer" title="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2.5 text-xs font-mono font-bold text-[#071A49]">{monthName}</span>
            <button className="p-1 hover:bg-[#F0F2EC] rounded-[2px] text-[#586274] cursor-pointer" title="Next month">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button className="inline-flex items-center gap-1.5 sm:gap-2 h-9 px-3 sm:px-4 text-xs font-mono font-bold uppercase rounded-[2px] bg-[#071A49] hover:bg-[#041030] text-[#B7D600] transition-colors shadow-2xs cursor-pointer">
            <Plus className="h-4 w-4" /> <span>Add Event</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#DDE2D8] rounded-[2px] p-3.5 sm:p-6 shadow-xs overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-px border-b border-[#DDE2D8] pb-2.5 mb-2.5 text-center">
          {days.map((day) => (
            <span key={day} className="text-[11px] sm:text-xs font-mono font-bold uppercase text-[#071A49]">
              {day}
            </span>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {cells.map((d, i) => {
            if (d === null) {
              return <div key={`empty-${i}`} className="min-h-[58px] sm:min-h-[90px]" />;
            }
            const isToday = d === today;
            const tasks = tasksByDay[d] || [];
            return (
              <div
                key={d}
                className={`min-h-[58px] sm:min-h-[90px] p-1 sm:p-2.5 rounded-[2px] border transition-all flex flex-col ${
                  isToday
                    ? "border-[#071A49] bg-[#F1F8CE]/50"
                    : "border-[#DDE2D8] bg-[#F8F9F6] hover:border-[#071A49]"
                }`}
              >
                <span
                  className={`text-[10px] sm:text-xs font-mono font-bold ${
                    isToday
                      ? "h-5 w-5 sm:h-6 sm:w-6 rounded-[2px] bg-[#071A49] text-[#B7D600] flex items-center justify-center"
                      : "text-[#586274]"
                  }`}
                >
                  {d}
                </span>
                {tasks.slice(0, 2).map((task) => (
                  <div
                    key={task.id}
                    title={task.title}
                    className={`mt-1 p-0.5 sm:p-1 text-[8px] sm:text-[9px] font-mono font-bold rounded-[2px] truncate border ${
                      task.status === "DONE" || task.status === "COMPLETED"
                        ? "bg-[#ECFDF5] text-[#16A34A] border-emerald-200"
                        : "bg-[#F1F8CE] text-[#071A49] border-[#B7D600]"
                    }`}
                  >
                    {task.title}
                  </div>
                ))}
                {tasks.length > 2 && (
                  <div className="mt-0.5 text-[8px] font-mono text-[#8E99A8] font-medium">
                    +{tasks.length - 2} more
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {dueTasks.length === 0 && (
        <div className="bg-white border border-[#DDE2D8] rounded-[2px] p-6 shadow-xs flex items-center gap-3">
          <CalendarDays className="h-8 w-8 text-[#8E99A8] flex-shrink-0" />
          <div>
            <p className="text-sm font-bold uppercase font-display text-[#071A49]">No tasks due this month</p>
            <p className="text-xs text-[#586274] mt-0.5">Assign due dates to tasks and they&apos;ll appear on the calendar</p>
          </div>
        </div>
      )}
    </div>
  );
}
