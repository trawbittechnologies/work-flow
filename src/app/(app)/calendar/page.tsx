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
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#111827]">
            Calendar &amp; Schedule
          </h1>
          <p className="text-xs sm:text-[13px] font-medium text-[#6B7280] mt-0.5">
            Keep track of project milestones, sprint deadlines, and team meetings.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-white border border-[#E5E7EB] rounded-xl p-1 shadow-2xs">
            <button className="p-1 hover:bg-[#F3F4F6] rounded-lg text-[#6B7280] cursor-pointer" title="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2.5 text-xs font-bold text-[#111827]">{monthName}</span>
            <button className="p-1 hover:bg-[#F3F4F6] rounded-lg text-[#6B7280] cursor-pointer" title="Next month">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button className="inline-flex items-center gap-1.5 sm:gap-2 h-9 px-3 sm:px-4 text-xs font-bold rounded-xl bg-[#88C315] hover:bg-[#77AB12] text-white transition-colors shadow-2xs cursor-pointer">
            <Plus className="h-4 w-4" /> <span>Add Event</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#EAEDF2] rounded-2xl p-3.5 sm:p-6 shadow-2xs overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-px border-b border-[#EAEDF2] pb-2.5 mb-2.5 text-center">
          {days.map((day) => (
            <span key={day} className="text-[11px] sm:text-xs font-bold text-[#6B7280]">
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
                className={`min-h-[58px] sm:min-h-[90px] p-1 sm:p-2.5 rounded-xl border transition-all flex flex-col ${
                  isToday
                    ? "border-[#88C315] bg-[#F3F9DE]/40"
                    : "border-[#EAEDF2] bg-[#FAFAFB] hover:border-[#D1D5DB]"
                }`}
              >
                <span
                  className={`text-[10px] sm:text-xs font-bold ${
                    isToday
                      ? "h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-[#88C315] text-white flex items-center justify-center"
                      : "text-[#4B5563]"
                  }`}
                >
                  {d}
                </span>
                {tasks.slice(0, 2).map((task) => (
                  <div
                    key={task.id}
                    title={task.title}
                    className={`mt-1 p-0.5 sm:p-1 text-[8px] sm:text-[10px] font-bold rounded truncate ${
                      task.status === "DONE"
                        ? "bg-[#ECFDF5] text-[#059669]"
                        : "bg-[#F3F9DE] text-[#659A08]"
                    }`}
                  >
                    {task.title}
                  </div>
                ))}
                {tasks.length > 2 && (
                  <div className="mt-0.5 text-[8px] text-[#9CA3AF] font-medium">
                    +{tasks.length - 2} more
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {dueTasks.length === 0 && (
        <div className="bg-white border border-[#EAEDF2] rounded-2xl p-6 shadow-2xs flex items-center gap-3">
          <CalendarDays className="h-8 w-8 text-[#D1D5DB] flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#9CA3AF]">No tasks due this month</p>
            <p className="text-xs text-[#C4C9D4] mt-0.5">Assign due dates to tasks and they&apos;ll appear on the calendar</p>
          </div>
        </div>
      )}
    </div>
  );
}
