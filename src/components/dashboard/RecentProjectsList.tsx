"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Globe,
  Smartphone,
  Megaphone,
  Wrench,
  Layers,
  MoreVertical,
  ExternalLink,
  Edit,
  Folder,
  LayoutGrid,
} from "lucide-react";
import { ProjectStatusSelect } from "@/components/projects/ProjectStatusSelect";

export interface ProjectItem {
  id: string;
  name: string;
  updated?: string;
  progress: number;
  status: string;
  icon?: any;
  iconBg?: string;
  barColor?: string;
}

interface RecentProjectsListProps {
  initialProjects?: ProjectItem[];
}

const defaultMockProjects: ProjectItem[] = [
  {
    id: "p1",
    name: "Website Redesign",
    updated: "Updated 2 mins ago",
    progress: 80,
    status: "IN_PROGRESS",
    icon: Globe,
    iconBg: "bg-[#88C315]",
    barColor: "bg-[#88C315]",
  },
  {
    id: "p2",
    name: "Mobile App Development",
    updated: "Updated 1 hour ago",
    progress: 60,
    status: "IN_PROGRESS",
    icon: Smartphone,
    iconBg: "bg-[#7C3AED]",
    barColor: "bg-[#7C3AED]",
  },
  {
    id: "p3",
    name: "Marketing Campaign",
    updated: "Updated 3 hours ago",
    progress: 40,
    status: "PLANNING",
    icon: Megaphone,
    iconBg: "bg-[#F59E0B]",
    barColor: "bg-[#F59E0B]",
  },
  {
    id: "p4",
    name: "Internal Tool Development",
    updated: "Updated yesterday",
    progress: 70,
    status: "IN_PROGRESS",
    icon: Wrench,
    iconBg: "bg-[#3B82F6]",
    barColor: "bg-[#3B82F6]",
  },
  {
    id: "p5",
    name: "Product Design System",
    updated: "Updated 2 days ago",
    progress: 30,
    status: "ON_HOLD",
    icon: Layers,
    iconBg: "bg-[#EC4899]",
    barColor: "bg-[#EC4899]",
  },
];

export function RecentProjectsList({ initialProjects }: RecentProjectsListProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const projects = initialProjects && initialProjects.length > 0 ? initialProjects : defaultMockProjects;

  return (
    <div className="bg-white border border-[#EAEDF2] rounded-2xl p-6 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[15px] font-bold text-[#111827]">
            Recent Projects
          </h3>
          <p className="text-[11px] text-[#9CA3AF] mt-0.5">
            Click any status badge to quickly update project status
          </p>
        </div>
        <Link
          href="/projects"
          className="text-xs font-bold text-[#88C315] hover:text-[#74A710] active:scale-95 transition-all"
        >
          View all
        </Link>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((project) => {
          const IconComp = project.icon || LayoutGrid;
          const iconBg = project.iconBg || "bg-[#88C315]";
          const barColor = project.barColor || "bg-[#88C315]";

          return (
            <div
              key={project.id}
              className="flex items-center justify-between gap-4 py-1 group relative"
            >
              {/* Left: Icon + Title/Updated */}
              <div className="flex items-center gap-3.5 min-w-[200px] flex-1">
                <div
                  className={`h-10 w-10 rounded-xl ${iconBg} text-white flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
                >
                  <IconComp className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-[13px] font-bold text-[#111827] hover:text-[#88C315] transition-colors truncate block"
                  >
                    {project.name}
                  </Link>
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                    {project.updated || "Active project"}
                  </p>
                </div>
              </div>

              {/* Middle: Progress Bar */}
              <div className="hidden sm:flex items-center gap-3 w-40 flex-shrink-0">
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

              {/* Right: Interactive Status Badge & 3-Dots */}
              <div className="flex items-center gap-3 flex-shrink-0 relative">
                <ProjectStatusSelect
                  projectId={project.id.startsWith("p") ? undefined : project.id}
                  initialStatus={project.status}
                />

                <button
                  aria-label="Project actions"
                  onClick={() =>
                    setActiveMenu(activeMenu === project.id ? null : project.id)
                  }
                  className="text-[#9CA3AF] hover:text-[#111827] p-1 rounded-lg hover:bg-[#F3F4F6] transition-colors cursor-pointer"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {activeMenu === project.id && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#E5E7EB] rounded-xl shadow-xl z-20 py-1.5 text-xs animate-in font-medium">
                    <Link
                      href={`/projects/${project.id}`}
                      onClick={() => setActiveMenu(null)}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F3F4F6] text-[#374151]"
                    >
                      <Folder className="h-3.5 w-3.5 text-[#9CA3AF]" />
                      <span>Project Details</span>
                    </Link>
                    <Link
                      href={`/projects/${project.id}/board`}
                      onClick={() => setActiveMenu(null)}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F3F4F6] text-[#374151]"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-[#9CA3AF]" />
                      <span>Kanban Board</span>
                    </Link>
                    <Link
                      href={`/projects/${project.id}/settings`}
                      onClick={() => setActiveMenu(null)}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F3F4F6] text-[#374151]"
                    >
                      <Edit className="h-3.5 w-3.5 text-[#9CA3AF]" />
                      <span>Settings</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
