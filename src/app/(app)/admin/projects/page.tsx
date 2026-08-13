"use client";

import { useState, useEffect } from "react";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/Modal";
import { calculateProgress } from "@/lib/utils";
import { FolderKanban, Search, Archive, ArchiveRestore, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AdminProject {
  id: string;
  name: string;
  key: string;
  icon: string;
  status: string;
  priority: string;
  owner: { id: string; name: string; avatar?: string | null };
  lead: { id: string; name: string; avatar?: string | null } | null;
  members: { userId: string; user: { id: string; name: string; avatar?: string | null } }[];
  tasks: { id: string; status: string }[];
  _count: { tasks: number; members: number };
  deadline?: string | null;
  updatedAt: string;
}

export default function AdminProjectsPage() {
  const { success, error: showError } = useToast();
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadProjects() {
    try {
      const res = await fetch("/api/admin/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.data || []);
      }
    } catch {
      showError("Error", "Could not load projects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/admin/projects");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setProjects(data.data || []);
        }
      } catch {
        if (isMounted) showError("Error", "Could not load projects.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProjects();
    return () => {
      isMounted = false;
    };
  }, [showError]);

  async function handleArchive(project: AdminProject) {
    const newStatus = project.status === "ARCHIVED" ? "ON_HOLD" : "ARCHIVED";
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) { showError("Failed", "Could not update project."); return; }
      success(
        newStatus === "ARCHIVED" ? "Project archived" : "Project restored",
        `"${project.name}" has been ${newStatus === "ARCHIVED" ? "archived" : "restored"}.`
      );
      loadProjects();
    } catch {
      showError("Error", "Failed to update project.");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${deleteId}`, { method: "DELETE" });
      if (!res.ok) { const b = await res.json(); showError("Failed", b.error); return; }
      success("Project deleted", "The project has been permanently deleted.");
      setDeleteId(null);
      loadProjects();
    } catch {
      showError("Error", "Failed to delete project.");
    } finally {
      setDeleting(false);
    }
  }

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.key.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusColors: Record<string, string> = {
    PLANNING: "bg-blue-50 text-blue-600",
    NOT_STARTED: "bg-gray-100 text-gray-600",
    IN_PROGRESS: "bg-indigo-50 text-indigo-600",
    ON_HOLD: "bg-amber-50 text-amber-600",
    REVIEW: "bg-purple-50 text-purple-600",
    COMPLETED: "bg-emerald-50 text-emerald-600",
    ARCHIVED: "bg-gray-100 text-gray-400",
    CANCELLED: "bg-red-50 text-red-400",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">All Projects</h1>
          <p className="text-xs text-text-muted mt-0.5">{projects.length} total projects</p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 h-9 px-4 text-sm rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> New Project
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-surface border border-border p-3 rounded-[12px]">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name or key..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs rounded-[8px] border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8 px-3 text-xs rounded-[8px] border border-border bg-background text-text-primary"
        >
          <option value="ALL">All Statuses</option>
          <option value="PLANNING">Planning</option>
          <option value="NOT_STARTED">Not Started</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="REVIEW">Review</option>
          <option value="COMPLETED">Completed</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-[10px]" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects found" description="No projects match your filters." />
      ) : (
        <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
          <div className="divide-y divide-border-subtle">
            {filtered.map((project) => {
              const completedTasks = project.tasks.filter((t) => t.status === "DONE").length;
              const totalTasks = project.tasks.length;
              return (
                <div key={project.id} className="flex items-center justify-between p-4 hover:bg-background transition-colors group">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <Link href={`/projects/${project.id}`} className="text-sm font-semibold text-text-primary hover:text-primary transition-colors truncate">
                          {project.name}
                        </Link>
                        <span className="text-[10px] font-bold text-text-muted bg-surface-alt border border-border px-1.5 py-0.5 rounded font-mono">
                          {project.key}
                        </span>
                        <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase", statusColors[project.status] || "bg-gray-100 text-gray-500")}>
                          {project.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted">
                        Owner: {project.owner.name} · {project._count.members} members · {completedTasks}/{totalTasks} tasks
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                    <button
                      onClick={() => handleArchive(project)}
                      title={project.status === "ARCHIVED" ? "Restore project" : "Archive project"}
                      className="p-1.5 rounded-[6px] text-text-muted hover:text-amber-500 hover:bg-amber-50 transition-colors"
                    >
                      {project.status === "ARCHIVED" ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                    </button>
                    <Link
                      href={`/projects/${project.id}/settings`}
                      className="p-1.5 rounded-[6px] text-text-muted hover:text-primary hover:bg-primary-subtle transition-colors text-xs"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteId(project.id)}
                      className="p-1.5 rounded-[6px] text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        description="This will permanently delete the project and all its tasks, files, and activity. This cannot be undone."
        confirmLabel="Delete Project"
        isLoading={deleting}
      />
    </div>
  );
}
