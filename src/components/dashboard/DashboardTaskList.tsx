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
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] px-6 py-8 text-center">
        <p className="text-sm text-[var(--text-muted)]">No pending tasks. You're all caught up! 🎉</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] overflow-hidden">
      {tasks.map((task, i) => {
        const overdue = task.dueDate ? isOverdue(task.dueDate) : false;
        return (
          <Link
            key={task.id}
            href={`/tasks/${task.id}`}
            className={cn(
              "flex items-center gap-3 px-4 py-3 hover:bg-[var(--background)] transition-colors",
              i > 0 && "border-t border-[var(--border-subtle)]"
            )}
          >
            {/* Priority indicator */}
            <div
              className={cn(
                "w-1 h-8 rounded-full flex-shrink-0",
                task.priority === "URGENT" && "bg-red-500",
                task.priority === "HIGH" && "bg-orange-500",
                task.priority === "MEDIUM" && "bg-amber-500",
                task.priority === "LOW" && "bg-slate-300"
              )}
            />

            {/* Title + project */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{task.title}</p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {task.project.icon} {task.project.name}
              </p>
            </div>

            {/* Due date */}
            {task.dueDate && (
              <span
                className={cn(
                  "flex items-center gap-1 text-[11px] flex-shrink-0",
                  overdue ? "text-red-500 font-medium" : "text-[var(--text-muted)]"
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
