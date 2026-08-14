"use client";

import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { ProjectStatusSelect } from "@/components/projects/ProjectStatusSelect";
import { ProjectIcon } from "@/components/ui/ProjectIcon";

const STATUS_BAR: Record<string, string> = {
  IN_PROGRESS: "bg-[#88C315]",
  PLANNING: "bg-[#F59E0B]",
  NOT_STARTED: "bg-[#9CA3AF]",
  ON_HOLD: "bg-[#F59E0B]",
  REVIEW: "bg-[#7C3AED]",
  COMPLETED: "bg-[#10B981]",
  ARCHIVED: "bg-[#6B7280]",
  CANCELLED: "bg-[#EF4444]",
};

export interface ProjectItem {
  id: string;
  name: string;
  progress: number;
  status: string;
  icon?: string;
}

interface RecentProjectsListProps {
  projects: ProjectItem[];
}

export function RecentProjectsList({ projects }: RecentProjectsListProps) {
  return (
    <div className="bg-white border border-[#EAEDF2] rounded-2xl p-4 sm:p-6 shadow-2xs">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h3 className="text-sm sm:text-[15px] font-bold text-[#111827]">Recent Projects</h3>
          <p className="text-[11px] text-[#9CA3AF] mt-0.5">
            Click any status badge to quickly update project status
          </p>
        </div>
        <Link
          href="/projects"
          className="text-xs font-bold text-[#88C315] hover:text-[#74A710] active:scale-95 transition-all shrink-0 ml-2"
        >
          View all
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-10">
          <FolderKanban className="h-9 w-9 text-[#D1D5DB] mb-3 stroke-[1.5]" />
          <p className="text-sm font-semibold text-[#9CA3AF]">No projects yet</p>
          <p className="text-xs text-[#C4C9D4] mt-1">Projects you join or create will appear here</p>
        </div>
      ) : (
        <div className="space-y-3.5 sm:space-y-4">
          {projects.map((project) => {
            const barColor = STATUS_BAR[project.status] || "bg-[#88C315]";
            return (
              <div
                key={project.id}
                className="flex items-center justify-between gap-2.5 sm:gap-4 py-1 group relative"
              >
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-[#F3F9DE] text-[#88C315] flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <ProjectIcon name={project.icon || "Folder"} className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-xs sm:text-[13px] font-bold text-[#111827] hover:text-[#88C315] transition-colors truncate block"
                    >
                      {project.name}
                    </Link>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-3 w-32 lg:w-40 flex-shrink-0">
                  <div className="flex-1 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-[#111827] w-8 text-right">
                    {project.progress}%
                  </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                  <ProjectStatusSelect projectId={project.id} initialStatus={project.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
