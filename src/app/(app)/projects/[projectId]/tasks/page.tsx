"use client";

import { useState, useEffect, use } from "react";
import { TaskTable } from "@/components/tasks/TaskTable";
import { TaskModal } from "@/components/tasks/TaskModal";
import { TaskDrawer } from "@/components/tasks/TaskDrawer";
import { Button } from "@/components/ui/Button";
import { Plus, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { CheckSquare } from "lucide-react";
import type { TaskWithDetails } from "@/types";
import { useToast } from "@/components/ui/Toast";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default function ProjectTasksPage({ params }: PageProps) {
  const { projectId } = use(params);
  const { error: showError } = useToast();
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [members, setMembers] = useState<Array<{ id: string; user: { id: string; name: string; avatar?: string | null } }>>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [drawerTaskId, setDrawerTaskId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      try {
        const [tasksRes, membersRes] = await Promise.all([
          fetch(`/api/tasks?projectId=${projectId}`),
          fetch(`/api/projects/${projectId}/members`),
        ]);

        if (tasksRes.ok) {
          const data = await tasksRes.json();
          if (!ignore) setTasks(data.data || []);
        }
        if (membersRes.ok) {
          const data = await membersRes.json();
          if (!ignore) setMembers(data.data || []);
        }
      } catch {
        if (!ignore) showError("Error loading tasks", "Could not fetch project tasks.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchData();
    return () => { ignore = true; };
  }, [projectId, showError]);

  async function reloadData() {
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
      showError("Error loading tasks", "Could not fetch project tasks.");
    }
  }

  async function handleStatusChange(taskId: string, newStatus: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? ({ ...t, status: newStatus as TaskWithDetails["status"] }) : t))
    );

    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const statusStr = t.status as string;
    let matchesStatus = statusFilter === "ALL" || statusStr === statusFilter;
    if (statusFilter === "PENDING") {
      matchesStatus = statusStr === "PENDING" || statusStr === "TODO";
    } else if (statusFilter === "COMPLETED") {
      matchesStatus = statusStr === "COMPLETED" || statusStr === "DONE";
    } else if (statusFilter === "IN_REVIEW") {
      matchesStatus = statusStr === "IN_REVIEW" || statusStr === "REVIEW";
    }
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--surface)] border border-[var(--border)] p-3 rounded-[12px]">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Filter tasks by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs rounded-[8px] border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2.5 text-xs rounded-[8px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)]"
          >
            <option value="ALL">All Statuses</option>
            <option value="IN_PROGRESS">Progressing</option>
            <option value="PENDING">Pending</option>
            <option value="TESTING">Testing</option>
            <option value="ON_HOLD">Hold</option>
            <option value="IN_REVIEW">Review</option>
            <option value="COMPLETED">Complete</option>
            <option value="REOPENED">Re-Open</option>
            <option value="CANCELLED">Cancel</option>
          </select>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="h-3.5 w-3.5" />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Task
        </Button>
      </div>

      {/* Task Content */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-[10px]" />
          ))}
        </div>
      ) : filteredTasks.length > 0 ? (
        <TaskTable
          tasks={filteredTasks}
          onStatusChange={handleStatusChange}
          onTaskClick={(task) => setDrawerTaskId(task.id)}
        />
      ) : (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description={search ? "Try adjusting your search filter." : "Get started by creating a task."}
          action={
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
              Add Task
            </Button>
          }
        />
      )}

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={projectId}
        members={members}
        onTaskCreated={reloadData}
      />

      {/* Task Details Drawer */}
      <TaskDrawer
        taskId={drawerTaskId}
        isOpen={!!drawerTaskId}
        onClose={() => setDrawerTaskId(null)}
        onTaskUpdated={reloadData}
        onTaskDeleted={reloadData}
      />
    </div>
  );
}
