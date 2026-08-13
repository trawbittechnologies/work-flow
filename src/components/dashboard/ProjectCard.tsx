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
        "group block bg-surface border border-border rounded-2xl p-4.5 card-shadow",
        "hover:border-[#C3D946] hover:-translate-y-0.5 transition-all duration-200"
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3.5 mb-4">
        <div className="h-10 w-10 rounded-xl bg-[#0A1237] border border-border flex items-center justify-center flex-shrink-0 text-[#C3D946] group-hover:scale-105 transition-transform">
          <ProjectIcon name={project.icon} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-extrabold text-[#0A1237] dark:text-white truncate group-hover:text-primary transition-colors tracking-tight">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-xs text-text-muted truncate mt-0.5 leading-tight">{project.description}</p>
          )}
        </div>
        <StatusBadge status={project.status} className="flex-shrink-0 text-[10px] px-2 py-0.5" />
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-text-muted">
            {project.completedTasks}/{project.totalTasks} tasks
          </span>
          <span className="text-[11px] font-black text-[#0A1237] dark:text-[#C3D946]">
            {project.progress}%
          </span>
        </div>
        <div className="progress-bar bg-surface-alt h-2">
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
      <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-border-subtle">
        <AvatarGroup
          users={project.members.map((m) => ({ name: m.user?.name || "Unknown", avatar: m.user?.avatar }))}
          max={4}
          size="xs"
        />
        {project.deadline && (
          <span
            className={cn(
              "flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border",
              isDeadlineOverdue
                ? "text-red-600 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800"
                : "text-text-muted bg-surface-alt border-border-subtle"
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
