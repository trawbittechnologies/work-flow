"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import type { TaskWithDetails } from "@/types";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  id: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  title: string;
  tasks: TaskWithDetails[];
  onAddTask?: () => void;
  onTaskClick?: (task: TaskWithDetails) => void;
}

const columnHeaderColors: Record<string, string> = {
  TODO: "bg-slate-500",
  IN_PROGRESS: "bg-blue-500",
  REVIEW: "bg-violet-500",
  DONE: "bg-emerald-500",
};

export function KanbanColumn({ id, title, tasks, onAddTask, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col bg-[var(--background)] border border-[var(--border)] rounded-[14px] p-3 min-w-[280px] w-full max-w-[340px] flex-shrink-0 transition-colors",
        isOver && "border-[var(--primary)] bg-[var(--primary-subtle)]/30"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1 border-b border-[var(--border-subtle)] mb-3">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", columnHeaderColors[id])} />
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
            {title}
          </h3>
          <span className="h-5 px-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[10px] font-semibold text-[var(--text-muted)] flex items-center justify-center">
            {tasks.length}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onAddTask}
          aria-label={`Add task to ${title}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Task List container */}
      <div className="flex-1 space-y-2.5 overflow-y-auto min-h-[350px]">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick?.(task)} />
        ))}

        {tasks.length === 0 && (
          <div className="h-24 border border-dashed border-[var(--border)] rounded-[10px] flex items-center justify-center text-[11px] text-[var(--text-muted)]">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
