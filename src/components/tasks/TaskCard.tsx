"use client";

import { cn, formatDueDate, isOverdue } from "@/lib/utils";
import { PriorityBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import type { TaskWithDetails } from "@/types";
import { CalendarDays, MessageSquare, CheckSquare } from "lucide-react";

interface TaskCardProps {
  task: TaskWithDetails;
  onClick?: () => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  const overdue = task.dueDate ? isOverdue(task.dueDate) : false;
  // Generate Jira issue key e.g. FD-12 or PROJ-101
  const projectKey = task.project?.key || "FD";
  const issueKey = `${projectKey}-${task.id.slice(-3).toUpperCase()}`;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group bg-white border border-[#DDE2D8] rounded-[2px] p-3.5 shadow-xs cursor-pointer select-none",
        "hover:border-[#071A49] transition-all duration-200 relative",
        isDragging && "opacity-75 ring-2 ring-[#071A49] shadow-xl scale-105"
      )}
    >
      {/* Priority accent bar */}
      <div
        className={cn(
          "absolute left-0 top-3.5 bottom-3.5 w-1 rounded-r-[2px] opacity-90 group-hover:opacity-100 transition-opacity",
          task.priority === "URGENT" && "bg-red-500",
          task.priority === "HIGH" && "bg-orange-500",
          task.priority === "MEDIUM" && "bg-[#B7D600]",
          task.priority === "LOW" && "bg-slate-400"
        )}
      />

      <div className="pl-2.5 space-y-2.5">
        {/* Jira Issue Header: Type icon + Issue Key */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded-[2px] bg-[#071A49] text-[#B7D600] flex items-center justify-center flex-shrink-0" title="Task Issue">
              <CheckSquare className="h-2.5 w-2.5" />
            </div>
            <span className="text-[10px] font-bold font-mono text-[#586274] uppercase tracking-wider bg-[#F0F2EC] px-1.5 py-0.5 rounded-[2px] border border-[#DDE2D8]">
              {issueKey}
            </span>
          </div>
          <PriorityBadge priority={task.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT"} showDot={false} className="text-[9px] px-1.5 py-0" />
        </div>

        {/* Title */}
        <h4 className="text-xs font-bold text-[#071A49] leading-snug group-hover:text-[#041030] transition-colors tracking-tight">
          {task.title}
        </h4>

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.labels.map(({ label }: { label: { id: string; name: string; color: string } }) => (
              <span
                key={label.id}
                style={{ backgroundColor: `${label.color}15`, color: label.color, borderColor: `${label.color}40` }}
                className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-[2px] border"
              >
                {label.name}
              </span>
            ))}
          </div>
        )}

        {/* Metadata Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#DDE2D8] text-[10px] font-bold text-[#586274]">
          <div className="flex items-center gap-2">
            {task.dueDate && (
              <span className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] border font-mono", overdue ? "text-red-700 bg-red-50 border-red-200" : "bg-[#F0F2EC] border-[#DDE2D8] text-[#586274]")}>
                <CalendarDays className="h-3 w-3" />
                {formatDueDate(task.dueDate)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {task._count?.comments > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] font-mono font-bold text-[#586274]">
                <MessageSquare className="h-3 w-3" />
                {task._count.comments}
              </span>
            )}

            {task.assignee ? (
              <Avatar name={task.assignee.name} src={task.assignee.avatar} size="xs" className="ring-1 ring-[#DDE2D8] rounded-[2px]" />
            ) : (
              <div className="h-5 w-5 rounded-[2px] border border-dashed border-[#DDE2D8] bg-[#F0F2EC] flex items-center justify-center text-[9px] text-[#8E99A8] font-bold">
                ?
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
