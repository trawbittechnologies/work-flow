"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  MoreVertical,
  Calendar,
  Layers,
  Folder,
  ExternalLink,
  Edit,
  CheckCircle2,
  TrendingUp,
  LayoutGrid,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ProjectStatusSelect } from "@/components/projects/ProjectStatusSelect";
import { ProjectIcon } from "@/components/ui/ProjectIcon";
import { cn } from "@/lib/utils";

export interface ProjectTableItem {
  id: string;
  name: string;
  key: string;
  description?: string | null;
  icon?: string;
  status: string;
  priority: string;
  progress: number;
  completedTasks: number;
  totalTasks: number;
  startDate?: Date | string | null;
  deadline?: Date | string | null;
  owner?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  } | null;
  lead?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  } | null;
  members?: Array<{
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string | null;
    };
  }>;
}

interface ProjectsTableProps {
  initialProjects: ProjectTableItem[];
  isAdminUser?: boolean;
}

const priorityConfig: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  CRITICAL: { label: "Critical", bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", dot: "bg-[#DC2626]" },
  HIGH: { label: "High", bg: "bg-[#FFF1F2]", text: "text-[#E11D48]", dot: "bg-[#E11D48]" },
  MEDIUM: { label: "Medium", bg: "bg-[#FFFBEB]", text: "text-[#D97706]", dot: "bg-[#F59E0B]" },
  LOW: { label: "Low", bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", dot: "bg-[#22C55E]" },
};

export function ProjectsTable({ initialProjects, isAdminUser: _isAdminUser = false }: ProjectsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setActiveActionMenu(null);
      }
    }
    if (activeActionMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeActionMenu]);

  const filteredProjects = useMemo(() => {
    return initialProjects.filter((p) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.lead?.name && p.lead.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" || p.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" || p.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [initialProjects, searchQuery, statusFilter, priorityFilter]);

  const stats = useMemo(() => {
    const total = initialProjects.length;
    const inProgress = initialProjects.filter((p) => p.status === "IN_PROGRESS").length;
    const completed = initialProjects.filter((p) => p.status === "COMPLETED").length;
    const planning = initialProjects.filter((p) => p.status === "PLANNING" || p.status === "NOT_STARTED").length;
    return { total, inProgress, completed, planning };
  }, [initialProjects]);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#EAEDF2] rounded-2xl p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
              Total Projects
            </span>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-[#F3F9DE] text-[#88C315] flex items-center justify-center">
              <Folder className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#111827] mt-1">{stats.total}</h3>
        </div>

        <div className="bg-white border border-[#EAEDF2] rounded-2xl p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
              In Progress
            </span>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-[#F3F9DE] text-[#88C315] flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#111827] mt-1">{stats.inProgress}</h3>
        </div>

        <div className="bg-white border border-[#EAEDF2] rounded-2xl p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
              Completed
            </span>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#111827] mt-1">{stats.completed}</h3>
        </div>

        <div className="bg-white border border-[#EAEDF2] rounded-2xl p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
              Planning / Hold
            </span>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center">
              <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#111827] mt-1">{stats.planning}</h3>
        </div>
      </div>

      {/* Modern Filter Toolbar */}
      <div className="bg-white border border-[#EAEDF2] rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
          <input
            type="search"
            placeholder="Filter projects by title, key, lead..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-xs font-medium rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#88C315]/30 focus:border-[#88C315] transition-all"
          />
        </div>

        {/* Status Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <div className="flex items-center bg-[#F4F5F7] p-1 rounded-xl gap-0.5 sm:gap-1 overflow-x-auto max-w-full">
            {[
              { label: "All", value: "ALL" },
              { label: "In Progress", value: "IN_PROGRESS" },
              { label: "Pending", value: "PLANNING" },
              { label: "Done", value: "COMPLETED" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  "px-2.5 sm:px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap",
                  statusFilter === tab.value
                    ? "bg-white text-[#111827] shadow-2xs"
                    : "text-[#6B7280] hover:text-[#111827]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Priority Select */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-8 px-2.5 sm:px-3 text-xs font-semibold rounded-xl border border-[#E5E7EB] bg-white text-[#4B5563] focus:outline-none focus:ring-2 focus:ring-[#88C315]/30 cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <Link
            href="/projects/new"
            className="inline-flex items-center gap-1.5 sm:gap-2 h-8 px-3 sm:px-3.5 text-xs font-bold rounded-xl bg-[#88C315] hover:bg-[#77AB12] text-white transition-colors shadow-2xs cursor-pointer ml-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Project</span>
          </Link>
        </div>
      </div>

      {/* Main Table Container with smooth horizontal scrolling */}
      <div className="bg-white border border-[#EAEDF2] rounded-2xl shadow-2xs min-h-[360px] pb-8 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#EAEDF2] text-[11px] font-extrabold uppercase tracking-wider text-[#6B7280]">
                <th className="py-3.5 pl-6 pr-4">Project</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Progress</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Lead</th>
                <th className="py-3.5 px-4">Team</th>
                <th className="py-3.5 px-4">Deadline</th>
                <th className="py-3.5 pr-6 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEDF2] text-xs">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#9CA3AF]">
                    <LayoutGrid className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-sm text-[#4B5563]">No projects found</p>
                    <p className="text-xs mt-0.5">Try clearing filters or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project, idx) => {
                  const priority =
                    priorityConfig[project.priority] || priorityConfig.MEDIUM;

                  const formattedDeadline = project.deadline
                    ? new Date(project.deadline).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "No deadline";

                  const isLastRow = idx === filteredProjects.length - 1;

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-[#F9FAFC] transition-colors group"
                    >
                      {/* Project Name & Key */}
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-[#88C315] text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs sm:text-sm group-hover:scale-105 transition-transform">
                            {project.key.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <Link
                                href={`/projects/${project.id}`}
                                className="font-bold text-xs sm:text-[13px] text-[#111827] hover:text-[#88C315] transition-colors truncate max-w-[150px] sm:max-w-[200px]"
                              >
                                {project.name}
                              </Link>
                              <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 bg-[#F3F4F6] text-[#4B5563] rounded border border-[#E5E7EB]">
                                {project.key}
                              </span>
                            </div>
                            {project.description && (
                              <p className="text-[10px] sm:text-[11px] text-[#9CA3AF] truncate max-w-xs mt-0.5">
                                {project.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Interactive Status Badge Dropdown */}
                      <td className="py-4 px-4 relative">
                        <ProjectStatusSelect
                          projectId={project.id}
                          initialStatus={project.status}
                        />
                      </td>

                      {/* Progress Bar & Tasks */}
                      <td className="py-4 px-4 min-w-[140px] sm:min-w-[160px]">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[#111827]">
                              {project.progress}%
                            </span>
                            <span className="text-[#9CA3AF] font-medium text-[10px] sm:text-[11px]">
                              {project.completedTasks}/{project.totalTasks} tasks
                            </span>
                          </div>
                          <div className="h-2 w-full bg-[#F3F4F6] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#88C315] rounded-full transition-all duration-300"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-transparent",
                            priority.bg,
                            priority.text
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full shrink-0",
                              priority.dot
                            )}
                          />
                          <span>{priority.label}</span>
                        </span>
                      </td>

                      {/* Lead */}
                      <td className="py-4 px-4">
                        {project.lead ? (
                          <div className="flex items-center gap-2">
                            <Avatar
                              name={project.lead.name}
                              src={project.lead.avatar}
                              size="xs"
                              className="h-6 w-6 rounded-full ring-1 ring-border"
                            />
                            <span className="font-semibold text-[#374151] truncate max-w-[90px]">
                              {project.lead.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#9CA3AF] italic">Unassigned</span>
                        )}
                      </td>

                      {/* Team Avatars Stack */}
                      <td className="py-4 px-4">
                        <div className="flex items-center -space-x-1.5 overflow-hidden">
                          {project.members?.slice(0, 3).map((m, i) => (
                            <Avatar
                              key={i}
                              name={m.user.name}
                              src={m.user.avatar}
                              size="xs"
                              className="h-6 w-6 rounded-full ring-2 ring-white"
                            />
                          ))}
                          {(project.members?.length || 0) > 3 && (
                            <div className="h-6 w-6 rounded-full bg-[#F3F4F6] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#6B7280]">
                              +{project.members!.length - 3}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Deadline */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-[#6B7280]">
                          <Calendar className="h-3.5 w-3.5 text-[#9CA3AF]" />
                          <span className="font-medium">{formattedDeadline}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 pl-4 text-right relative">
                        <div className="relative inline-block" ref={activeActionMenu === project.id ? actionMenuRef : undefined}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveActionMenu(
                                activeActionMenu === project.id ? null : project.id
                              );
                            }}
                            className="p-1 text-[#9CA3AF] hover:text-[#111827] rounded-lg hover:bg-[#F3F4F6] transition-colors cursor-pointer"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {activeActionMenu === project.id && (
                            <div
                              className={cn(
                                "absolute right-0 w-48 bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl z-[100] py-2 text-xs animate-in font-medium text-left",
                                isLastRow && filteredProjects.length > 2 ? "bottom-full mb-1" : "top-full mt-1"
                              )}
                            >
                              <Link
                                href={`/projects/${project.id}`}
                                onClick={() => setActiveActionMenu(null)}
                                className="flex items-center gap-2 px-3.5 py-2 hover:bg-[#F3F4F6] text-[#374151] rounded-xl mx-1"
                              >
                                <Folder className="h-3.5 w-3.5 text-[#9CA3AF]" />
                                <span>Project Details</span>
                              </Link>
                              <Link
                                href={`/projects/${project.id}/board`}
                                onClick={() => setActiveActionMenu(null)}
                                className="flex items-center gap-2 px-3.5 py-2 hover:bg-[#F3F4F6] text-[#374151] rounded-xl mx-1"
                              >
                                <ExternalLink className="h-3.5 w-3.5 text-[#9CA3AF]" />
                                <span>Kanban Board</span>
                              </Link>
                              <Link
                                href={`/projects/${project.id}/settings`}
                                onClick={() => setActiveActionMenu(null)}
                                className="flex items-center gap-2 px-3.5 py-2 hover:bg-[#F3F4F6] text-[#374151] rounded-xl mx-1"
                              >
                                <Edit className="h-3.5 w-3.5 text-[#9CA3AF]" />
                                <span>Project Settings</span>
                              </Link>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
