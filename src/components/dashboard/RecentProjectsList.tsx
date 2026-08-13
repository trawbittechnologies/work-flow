"use client";

import Link from "next/link";
import {
  Globe,
  Smartphone,
  Megaphone,
  Wrench,
  Layers,
  MoreVertical,
} from "lucide-react";

interface RecentProjectsListProps {
  initialProjects?: Array<{
    id: string;
    name: string;
    updatedAt: Date | string;
    progress: number;
    status: string;
  }>;
}

const mockProjects = [
  {
    id: "p1",
    name: "Website Redesign",
    updated: "Updated 2 mins ago",
    progress: 80,
    status: "In Progress",
    statusVariant: "in-progress",
    icon: Globe,
    iconBg: "bg-[#88C315]",
    barColor: "bg-[#88C315]",
  },
  {
    id: "p2",
    name: "Mobile App Development",
    updated: "Updated 1 hour ago",
    progress: 60,
    status: "In Progress",
    statusVariant: "in-progress",
    icon: Smartphone,
    iconBg: "bg-[#7C3AED]",
    barColor: "bg-[#7C3AED]",
  },
  {
    id: "p3",
    name: "Marketing Campaign",
    updated: "Updated 3 hours ago",
    progress: 40,
    status: "Pending",
    statusVariant: "pending",
    icon: Megaphone,
    iconBg: "bg-[#F59E0B]",
    barColor: "bg-[#F59E0B]",
  },
  {
    id: "p4",
    name: "Internal Tool Development",
    updated: "Updated yesterday",
    progress: 70,
    status: "In Progress",
    statusVariant: "in-progress",
    icon: Wrench,
    iconBg: "bg-[#3B82F6]",
    barColor: "bg-[#3B82F6]",
  },
  {
    id: "p5",
    name: "Product Design System",
    updated: "Updated 2 days ago",
    progress: 30,
    status: "On Hold",
    statusVariant: "on-hold",
    icon: Layers,
    iconBg: "bg-[#EC4899]",
    barColor: "bg-[#EC4899]",
  },
];

export function RecentProjectsList({ initialProjects: _initialProjects }: RecentProjectsListProps) {
  return (
    <div className="bg-white border border-[#EAEDF2] rounded-2xl p-6 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[15px] font-bold text-[#111827]">
          Recent Projects
        </h3>
        <Link
          href="/projects"
          className="text-xs font-bold text-[#88C315] hover:text-[#74A710] transition-colors"
        >
          View all
        </Link>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {mockProjects.map((project) => (
          <div
            key={project.id}
            className="flex items-center justify-between gap-4 py-1 group"
          >
            {/* Left: Icon + Title/Updated */}
            <div className="flex items-center gap-3.5 min-w-[200px] flex-1">
              <div
                className={`h-10 w-10 rounded-xl ${project.iconBg} text-white flex items-center justify-center flex-shrink-0 shadow-2xs`}
              >
                <project.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <Link
                  href={`/projects`}
                  className="text-[13px] font-bold text-[#111827] hover:text-[#88C315] transition-colors truncate block"
                >
                  {project.name}
                </Link>
                <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                  {project.updated}
                </p>
              </div>
            </div>

            {/* Middle: Progress Bar */}
            <div className="hidden sm:flex items-center gap-3 w-40 flex-shrink-0">
              <div className="flex-1 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${project.barColor}`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-[#111827] w-8 text-right">
                {project.progress}%
              </span>
            </div>

            {/* Right: Status Badge & 3-Dots */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                  project.statusVariant === "in-progress"
                    ? "bg-[#F3F9DE] text-[#659A08]"
                    : project.statusVariant === "pending"
                    ? "bg-[#FFFBEB] text-[#D97706]"
                    : "bg-[#F3F4F6] text-[#6B7280]"
                }`}
              >
                {project.status}
              </span>

              <button
                aria-label="Project actions"
                className="text-[#9CA3AF] hover:text-[#111827] p-1 rounded transition-colors cursor-pointer"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
