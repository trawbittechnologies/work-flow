"use client";

import { useState, useEffect, use } from "react";
import { TaskTable } from "@/components/tasks/TaskTable";
import { TaskModal } from "@/components/tasks/TaskModal";
import { Button } from "@/components/ui/Button";
import { Plus, Search, Filter } from "lucide-react";
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
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

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
      showError("Error loading tasks", "Could not fetch project tasks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [projectId]);

  async function handleStatusChange(taskId: string, newStatus: any) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
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
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="DONE">Done</option>
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
        onTaskCreated={loadData}
      />
    </div>
  );
}
