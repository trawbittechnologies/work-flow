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
  IN_PROGRESS: "bg-blue-500",
  IN_REVIEW: "bg-violet-500",
  DONE: "bg-emerald-500",
};

export function KanbanColumn({ id, title, tasks, onAddTask, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col bg-surface-alt/50 border border-border rounded-2xl p-3 min-w-[280px] w-full max-w-[340px] flex-shrink-0 transition-colors",
        isOver && "border-primary bg-primary-subtle/50"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1 border-b border-border-subtle mb-3">
        <div className="flex items-center gap-2.5">
          <span className={cn("h-2.5 w-2.5 rounded-full", columnHeaderColors[id])} />
          <h3 className="text-sm font-bold text-text-primary tracking-tight">
            {title}
          </h3>
          <span className="h-5 px-2 rounded-full bg-surface border border-border text-[11px] font-bold text-text-secondary flex items-center justify-center shadow-sm">
            {tasks.length}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-text-muted hover:text-text-primary hover:bg-surface"
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
          <div className="h-28 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-xs font-medium text-text-muted bg-surface/50">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
