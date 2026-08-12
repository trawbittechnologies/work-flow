import Link from "next/link";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { AvatarGroup } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import type { Project, ProjectMember, User, Task } from "@prisma/client";
import { CalendarDays } from "lucide-react";

type ProjectCardProps = {
  project: Project & {
    owner: Pick<User, "id" | "name" | "email" | "avatar">;
    members: (ProjectMember & { user: Pick<User, "id" | "name" | "email" | "avatar"> })[];
    tasks: Pick<Task, "id" | "status">[];
    progress: number;
    completedTasks: number;
    totalTasks: number;
    _count: { tasks: number; members: number };
  };
};

export function ProjectCard({ project }: ProjectCardProps) {
  const isDeadlineOverdue = project.deadline ? isOverdue(project.deadline) : false;

  return (
    <Link
      href={`/projects/${project.id}`}
      className={cn(
        "group block bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-4",
        "hover:border-[var(--primary)] hover:shadow-md transition-all duration-200"
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="h-9 w-9 rounded-[8px] bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-lg flex-shrink-0">
          {project.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--primary)] transition-colors">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{project.description}</p>
          )}
        </div>
        <StatusBadge status={project.status} className="flex-shrink-0 text-[10px] px-1.5 py-0.5" />
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-[var(--text-muted)]">
            {project.completedTasks}/{project.totalTasks} tasks
          </span>
          <span className="text-[11px] font-medium text-[var(--text-secondary)]">
            {project.progress}%
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${project.progress}%` }}
            role="progressbar"
            aria-valuenow={project.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <AvatarGroup
          users={project.members.map((m) => ({ name: m.user.name, avatar: m.user.avatar }))}
          max={4}
          size="xs"
        />
        {project.deadline && (
          <span
            className={cn(
              "flex items-center gap-1 text-[11px]",
              isDeadlineOverdue ? "text-red-500" : "text-[var(--text-muted)]"
            )}
          >
            <CalendarDays className="h-3 w-3" />
            {formatDate(project.deadline)}
          </span>
        )}
      </div>
    </Link>
  );
}
