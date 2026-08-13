import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { CommentSection } from "@/components/tasks/CommentSection";
import { formatDate, isOverdue } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectIcon } from "@/components/ui/ProjectIcon";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Task Details" };

type PageProps = {
  params: Promise<{ taskId: string }>;
};

export default async function TaskDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { taskId } = await params;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: { select: { id: true, name: true, icon: true } },
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
      createdBy: { select: { id: true, name: true, email: true, avatar: true } },
      labels: { include: { label: true } },
      comments: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!task) notFound();

  // Verify access
  const isMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: task.projectId, userId: session.user.id } },
  });
  if (!isMember) notFound();

  const overdue = task.dueDate ? isOverdue(task.dueDate) : false;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back button */}
      <Link
        href={`/projects/${task.projectId}/tasks`}
        className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {task.project.name} tasks
      </Link>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[14px] p-6 shadow-xs space-y-6">
        {/* Title Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg text-text-secondary"><ProjectIcon name={task.project.icon} className="h-5 w-5" /></span>
              <span className="text-xs font-semibold text-[var(--text-muted)]">{task.project.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT"} />
            </div>
          </div>

          <h1 className="text-xl font-bold text-[var(--text-primary)] leading-tight">{task.title}</h1>
        </div>

        {/* Description */}
        <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-[var(--text-secondary)] bg-[var(--background)] p-4 rounded-[10px] border border-[var(--border-subtle)]">
          {task.description ? (
            <p className="whitespace-pre-wrap leading-relaxed">{task.description}</p>
          ) : (
            <span className="text-[var(--text-muted)] italic">No description provided.</span>
          )}
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-[var(--border-subtle)] text-xs">
          <div>
            <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">Assignee</span>
            <div className="flex items-center gap-1.5 mt-1">
              {task.assignee ? (
                <>
                  <Avatar name={task.assignee.name} src={task.assignee.avatar} size="xs" />
                  <span className="font-medium text-[var(--text-primary)]">{task.assignee.name}</span>
                </>
              ) : (
                <span className="text-[var(--text-muted)]">Unassigned</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">Created By</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Avatar name={task.createdBy.name} src={task.createdBy.avatar} size="xs" />
              <span className="font-medium text-[var(--text-primary)]">{task.createdBy.name}</span>
            </div>
          </div>

          <div>
            <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">Due Date</span>
            <span className={`font-medium block mt-1 ${overdue ? "text-red-500 font-bold" : "text-[var(--text-primary)]"}`}>
              {task.dueDate ? formatDate(task.dueDate) : "No due date"}
            </span>
          </div>
        </div>

        {/* Comments Section */}
        <CommentSection taskId={taskId} comments={task.comments} />
      </div>
    </div>
  );
}
