"use client";

import { useState, useEffect } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Avatar } from "@/components/ui/Avatar";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { CalendarDays, AlertCircle, Trash2 } from "lucide-react";
import { formatDueDate, isOverdue } from "@/lib/utils";
import { CommentSection } from "./CommentSection";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface TaskDrawerProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated?: () => void;
  onTaskDeleted?: () => void;
}

export function TaskDrawer({ taskId, isOpen, onClose, onTaskUpdated, onTaskDeleted }: TaskDrawerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { error: showError, success } = useToast();

  useEffect(() => {
    let isMounted = true;
    if (isOpen && taskId) {
      setLoading(true);
      fetch(`/api/tasks/${taskId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load task");
          return res.json();
        })
        .then((data) => {
          if (isMounted) setTask(data.data);
        })
        .catch(() => {
          if (isMounted) {
            showError("Error", "Could not load task details.");
            onClose();
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setTask(null);
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, taskId, onClose, showError]);

  async function loadTask() {
    if (!taskId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (!res.ok) throw new Error("Failed to load task");
      const data = await res.json();
      setTask(data.data);
      if (onTaskUpdated) onTaskUpdated();
    } catch {
      showError("Error", "Could not load task details.");
      onClose();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!taskId) return;
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      
      success("Task deleted", "The task was removed successfully.");
      onTaskDeleted?.();
      onClose();
    } catch {
      showError("Error", "Could not delete task.");
    } finally {
      setDeleting(false);
    }
  }

  if (!isOpen) return null;

  const overdue = task?.dueDate ? isOverdue(task.dueDate) : false;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} width="w-[600px]">
      {loading || !task ? (
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-3/4 rounded-lg" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      ) : (
        <div className="flex flex-col h-full bg-surface">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-danger hover:bg-danger-subtle/50 hover:text-danger" onClick={handleDelete} isLoading={deleting}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="text-xl font-bold text-text-primary tracking-tight leading-tight">
              {task.title}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-6 bg-surface-alt/50 p-4 rounded-xl border border-border">
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Assignee</p>
                {task.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar name={task.assignee.name} src={task.assignee.avatar} size="sm" />
                    <span className="text-sm font-medium text-text-primary">{task.assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-text-muted italic">Unassigned</span>
                )}
              </div>
              
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Due Date</p>
                {task.dueDate ? (
                  <div className={`flex items-center gap-2 text-sm font-medium ${overdue ? 'text-danger' : 'text-text-primary'}`}>
                    {overdue ? <AlertCircle className="h-4 w-4" /> : <CalendarDays className="h-4 w-4 text-text-muted" />}
                    {formatDueDate(task.dueDate)}
                  </div>
                ) : (
                  <span className="text-sm text-text-muted">No date set</span>
                )}
              </div>

              {task.labels && task.labels.length > 0 && (
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Labels</p>
                  <div className="flex flex-wrap gap-2">
                    {task.labels.map(({ label }: { label: { id: string; name: string; color: string } }) => (
                      <span
                        key={label.id}
                        style={{ backgroundColor: `${label.color}15`, color: label.color, borderColor: `${label.color}40` }}
                        className="text-xs font-semibold px-2 py-1 rounded-md border"
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Description</p>
              {task.description ? (
                <div className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
                  {task.description}
                </div>
              ) : (
                <p className="text-sm text-text-muted italic">No description provided.</p>
              )}
            </div>

            {/* Comments */}
            <CommentSection taskId={task.id} comments={task.comments} onCommentAdded={loadTask} />
          </div>
        </div>
      )}
    </Drawer>
  );
}
