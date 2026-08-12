"use client";

import { cn, formatDueDate, isOverdue } from "@/lib/utils";
import { PriorityBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import type { TaskWithDetails } from "@/types";
import { CalendarDays, MessageSquare } from "lucide-react";

interface TaskCardProps {
  task: TaskWithDetails;
  onClick?: () => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  const overdue = task.dueDate ? isOverdue(task.dueDate) : false;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group bg-surface border border-border rounded-xl p-4 shadow-sm cursor-pointer select-none",
        "hover:border-primary/40 hover:shadow-md transition-all duration-200 relative",
        isDragging && "opacity-70 ring-2 ring-primary shadow-xl scale-105"
      )}
    >
      {/* Priority accent bar */}
      <div
        className={cn(
          "absolute left-0 top-4 bottom-4 w-1 rounded-r-full opacity-80 group-hover:opacity-100 transition-opacity",
          task.priority === "URGENT" && "bg-danger",
          task.priority === "HIGH" && "bg-warning",
          task.priority === "MEDIUM" && "bg-primary",
          task.priority === "LOW" && "bg-text-muted"
        )}
      />

      <div className="pl-3 space-y-3">
        {/* Title */}
        <h4 className="text-sm font-semibold text-text-primary leading-snug group-hover:text-primary transition-colors">
          {task.title}
        </h4>

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {task.labels.map(({ label }: { label: { id: string; name: string; color: string } }) => (
              <span
                key={label.id}
                style={{ backgroundColor: `${label.color}15`, color: label.color, borderColor: `${label.color}40` }}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md border"
              >
                {label.name}
              </span>
            ))}
          </div>
        )}

        {/* Metadata Footer */}
        <div className="flex items-center justify-between pt-2 mt-1 border-t border-border-subtle text-[11px] font-medium text-text-muted">
          <div className="flex items-center gap-2.5">
            <PriorityBadge priority={task.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT"} showDot={false} className="text-[10px] px-1.5 py-0.5" />

            {task.dueDate && (
              <span className={cn("flex items-center gap-1.5 rounded px-1.5 py-0.5", overdue ? "text-danger bg-danger-subtle" : "bg-surface-alt")}>
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDueDate(task.dueDate)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {task._count?.comments > 0 && (
              <span className="flex items-center gap-1 text-xs">
                <MessageSquare className="h-3.5 w-3.5" />
                {task._count.comments}
              </span>
            )}

            {task.assignee ? (
              <Avatar name={task.assignee.name} src={task.assignee.avatar} size="xs" className="ring-0" />
            ) : (
              <div className="h-6 w-6 rounded-full border border-dashed border-border bg-surface-alt flex items-center justify-center text-[10px] text-text-muted">
                ?
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
