"use client";

import { useState, useEffect } from "react";
import { TaskTable } from "@/components/tasks/TaskTable";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { CheckSquare, Search } from "lucide-react";
import type { TaskWithDetails } from "@/types";
import { useToast } from "@/components/ui/Toast";

export default function MyTasksPage() {
  const { error: showError } = useToast();
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  useEffect(() => {
    let ignore = false;
    async function loadTasks() {
      try {
        const res = await fetch("/api/tasks?myTasks=true");
        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setTasks(data.data || []);
          }
        }
      } catch {
        if (!ignore) {
          showError("Error", "Could not load assigned tasks.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    loadTasks();
    return () => {
      ignore = true;
    };
  }, [showError]);

  async function handleStatusChange(taskId: string, newStatus: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE") {
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
    const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">My Tasks</h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Tasks assigned to you across all active projects
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--surface)] border border-[var(--border)] p-3 rounded-[12px]">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search my tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs rounded-[8px] border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-[var(--text-primary)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2.5 text-xs rounded-[8px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)]"
          >
            <option value="ALL">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-8 px-2.5 text-xs rounded-[8px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)]"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Table view */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-[10px]" />
          ))}
        </div>
      ) : filteredTasks.length > 0 ? (
        <TaskTable tasks={filteredTasks} onStatusChange={handleStatusChange} />
      ) : (
        <EmptyState
          icon={CheckSquare}
          title="No tasks assigned"
          description={search ? "No tasks matching your current filter." : "You have no pending task assignments."}
        />
      )}
    </div>
  );
}
