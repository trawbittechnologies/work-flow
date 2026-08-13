import Link from "next/link";
import { cn, formatDueDate, isOverdue } from "@/lib/utils";
import type { Task, Project, User } from "@prisma/client";
import { CalendarDays, AlertCircle } from "lucide-react";
import { ProjectIcon } from "@/components/ui/ProjectIcon";

type TaskItem = Task & {
  project: Pick<Project, "id" | "name" | "icon">;
  assignee: Pick<User, "id" | "name" | "avatar"> | null;
};

interface DashboardTaskListProps {
  tasks: TaskItem[];
}

export function DashboardTaskList({ tasks }: DashboardTaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-2xl px-6 py-10 text-center card-shadow">
        <p className="text-sm font-semibold text-text-muted">No pending tasks. You&apos;re all caught up! 🎉</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-2xl card-shadow overflow-hidden divide-y divide-border-subtle">
      {tasks.map((task) => {
        const overdue = task.dueDate ? isOverdue(task.dueDate) : false;
        return (
          <Link
            key={task.id}
            href={`/tasks/${task.id}`}
            className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-surface-alt/60 transition-colors group"
          >
            {/* Priority indicator pill */}
            <div
              className={cn(
                "w-1 h-8 rounded-full flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity",
                task.priority === "URGENT" && "bg-red-500",
                task.priority === "HIGH" && "bg-orange-500",
                task.priority === "MEDIUM" && "bg-indigo-500",
                task.priority === "LOW" && "bg-slate-400"
              )}
            />

            {/* Title + project */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-primary truncate group-hover:text-primary transition-colors tracking-tight">
                {task.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs font-medium text-text-muted truncate flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center h-4 w-4 rounded bg-surface-alt border border-border text-[8px] text-text-secondary">
                    <ProjectIcon name={task.project.icon} className="h-3 w-3" />
                  </span>
                  {task.project.name}
                </p>
                {task.assignee && (
                  <>
                    <span className="text-text-muted/40">•</span>
                    <div className="flex items-center gap-1">
                      <div className="h-4 w-4 rounded-full overflow-hidden bg-indigo-500 text-white text-[8px] flex items-center justify-center font-bold">
                        {task.assignee.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-text-secondary truncate max-w-[90px]">
                        {task.assignee.name}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Due date */}
            {task.dueDate && (
              <span
                className={cn(
                  "flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border",
                  overdue
                    ? "text-red-600 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800"
                    : "text-text-muted bg-surface-alt border-border-subtle"
                )}
              >
                {overdue ? <AlertCircle className="h-3 w-3 text-red-500" /> : <CalendarDays className="h-3 w-3" />}
                {formatDueDate(task.dueDate)}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
