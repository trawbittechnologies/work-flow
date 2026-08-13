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

interface KanbanBoardProps {
  initialTasks: TaskWithDetails[];
  projectId: string;
  onAddTask?: (status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE") => void;
  onTaskClick?: (task: TaskWithDetails) => void;
}

const COLUMNS: Array<{ id: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE"; title: string }> = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "IN_REVIEW", title: "In Review" },
  { id: "DONE", title: "Done" },
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
    const newStatus = over.id as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

    const currentTask = tasks.find((t) => t.id === taskId);
    if (!currentTask || currentTask.status === newStatus) return;

    const previousStatus = currentTask.status;

    // Optimistic Update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
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
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start min-h-[550px] scrollbar-thin">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
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
