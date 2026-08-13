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
import { Trash2 } from "lucide-react";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

import { ProjectIcon, PROJECT_ICONS } from "@/components/ui/ProjectIcon";

export default function ProjectSettingsPage({ params }: PageProps) {
  const { projectId } = use(params);
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [selectedIcon, setSelectedIcon] = useState("Clipboard");
  const [loading, setLoading] = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    async function loadProject() {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (res.ok) {
          const { data } = await res.json();
          if (!ignore) {
            reset({
              name: data.name,
              description: data.description || "",
              status: data.status,
              startDate: data.startDate ? new Date(data.startDate).toISOString().split("T")[0] : "",
              deadline: data.deadline ? new Date(data.deadline).toISOString().split("T")[0] : "",
            });
            setSelectedIcon(data.icon || "Clipboard");
          }
        }
      } catch {
        if (!ignore) {
          showError("Error", "Could not load project settings.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    loadProject();
    return () => {
      ignore = true;
    };
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

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

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
    return <div className="text-xs text-[var(--text-muted)]">Loading settings...</div>;
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[14px] p-6 shadow-xs">
        <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">Project Settings</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Icon picker */}
          <div>
            <label className="text-xs font-medium text-[var(--text-primary)] block mb-2">
              Project Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_ICONS.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setSelectedIcon(iconName)}
                  className={`h-8 w-8 rounded-[8px] flex items-center justify-center border transition-all ${
                    selectedIcon === iconName
                      ? "border-[var(--primary)] bg-[var(--primary-subtle)] ring-2 ring-[var(--primary)] ring-offset-1 text-[var(--primary)]"
                      : "border-[var(--border)] hover:border-[var(--text-muted)] text-[var(--text-secondary)]"
                  }`}
                >
                  <ProjectIcon name={iconName} className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Project Name"
            id="settings-name"
            {...register("name")}
            error={errors.name?.message}
          />

          <Textarea
            label="Description"
            id="settings-description"
            rows={3}
            {...register("description")}
            error={errors.description?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              id="settings-startdate"
              {...register("startDate")}
            />
            <Input
              label="Deadline"
              type="date"
              id="settings-deadline"
              {...register("deadline")}
            />
          </div>

          <Select label="Status" id="settings-status" {...register("status")}>
            <option value="PLANNING">Planning</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-[14px] p-6 space-y-3">
        <h3 className="text-sm font-bold text-red-600 dark:text-red-400">Danger Zone</h3>
        <p className="text-xs text-[var(--text-secondary)]">
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
