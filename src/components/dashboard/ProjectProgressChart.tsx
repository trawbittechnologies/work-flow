"use client";

import { BarChart2 } from "lucide-react";

interface ProjectItem {
  id: string;
  name: string;
  progress: number;
  status: string;
}

interface ProjectProgressChartProps {
  projects: ProjectItem[];
}

const STATUS_COLOR: Record<string, string> = {
  IN_PROGRESS: "#88C315",
  PENDING: "#F59E0B",
  PLANNING: "#F59E0B",
  NOT_STARTED: "#9CA3AF",
  TESTING: "#06B6D4",
  ON_HOLD: "#9CA3AF",
  REVIEW: "#7C3AED",
  COMPLETED: "#10B981",
  REOPENED: "#F97316",
  ARCHIVED: "#6B7280",
  CANCELLED: "#EF4444",
};

export function ProjectProgressChart({ projects }: ProjectProgressChartProps) {
  if (!projects || projects.length === 0) {
    return (
      <div className="bg-white border border-[#EAEDF2] rounded-2xl p-4 sm:p-6 shadow-2xs">
        <h3 className="text-sm sm:text-[15px] font-bold text-[#111827] mb-2">Project Progress</h3>
        <div className="flex flex-col items-center justify-center text-center py-12">
          <BarChart2 className="h-10 w-10 text-[#D1D5DB] mb-3 stroke-[1.5]" />
          <p className="text-sm font-semibold text-[#9CA3AF]">No projects yet</p>
          <p className="text-xs text-[#C4C9D4] mt-1">Project progress will appear here once you join or create projects</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#EAEDF2] rounded-2xl p-4 sm:p-6 shadow-2xs">
      <h3 className="text-sm sm:text-[15px] font-bold text-[#111827] mb-5">Project Progress</h3>

      <div className="space-y-4">
        {projects.map((project) => {
          const color = STATUS_COLOR[project.status] || "#88C315";
          return (
            <div key={project.id}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold text-[#111827] truncate max-w-[200px]">{project.name}</p>
                <span className="text-xs font-bold text-[#111827] ml-2">{project.progress}%</span>
              </div>
              <div className="h-2 w-full bg-[#F3F4F6] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%`, backgroundColor: color }}
                />
              </div>
              <p className="text-[10px] text-[#9CA3AF] mt-1">
                {project.status.replace("_", " ")}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
