"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { TaskModal } from "@/components/tasks/TaskModal";
import { TaskDrawer } from "@/components/tasks/TaskDrawer";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import type { TaskWithDetails } from "@/types";
import { useToast } from "@/components/ui/Toast";

export default function ProjectBoardPage() {
  const routeParams = useParams();
  const projectId = (routeParams?.projectId as string) || "";
  const { error: showError } = useToast();
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [members, setMembers] = useState<Array<{ id: string; user: { id: string; name: string; avatar?: string | null } }>>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultStatus, setModalDefaultStatus] = useState<string>("PENDING");
  const [drawerTaskId, setDrawerTaskId] = useState<string | null>(null);

  async function loadData() {
    try {
      const [tasksRes, membersRes] = await Promise.all([
        fetch(`/api/tasks?projectId=${projectId}`),
        fetch(`/api/projects/${projectId}/members`),
      ]);

      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(data.data || data.tasks || []);
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
    let isMounted = true;
    const fetchBoardData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/tasks?projectId=${projectId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setTasks(data.data || data.tasks || []);
        }
        const memRes = await fetch(`/api/projects/${projectId}/members`);
        if (memRes.ok) {
          const data = await memRes.json();
          if (isMounted) setMembers(data.data || []);
        }
      } catch {
        if (isMounted) showError("Error", "Could not load board tasks.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBoardData();
    return () => {
      isMounted = false;
    };
  }, [projectId, showError]);

  function handleOpenModalWithStatus(status: string) {
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
