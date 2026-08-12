import Link from "next/link";
import { cn, formatDueDate, isOverdue } from "@/lib/utils";
import { PriorityBadge } from "@/components/ui/Badge";
import type { Task, Project, User } from "@prisma/client";
import { CalendarDays, AlertCircle } from "lucide-react";

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
      <div className="bg-surface border border-border rounded-xl px-6 py-10 text-center shadow-sm">
        <p className="text-sm font-medium text-text-muted">No pending tasks. You're all caught up! 🎉</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden divide-y divide-border-subtle">
      {tasks.map((task, i) => {
        const overdue = task.dueDate ? isOverdue(task.dueDate) : false;
        return (
          <Link
            key={task.id}
            href={`/tasks/${task.id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-surface-alt transition-colors group"
          >
            {/* Priority indicator */}
            <div
              className={cn(
                "w-1 h-8 rounded-full flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity",
                task.priority === "URGENT" && "bg-danger",
                task.priority === "HIGH" && "bg-warning",
                task.priority === "MEDIUM" && "bg-primary",
                task.priority === "LOW" && "bg-text-muted"
              )}
            />

            {/* Title + project */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors">{task.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-text-muted truncate flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center h-4 w-4 rounded bg-surface-alt border border-border text-[8px]">
                    {task.project.icon}
                  </span>
                  {task.project.name}
                </p>
                {task.assignee && (
                  <>
                    <span className="text-border-subtle">•</span>
                    <div className="flex items-center gap-1">
                      <div className="h-4 w-4 rounded-full overflow-hidden bg-surface-alt border border-border text-[8px] flex items-center justify-center text-text-muted font-bold">
                        {task.assignee.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs text-text-secondary truncate max-w-[80px]">{task.assignee.name}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Due date */}
            {task.dueDate && (
              <span
                className={cn(
                  "flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded",
                  overdue ? "text-danger bg-danger-subtle" : "text-text-muted bg-surface-alt"
                )}
              >
                {overdue ? <AlertCircle className="h-3 w-3" /> : <CalendarDays className="h-3 w-3" />}
                {formatDueDate(task.dueDate)}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
