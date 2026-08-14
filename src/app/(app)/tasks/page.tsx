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

  async function handleStatusChange(taskId: string, newStatus: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? ({ ...t, status: newStatus as any }) : t))
    );

    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    let matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    if (statusFilter === "PENDING") {
      matchesStatus = t.status === "PENDING" || t.status === "TODO";
    } else if (statusFilter === "COMPLETED") {
      matchesStatus = t.status === "COMPLETED" || t.status === "DONE";
    } else if (statusFilter === "IN_REVIEW") {
      matchesStatus = t.status === "IN_REVIEW" || (t.status as string) === "REVIEW";
    }
    const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-5 pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight">My Tasks</h1>
        <p className="text-xs sm:text-[13px] font-medium text-[#6B7280] mt-0.5">
          Tasks assigned to you across all active projects
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-[#EAEDF2] p-3 sm:p-4 rounded-2xl shadow-2xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search my tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8.5 pl-8.5 pr-3 text-xs rounded-xl border border-[#EAEDF2] bg-[#F9FAFB] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#88C315]/30 focus:border-[#88C315]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 sm:flex-none h-8.5 px-3 text-xs font-semibold rounded-xl border border-[#EAEDF2] bg-white text-[#4B5563] focus:outline-none focus:ring-2 focus:ring-[#88C315]/30 cursor-pointer"
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

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="flex-1 sm:flex-none h-8.5 px-3 text-xs font-semibold rounded-xl border border-[#EAEDF2] bg-white text-[#4B5563] focus:outline-none focus:ring-2 focus:ring-[#88C315]/30 cursor-pointer"
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
        <div className="space-y-2.5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
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
