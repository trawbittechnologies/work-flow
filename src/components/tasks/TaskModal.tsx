"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskSchema, type CreateTaskInput } from "@/lib/validations/task";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

import { TaskStatusType } from "@/components/tasks/TaskStatusSelect";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  members: { id: string; user: { id: string; name: string; avatar?: string | null } }[];
  onTaskCreated?: () => void;
  defaultStatus?: TaskStatusType | string;
}

export function TaskModal({
  isOpen,
  onClose,
  projectId,
  members,
  onTaskCreated,
  defaultStatus = "PENDING",
}: TaskModalProps) {
  const { success, error: showError } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      projectId,
      status: defaultStatus as any,
      priority: "MEDIUM",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        projectId,
        status: defaultStatus as any,
        priority: "MEDIUM",
        title: "",
        description: "",
        assigneeId: "",
        dueDate: "",
      });
    }
  }, [isOpen, projectId, defaultStatus, reset]);

  async function onSubmit(data: CreateTaskInput) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        assigneeId: data.assigneeId || null,
        dueDate: data.dueDate || null,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      showError("Failed to create task", body.error);
      return;
    }

    success("Task created!", `"${data.title}" added to project.`);
    onTaskCreated?.();
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
      description="Add a new task to your project."
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Task Title"
          placeholder="e.g. Design landing page hero section"
          id="task-title"
          {...register("title")}
          error={errors.title?.message}
        />

        <Textarea
          label="Description"
          placeholder="Add detailed task instructions, subtasks, or context..."
          id="task-description"
          rows={3}
          {...register("description")}
          error={errors.description?.message}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select label="Status" id="task-status" {...register("status")}>
            <option value="IN_PROGRESS">Progressing</option>
            <option value="PENDING">Pending</option>
            <option value="TESTING">Testing</option>
            <option value="ON_HOLD">Hold</option>
            <option value="IN_REVIEW">Review</option>
            <option value="COMPLETED">Complete</option>
            <option value="REOPENED">Re-Open</option>
            <option value="CANCELLED">Cancel</option>
          </Select>

          <Select label="Priority" id="task-priority" {...register("priority")}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select label="Assignee" id="task-assignee" {...register("assigneeId")}>
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.user.id} value={m.user.id}>
                {m.user.name}
              </option>
            ))}
          </Select>

          <Input
            label="Due Date"
            type="date"
            id="task-duedate"
            {...register("dueDate")}
          />
        </div>

        <div className="flex gap-3 pt-3 border-t border-[var(--border)] justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
