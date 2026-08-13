"use client";

import { useState, useEffect, use } from "react";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { TaskModal } from "@/components/tasks/TaskModal";
import { TaskDrawer } from "@/components/tasks/TaskDrawer";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import type { TaskWithDetails } from "@/types";
import { useToast } from "@/components/ui/Toast";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default function ProjectBoardPage({ params }: PageProps) {
  const { projectId } = use(params);
  const { error: showError } = useToast();
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultStatus, setModalDefaultStatus] = useState<"TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE">("TODO");
  const [drawerTaskId, setDrawerTaskId] = useState<string | null>(null);

  async function loadData() {
    try {
      const [tasksRes, membersRes] = await Promise.all([
        fetch(`/api/tasks?projectId=${projectId}`),
        fetch(`/api/projects/${projectId}/members`),
      ]);

      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(data.data || []);
      }
      if (membersRes.ok) {
        const data = await membersRes.json();
        setMembers(data.data || []);
      }
    } catch {
      showError("Error", "Could not load board tasks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [projectId]);

  function handleOpenModalWithStatus(status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE") {
    setModalDefaultStatus(status);
    setIsModalOpen(true);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">Kanban Board</h2>
          <p className="text-xs text-[var(--text-muted)]">Drag & drop tasks to update progress</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="h-3.5 w-3.5" />}
          onClick={() => handleOpenModalWithStatus("TODO")}
        >
          Add Task
        </Button>
      </div>

      {/* Board */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-96 w-full rounded-[14px]" />
          ))}
        </div>
      ) : (
        <KanbanBoard
          initialTasks={tasks}
          projectId={projectId}
          onAddTask={handleOpenModalWithStatus}
          onTaskClick={(task) => setDrawerTaskId(task.id)}
        />
      )}

      {/* Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={projectId}
        members={members}
        defaultStatus={modalDefaultStatus}
        onTaskCreated={loadData}
      />

      <TaskDrawer
        taskId={drawerTaskId}
        isOpen={!!drawerTaskId}
        onClose={() => setDrawerTaskId(null)}
        onTaskUpdated={loadData}
        onTaskDeleted={loadData}
      />
    </div>
  );
}
