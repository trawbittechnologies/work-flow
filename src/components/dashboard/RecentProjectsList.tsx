"use client";

import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { ProjectStatusSelect } from "@/components/projects/ProjectStatusSelect";
import { ProjectIcon } from "@/components/ui/ProjectIcon";

const STATUS_BAR: Record<string, string> = {
  IN_PROGRESS: "bg-[#88C315]",
  PENDING: "bg-[#F59E0B]",
  PLANNING: "bg-[#F59E0B]",
  NOT_STARTED: "bg-[#9CA3AF]",
  TESTING: "bg-[#06B6D4]",
  ON_HOLD: "bg-[#9CA3AF]",
  REVIEW: "bg-[#7C3AED]",
  COMPLETED: "bg-[#10B981]",
  REOPENED: "bg-[#F97316]",
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
    <div className="bg-white border border-[#DDE2D8] rounded-[2px] p-4 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h3 className="text-sm sm:text-[15px] font-bold uppercase font-display text-[#071A49]">Recent Projects</h3>
          <p className="text-[11px] text-[#586274] mt-0.5">
            Click any status badge to quickly update project status
          </p>
        </div>
        <Link
          href="/projects"
          className="text-xs font-mono font-bold text-[#071A49] hover:text-[#041030] active:scale-95 transition-all shrink-0 ml-2"
        >
          VIEW ALL →
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-10 bg-tech-grid rounded-[2px] border border-[#DDE2D8]">
          <FolderKanban className="h-9 w-9 text-[#8E99A8] mb-3 stroke-[1.5]" />
          <p className="text-sm font-bold uppercase font-display text-[#071A49]">No projects yet</p>
          <p className="text-xs text-[#586274] mt-1">Projects you join or create will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-3.5">
          {projects.map((project) => {
            const barColor = STATUS_BAR[project.status] || "bg-[#B7D600]";
            return (
              <div
                key={project.id}
                className="flex items-center justify-between gap-2.5 sm:gap-4 py-1.5 px-2 rounded-[2px] hover:bg-[#F8F9F6] transition-colors group relative border border-transparent hover:border-[#DDE2D8]"
              >
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-[2px] bg-[#F1F8CE] text-[#071A49] border border-[#B7D600] flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <ProjectIcon name={project.icon || "Folder"} className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-xs sm:text-[13px] font-bold text-[#071A49] hover:text-[#041030] transition-colors truncate block"
                    >
                      {project.name}
                    </Link>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-3 w-32 lg:w-40 flex-shrink-0">
                  <div className="flex-1 h-2 bg-[#F0F2EC] rounded-[2px] overflow-hidden">
                    <div
                      className={`h-full rounded-[2px] transition-all duration-300 ${barColor}`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#071A49] w-8 text-right">
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
