import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { CalendarRange, Calendar } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Project Timeline" };

type PageProps = { params: Promise<{ projectId: string }> };

const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  IN_REVIEW: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-200",
  DONE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
};

const PRIORITY_BAR_COLORS: Record<string, string> = {
  CRITICAL: "bg-red-700",
  URGENT: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-amber-400",
  LOW: "bg-slate-400",
};

export default async function ProjectTimelinePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { projectId } = await params;

  const isMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: session.user.id } },
  });
  if (!isMember) notFound();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { startDate: true, deadline: true, name: true },
  });

  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: {
      assignee: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
  });

  const tasksWithDueDate = tasks.filter((t) => t.dueDate);
  const tasksWithoutDueDate = tasks.filter((t) => !t.dueDate);

  // Group tasks by month
  const byMonth = tasksWithDueDate.reduce<Record<string, typeof tasksWithDueDate>>(
    (acc, task) => {
      const month = new Date(task.dueDate!).toLocaleDateString("en-US", { year: "numeric", month: "long" });
      if (!acc[month]) acc[month] = [];
      acc[month].push(task);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
          <CalendarRange className="h-5 w-5 text-primary" /> Timeline
        </h2>
        <p className="text-xs text-text-muted mt-0.5">
          {tasksWithDueDate.length} of {tasks.length} tasks have due dates
          {project?.startDate && ` · Started ${formatDate(project.startDate)}`}
          {project?.deadline && ` · Deadline ${formatDate(project.deadline)}`}
        </p>
      </div>

      {tasksWithDueDate.length === 0 && tasksWithoutDueDate.length === 0 ? (
        <div className="bg-surface border border-border border-dashed rounded-xl px-6 py-12 text-center">
          <CalendarRange className="h-8 w-8 text-text-muted mx-auto mb-3" />
          <p className="text-sm font-semibold text-text-primary">No tasks yet</p>
          <p className="text-xs text-text-muted mt-1">Create tasks with due dates to see them on the timeline.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Timeline by Month */}
          {Object.entries(byMonth).map(([month, monthTasks]) => (
            <div key={month}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-text-primary">{month}</h3>
                </div>
                <div className="flex-1 h-px bg-border-subtle" />
                <span className="text-xs text-text-muted">{monthTasks.length} task{monthTasks.length !== 1 ? "s" : ""}</span>
              </div>

              <div className="space-y-2">
                {monthTasks.map((task) => {
                  const overdue = task.dueDate && task.status !== "DONE" && isOverdue(task.dueDate);
                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-center gap-4 bg-surface border rounded-[12px] px-4 py-3 hover:bg-background transition-colors group relative overflow-hidden",
                        overdue ? "border-red-200 dark:border-red-800" : "border-border"
                      )}
                    >
                      {/* Priority color bar */}
                      <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-[12px]", PRIORITY_BAR_COLORS[task.priority])} />

                      <div className="ml-2 flex-1 min-w-0">
                        <p className={cn("text-sm font-semibold truncate", task.status === "DONE" ? "line-through text-text-muted" : "text-text-primary")}>
                          {task.title}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded uppercase", STATUS_COLORS[task.status])}>
                          {task.status.replace("_", " ")}
                        </span>
                        <span className={cn(
                          "text-xs font-medium",
                          overdue ? "text-red-500 font-semibold" : "text-text-muted"
                        )}>
                          {formatDate(task.dueDate)} {overdue && "⚠"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Tasks without due dates */}
          {tasksWithoutDueDate.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-sm font-semibold text-text-muted">No Due Date</h3>
                <div className="flex-1 h-px bg-border-subtle" />
                <span className="text-xs text-text-muted">{tasksWithoutDueDate.length} task{tasksWithoutDueDate.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="space-y-2">
                {tasksWithoutDueDate.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 bg-surface border border-dashed border-border rounded-[12px] px-4 py-3 opacity-60"
                  >
                    <p className="text-sm text-text-secondary truncate flex-1">{task.title}</p>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded uppercase", STATUS_COLORS[task.status])}>
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
