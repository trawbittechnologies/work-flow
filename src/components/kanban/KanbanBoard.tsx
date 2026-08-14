"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "@/components/tasks/TaskCard";
import type { TaskWithDetails } from "@/types";
import { useToast } from "@/components/ui/Toast";

import { TaskStatusType } from "@/components/tasks/TaskStatusSelect";

interface KanbanBoardProps {
  initialTasks: TaskWithDetails[];
  projectId: string;
  onAddTask?: (status: TaskStatusType | string) => void;
  onTaskClick?: (task: TaskWithDetails) => void;
}

const COLUMNS: Array<{ id: TaskStatusType; title: string }> = [
  { id: "PENDING", title: "Pending" },
  { id: "IN_PROGRESS", title: "Progressing" },
  { id: "TESTING", title: "Testing" },
  { id: "ON_HOLD", title: "Hold" },
  { id: "IN_REVIEW", title: "Review" },
  { id: "COMPLETED", title: "Complete" },
  { id: "REOPENED", title: "Re-Open" },
  { id: "CANCELLED", title: "Cancel" },
];

export function KanbanBoard({ initialTasks, projectId, onAddTask, onTaskClick }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<TaskWithDetails[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<TaskWithDetails | null>(null);
  const { error: showError } = useToast();

  const [prevInitialTasks, setPrevInitialTasks] = useState(initialTasks);
  if (prevInitialTasks !== initialTasks) {
    setPrevInitialTasks(initialTasks);
    setTasks(initialTasks);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatusType;

    const currentTask = tasks.find((t) => t.id === taskId);
    if (!currentTask || currentTask.status === newStatus) return;

    const previousStatus = currentTask.status;

    // Optimistic Update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? ({ ...t, status: newStatus as any }) : t))
    );

    // API update call
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        // Revert only affected task on failure
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: previousStatus } : t))
        );
        showError("Failed to move task", "Changes were reverted.");
      }
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: previousStatus } : t))
      );
      showError("Connection error", "Failed to update task status.");
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 items-start min-h-[550px] scrollbar-thin snap-x snap-mandatory">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => {
            if (col.id === "PENDING") return t.status === "PENDING" || t.status === "TODO";
            if (col.id === "COMPLETED") return t.status === "COMPLETED" || t.status === "DONE";
            if (col.id === "IN_REVIEW") return t.status === "IN_REVIEW" || (t.status as string) === "REVIEW";
            return t.status === col.id;
          });
          return (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={colTasks}
              onAddTask={() => onAddTask?.(col.id)}
              onTaskClick={onTaskClick}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="transform rotate-2 scale-105 shadow-2xl transition-transform">
            <TaskCard task={activeTask} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
