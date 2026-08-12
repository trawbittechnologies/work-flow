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
        "group bg-[var(--surface)] border border-[var(--border)] rounded-[10px] p-3.5 shadow-xs cursor-pointer select-none",
        "hover:border-[var(--primary)] hover:shadow-md transition-all duration-150 relative",
        isDragging && "opacity-50 ring-2 ring-[var(--primary)] shadow-lg"
      )}
    >
      {/* Priority accent bar */}
      <div
        className={cn(
          "absolute left-0 top-3 bottom-3 w-1 rounded-r-full",
          task.priority === "URGENT" && "bg-red-500",
          task.priority === "HIGH" && "bg-orange-500",
          task.priority === "MEDIUM" && "bg-amber-500",
          task.priority === "LOW" && "bg-slate-300"
        )}
      />

      <div className="pl-2 space-y-2.5">
        {/* Title */}
        <h4 className="text-xs font-semibold text-[var(--text-primary)] leading-snug group-hover:text-[var(--primary)] transition-colors">
          {task.title}
        </h4>

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.labels.map(({ label }: { label: { id: string; name: string; color: string } }) => (
              <span
                key={label.id}
                style={{ backgroundColor: `${label.color}15`, color: label.color, borderColor: `${label.color}40` }}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded border"
              >
                {label.name}
              </span>
            ))}
          </div>
        )}

        {/* Metadata Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={task.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT"} showDot={false} className="text-[9px] px-1 py-0" />

            {task.dueDate && (
              <span className={cn("flex items-center gap-1", overdue ? "text-red-500 font-medium" : "")}>
                <CalendarDays className="h-3 w-3" />
                {formatDueDate(task.dueDate)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {task._count?.comments > 0 && (
              <span className="flex items-center gap-0.5 text-[10px]">
                <MessageSquare className="h-3 w-3" />
                {task._count.comments}
              </span>
            )}

            {task.assignee ? (
              <Avatar name={task.assignee.name} src={task.assignee.avatar} size="xs" className="ring-0" />
            ) : (
              <div className="h-5 w-5 rounded-full border border-dashed border-[var(--border)] flex items-center justify-center text-[9px] text-[var(--text-muted)]">
                ?
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
