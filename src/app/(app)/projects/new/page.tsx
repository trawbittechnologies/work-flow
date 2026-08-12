"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createProjectSchema, type CreateProjectInput } from "@/lib/validations/project";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const EMOJIS = ["📋", "🚀", "💡", "🎯", "🛠️", "🌟", "🔥", "💼", "🏗️", "🎨", "📊", "🔬", "🌿", "🎮", "📱", "🖥️", "🤖", "🔐", "📦", "🌐"];

export default function NewProjectPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [selectedIcon, setSelectedIcon] = useState("📋");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { icon: "📋", status: "PLANNING" },
  });

  async function onSubmit(data: CreateProjectInput) {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, icon: selectedIcon }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      showError("Failed to create project", body.error);
      return;
    }

    const { data: project } = await res.json();
    success("Project created!", `"${data.name}" is ready.`);
    router.push(`/projects/${project.id}`);
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/projects"
          className="inline-flex items-center justify-center h-8 w-8 rounded-[8px] hover:bg-[var(--background)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">New Project</h1>
          <p className="text-sm text-[var(--text-secondary)]">Set up your project in seconds</p>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[14px] p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Icon picker */}
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] block mb-2">
              Project Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setSelectedIcon(emoji);
                    setValue("icon", emoji);
                  }}
                  className={`h-9 w-9 rounded-[8px] text-lg flex items-center justify-center border transition-all ${
                    selectedIcon === emoji
                      ? "border-[var(--primary)] bg-[var(--primary-subtle)] ring-2 ring-[var(--primary)] ring-offset-1"
                      : "border-[var(--border)] hover:border-[var(--text-muted)] hover:bg-[var(--background)]"
                  }`}
                  aria-label={`Select ${emoji} as project icon`}
                  aria-pressed={selectedIcon === emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Project Name"
            placeholder="e.g. Website Redesign, Mobile App, Q4 Launch…"
            id="project-name"
            {...register("name")}
            error={errors.name?.message}
          />

          <Textarea
            label="Description"
            placeholder="What's this project about? (optional)"
            id="project-description"
            rows={3}
            {...register("description")}
            error={errors.description?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              id="project-start-date"
              {...register("startDate")}
            />
            <Input
              label="Deadline"
              type="date"
              id="project-deadline"
              {...register("deadline")}
            />
          </div>

          <Select
            label="Status"
            id="project-status"
            {...register("status")}
            error={errors.status?.message}
          >
            <option value="PLANNING">Planning</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} className="flex-1">
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
