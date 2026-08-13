"use client";

import { useDroppable } from "@dnd-kit/core";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import type { TaskWithDetails } from "@/types";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  id: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  title: string;
  tasks: TaskWithDetails[];
  onAddTask?: () => void;
  onTaskClick?: (task: TaskWithDetails) => void;
}

const columnHeaderColors: Record<string, string> = {
  TODO: "bg-slate-500",
  IN_PROGRESS: "bg-[#0A1237]",
  IN_REVIEW: "bg-purple-600",
  DONE: "bg-[#C3D946]",
};

export function KanbanColumn({ id, title, tasks, onAddTask, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col bg-surface-alt/60 border border-border rounded-2xl p-3.5 min-w-[280px] w-full max-w-[340px] flex-shrink-0 transition-all",
        isOver && "border-[#C3D946] bg-[#F3F8D7]/60 glow-lime"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1 border-b border-border-subtle mb-3">
        <div className="flex items-center gap-2.5">
          <span className={cn("h-2.5 w-2.5 rounded-full", columnHeaderColors[id])} />
          <h3 className="text-sm font-black text-[#0A1237] dark:text-white tracking-tight">
            {title}
          </h3>
          <span className="h-5 px-2.5 rounded-full bg-[#0A1237] text-[#C3D946] text-[11px] font-black flex items-center justify-center shadow-xs">
            {tasks.length}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-text-muted hover:text-[#0A1237] hover:bg-surface"
          onClick={onAddTask}
          aria-label={`Add task to ${title}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Task List container */}
      <div className="flex-1 space-y-3 overflow-y-auto min-h-[400px]">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick?.(task)} />
        ))}

        {tasks.length === 0 && (
          <div className="h-28 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-xs font-bold text-text-muted bg-surface/40">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
