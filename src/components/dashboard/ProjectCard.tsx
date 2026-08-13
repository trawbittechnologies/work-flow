import Link from "next/link";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { AvatarGroup } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import type { Project, ProjectMember, User, Task } from "@prisma/client";
import { CalendarDays } from "lucide-react";
import { ProjectIcon } from "@/components/ui/ProjectIcon";

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
        "group block bg-surface border border-border rounded-xl p-4",
        "hover:border-primary/50 hover:shadow-md transition-all duration-200"
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="h-10 w-10 rounded-lg bg-surface-alt border border-border flex items-center justify-center flex-shrink-0 group-hover:bg-primary-subtle group-hover:border-primary/20 transition-colors text-text-secondary group-hover:text-primary">
          <ProjectIcon name={project.icon} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-xs text-text-muted truncate mt-0.5">{project.description}</p>
          )}
        </div>
        <StatusBadge status={project.status} className="flex-shrink-0 text-[10px] px-1.5 py-0.5" />
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-text-muted">
            {project.completedTasks}/{project.totalTasks} tasks
          </span>
          <span className="text-[11px] font-bold text-text-secondary">
            {project.progress}%
          </span>
        </div>
        <div className="progress-bar bg-surface-alt h-1.5">
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
      <div className="flex items-center justify-between mt-auto">
        <AvatarGroup
          users={project.members.map((m) => ({ name: m.user?.name || "Unknown", avatar: m.user?.avatar }))}
          max={4}
          size="xs"
        />
        {project.deadline && (
          <span
            className={cn(
              "flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded bg-surface-alt",
              isDeadlineOverdue ? "text-danger bg-danger-subtle" : "text-text-muted"
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
