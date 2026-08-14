"use client";

import { useDroppable } from "@dnd-kit/core";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import type { TaskWithDetails } from "@/types";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: TaskWithDetails[];
  onAddTask?: () => void;
  onTaskClick?: (task: TaskWithDetails) => void;
}

const columnHeaderColors: Record<string, string> = {
  PENDING: "bg-[#F59E0B]",
  TODO: "bg-[#F59E0B]",
  IN_PROGRESS: "bg-[#88C315]",
  TESTING: "bg-[#06B6D4]",
  ON_HOLD: "bg-[#9CA3AF]",
  IN_REVIEW: "bg-[#7C3AED]",
  REVIEW: "bg-[#7C3AED]",
  COMPLETED: "bg-[#10B981]",
  DONE: "bg-[#10B981]",
  REOPENED: "bg-[#F97316]",
  CANCELLED: "bg-[#EF4444]",
};

export function KanbanColumn({ id, title, tasks, onAddTask, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col bg-[#F8F9FA] border border-[#EAEDF2] rounded-2xl p-3.5 w-[82vw] sm:w-[300px] lg:w-[320px] max-w-[340px] shrink-0 snap-center transition-all",
        isOver && "border-[#88C315] bg-[#F3F9DE]/50"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1 border-b border-[#EAEDF2] mb-3">
        <div className="flex items-center gap-2">
          <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", columnHeaderColors[id])} />
          <h3 className="text-xs sm:text-sm font-black text-[#111827] tracking-tight">
            {title}
          </h3>
          <span className="h-5 px-2 rounded-full bg-white border border-[#E5E7EB] text-[#6B7280] text-[11px] font-bold flex items-center justify-center shadow-2xs">
            {tasks.length}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-[#9CA3AF] hover:text-[#111827] hover:bg-white cursor-pointer"
          onClick={onAddTask}
          aria-label={`Add task to ${title}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Task List container */}
      <div className="flex-1 space-y-3 overflow-y-auto min-h-[380px]">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick?.(task)} />
        ))}

        {tasks.length === 0 && (
          <div className="h-28 border-2 border-dashed border-[#D1D5DB] rounded-xl flex items-center justify-center text-xs font-bold text-[#9CA3AF] bg-white/40">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
