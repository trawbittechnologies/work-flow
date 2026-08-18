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
        "flex flex-col bg-[#F8F9F6] border border-[#DDE2D8] rounded-[2px] p-3.5 w-[82vw] sm:w-[300px] lg:w-[320px] max-w-[340px] shrink-0 snap-center transition-all",
        isOver && "border-[#071A49] bg-[#F1F8CE]/50"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1 border-b border-[#DDE2D8] mb-3">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-[2px] shrink-0", columnHeaderColors[id])} />
          <h3 className="text-xs sm:text-sm font-black font-display uppercase tracking-tight text-[#071A49]">
            {title}
          </h3>
          <span className="h-5 px-1.5 rounded-[2px] bg-white border border-[#DDE2D8] text-[#071A49] text-[10px] font-mono font-bold flex items-center justify-center shadow-2xs">
            {tasks.length}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-[#8E99A8] hover:text-[#071A49] hover:bg-white cursor-pointer rounded-[2px]"
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
          <div className="h-28 border border-dashed border-[#DDE2D8] rounded-[2px] flex items-center justify-center text-xs font-mono font-bold text-[#8E99A8] bg-white/40">
            DROP TASKS HERE
          </div>
        )}
      </div>
    </div>
  );
}
