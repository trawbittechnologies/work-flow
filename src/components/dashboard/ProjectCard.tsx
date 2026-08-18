import Link from "next/link";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { AvatarGroup } from "@/components/ui/Avatar";
import { ProjectStatusSelect } from "@/components/projects/ProjectStatusSelect";
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
    <div
      className={cn(
        "group flex flex-col justify-between bg-white border border-[#DDE2D8] rounded-[2px] p-5 shadow-xs",
        "hover:border-[#071A49] transition-all duration-200"
      )}
    >
      <div>
        {/* Header */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="h-10 w-10 rounded-[2px] bg-[#071A49] border border-[#071A49] flex items-center justify-center flex-shrink-0 text-[#B7D600] group-hover:scale-105 transition-transform mt-0.5 shadow-2xs">
            <ProjectIcon name={project.icon} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Link
                href={`/projects/${project.id}`}
                className="text-sm font-bold text-[#071A49] truncate hover:text-[#041030] transition-colors tracking-tight"
              >
                {project.name}
              </Link>
              <ProjectStatusSelect
                projectId={project.id}
                initialStatus={project.status}
              />
            </div>
            {project.description ? (
              <p className="text-xs font-medium text-[#586274] line-clamp-2 mt-1.5 leading-relaxed">
                {project.description}
              </p>
            ) : (
              <p className="text-xs text-[#8E99A8] italic mt-1.5">No description provided.</p>
            )}
          </div>
        </div>

        {/* Progress Section */}
        <div className="my-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold font-mono text-[#586274]">
              {project.completedTasks}/{project.totalTasks} tasks
            </span>
            <span className="text-xs font-black font-mono text-[#071A49]">
              {project.progress}%
            </span>
          </div>
          <div className="progress-bar bg-[#F0F2EC] h-2 rounded-[2px] overflow-hidden">
            <div
              className="progress-fill h-full bg-[#B7D600] rounded-[2px] transition-all"
              style={{ width: `${project.progress}%` }}
              role="progressbar"
              aria-valuenow={project.progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      {/* Footer Baseline Alignment */}
      <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#DDE2D8]">
        <AvatarGroup
          users={project.members.map((m) => ({ name: m.user?.name || "Unknown", avatar: m.user?.avatar }))}
          max={4}
          size="xs"
        />
        {project.deadline ? (
          <span
            className={cn(
              "flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-[2px] border",
              isDeadlineOverdue
                ? "text-red-700 bg-red-50 border-red-200"
                : "text-[#586274] bg-[#F0F2EC] border-[#DDE2D8]"
            )}
          >
            <CalendarDays className="h-3 w-3" />
            {formatDate(project.deadline)}
          </span>
        ) : (
          <span className="text-[10px] font-mono font-semibold text-[#8E99A8]">No deadline</span>
        )}
      </div>
    </div>
  );
}
