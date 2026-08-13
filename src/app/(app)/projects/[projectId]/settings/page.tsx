"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProjectSchema, type UpdateProjectInput } from "@/lib/validations/project";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { Trash2, Archive, ArchiveRestore, Star } from "lucide-react";
import { ProjectIcon, PROJECT_ICONS } from "@/components/ui/ProjectIcon";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default function ProjectSettingsPage({ params }: PageProps) {
  const { projectId } = use(params);
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [selectedIcon, setSelectedIcon] = useState("Clipboard");
  const [loading, setLoading] = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [projectStatus, setProjectStatus] = useState("PLANNING");
  const [members, setMembers] = useState<{ userId: string; user: { id: string; name: string; avatar?: string | null } }[]>([]);
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null);
  const [savingLead, setSavingLead] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProjectInput>({
    resolver: zodResolver(updateProjectSchema),
  });

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const [projectRes, membersRes] = await Promise.all([
          fetch(`/api/projects/${projectId}`),
          fetch(`/api/projects/${projectId}/members`),
        ]);
        if (projectRes.ok) {
          const { data } = await projectRes.json();
          if (!ignore) {
            reset({
              name: data.name,
              description: data.description || "",
              status: data.status,
              priority: data.priority || "MEDIUM",
              leadId: data.leadId || "",
              startDate: data.startDate ? new Date(data.startDate).toISOString().split("T")[0] : "",
              deadline: data.deadline ? new Date(data.deadline).toISOString().split("T")[0] : "",
            });
            setSelectedIcon(data.icon || "Clipboard");
            setProjectStatus(data.status);
            setCurrentLeadId(data.leadId || null);
            setSelectedLeadId(data.leadId || "");
          }
        }
        if (membersRes.ok) {
          const { data } = await membersRes.json();
          if (!ignore) setMembers(data || []);
        }
      } catch {
        if (!ignore) showError("Error", "Could not load project settings.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadData();
    return () => { ignore = true; };
  }, [projectId, reset, showError]);

  async function onSubmit(data: UpdateProjectInput) {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, icon: selectedIcon }),
      });

      if (!res.ok) {
        const body = await res.json();
        showError("Failed to update", body.error);
        return;
      }

      success("Project updated", "Changes saved successfully.");
      router.refresh();
    } catch {
      showError("Error", "Save failed.");
    }
  }

  async function handleSaveLead() {
    setSavingLead(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/lead`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: selectedLeadId || null }),
      });
      if (!res.ok) { showError("Failed", "Could not update lead."); return; }
      success("Project lead updated", selectedLeadId ? "Lead has been assigned." : "Lead has been removed.");
      setCurrentLeadId(selectedLeadId || null);
      router.refresh();
    } catch {
      showError("Error", "Failed to update lead.");
    } finally {
      setSavingLead(false);
    }
  }

  async function handleArchiveToggle() {
    const newStatus = projectStatus === "ARCHIVED" ? "ON_HOLD" : "ARCHIVED";
    setArchiving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const body = await res.json();
        showError("Failed", body.error);
        return;
      }

      success(
        newStatus === "ARCHIVED" ? "Project archived" : "Project restored",
        newStatus === "ARCHIVED" ? "Project moved to archive." : "Project has been restored."
      );
      setProjectStatus(newStatus);
      setIsArchiveOpen(false);
      router.refresh();
    } catch {
      showError("Error", "Failed to update project.");
    } finally {
      setArchiving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });

      if (!res.ok) {
        const body = await res.json();
        showError("Delete failed", body.error);
        return;
      }

      success("Project deleted", "The project has been removed.");
      router.push("/projects");
    } catch {
      showError("Error", "Failed to delete project.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-64 w-full rounded-[14px]" />
        <Skeleton className="h-40 w-full rounded-[14px]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Main Settings */}
      <div className="bg-surface border border-border rounded-[14px] p-6 shadow-xs">
        <h2 className="text-base font-bold text-text-primary mb-5">Project Settings</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Icon picker */}
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-2">Project Icon</label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_ICONS.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setSelectedIcon(iconName)}
                  className={cn(
                    "h-8 w-8 rounded-[8px] flex items-center justify-center border transition-all",
                    selectedIcon === iconName
                      ? "border-primary bg-primary-subtle ring-2 ring-primary ring-offset-1 text-primary"
                      : "border-border hover:border-text-muted text-text-secondary"
                  )}
                >
                  <ProjectIcon name={iconName} className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <Input label="Project Name" id="settings-name" {...register("name")} error={errors.name?.message} />

          <Textarea label="Description" id="settings-description" rows={3} {...register("description")} error={errors.description?.message} />

          <div className="grid grid-cols-2 gap-4">
            <Select label="Status" id="settings-status" {...register("status")}>
              <option value="PLANNING">Planning</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="REVIEW">Review</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>

            <Select label="Priority" id="settings-priority" {...register("priority")}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" id="settings-startdate" {...register("startDate")} />
            <Input label="Deadline" type="date" id="settings-deadline" {...register("deadline")} />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Project Lead */}
      <div className="bg-surface border border-border rounded-[14px] p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Star className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-bold text-text-primary">Project Lead</h3>
        </div>
        <p className="text-xs text-text-secondary mb-4">Assign a team member as the project lead. They will be highlighted as the main point of contact.</p>

        <div className="flex items-center gap-3">
          <select
            value={selectedLeadId}
            onChange={(e) => setSelectedLeadId(e.target.value)}
            className="flex-1 h-9 px-3 text-sm rounded-[8px] border border-border bg-background text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">— No Lead —</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.user.name}
                {m.userId === currentLeadId ? " (current)" : ""}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSaveLead}
            isLoading={savingLead}
            disabled={selectedLeadId === (currentLeadId ?? "")}
          >
            Save Lead
          </Button>
        </div>
      </div>

      {/* Archive Zone */}
      <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-[14px] p-6 space-y-3">
        <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400">
          {projectStatus === "ARCHIVED" ? "Restore Project" : "Archive Project"}
        </h3>
        <p className="text-xs text-text-secondary">
          {projectStatus === "ARCHIVED"
            ? "This project is currently archived. Restoring it will make it active again."
            : "Archiving a project hides it from normal views but preserves all data. You can restore it later."}
        </p>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={projectStatus === "ARCHIVED" ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
          onClick={() => setIsArchiveOpen(true)}
          className="border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900"
        >
          {projectStatus === "ARCHIVED" ? "Restore Project" : "Archive Project"}
        </Button>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-[14px] p-6 space-y-3">
        <h3 className="text-sm font-bold text-red-600 dark:text-red-400">Danger Zone</h3>
        <p className="text-xs text-text-secondary">
          Once you delete a project, there is no going back. All tasks, messages, and comments will be permanently erased.
        </p>
        <Button
          variant="danger"
          size="sm"
          leftIcon={<Trash2 className="h-3.5 w-3.5" />}
          onClick={() => setIsDeleteOpen(true)}
        >
          Delete Project
        </Button>
      </div>

      <ConfirmDialog
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        onConfirm={handleArchiveToggle}
        title={projectStatus === "ARCHIVED" ? "Restore Project?" : "Archive Project?"}
        description={
          projectStatus === "ARCHIVED"
            ? "This will restore the project to an active state."
            : "This will archive the project. Members won't see it on their dashboard, but all data is preserved."
        }
        confirmLabel={projectStatus === "ARCHIVED" ? "Restore" : "Archive"}
        isLoading={archiving}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Project?"
        description="Are you sure you want to delete this project? This action cannot be undone."
        confirmLabel="Delete Permanently"
        isLoading={deleting}
      />
    </div>
  );
}
