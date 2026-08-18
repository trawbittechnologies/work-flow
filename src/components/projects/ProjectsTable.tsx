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
  Clock,
  AlertCircle,
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

      let matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      if (statusFilter === "PLANNING" || statusFilter === "PENDING") {
        matchesStatus = p.status === "PLANNING" || p.status === "PENDING" || p.status === "NOT_STARTED";
      } else if (statusFilter === "IN_PROGRESS") {
        matchesStatus = p.status === "IN_PROGRESS";
      } else if (statusFilter === "COMPLETED") {
        matchesStatus = p.status === "COMPLETED";
      }

      const matchesPriority =
        priorityFilter === "ALL" || p.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [initialProjects, searchQuery, statusFilter, priorityFilter]);

  const stats = useMemo(() => {
    const total = initialProjects.length;
    const inProgress = initialProjects.filter((p) => p.status === "IN_PROGRESS").length;
    const completed = initialProjects.filter((p) => p.status === "COMPLETED").length;
    const planning = initialProjects.filter((p) => p.status === "PLANNING" || p.status === "PENDING" || p.status === "NOT_STARTED").length;
    return { total, inProgress, completed, planning };
  }, [initialProjects]);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#DDE2D8] rounded-[2px] p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-mono font-bold text-[#586274] uppercase tracking-wider">
              Total Projects
            </span>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-[2px] bg-[#F1F8CE] text-[#071A49] border border-[#B7D600] flex items-center justify-center">
              <Folder className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-display text-[#071A49] mt-2">
            {stats.total}
          </div>
        </div>

        <div className="bg-white border border-[#DDE2D8] rounded-[2px] p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-mono font-bold text-[#586274] uppercase tracking-wider">
              Progressing
            </span>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-[2px] bg-[#F1F8CE] text-[#071A49] border border-[#B7D600] flex items-center justify-center">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-display text-[#071A49] mt-2">
            {stats.inProgress}
          </div>
        </div>

        <div className="bg-white border border-[#DDE2D8] rounded-[2px] p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-mono font-bold text-[#586274] uppercase tracking-wider">
              Completed
            </span>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-[2px] bg-[#ECFDF5] text-[#16A34A] border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-display text-[#16A34A] mt-2">
            {stats.completed}
          </div>
        </div>

        <div className="bg-white border border-[#DDE2D8] rounded-[2px] p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-mono font-bold text-[#586274] uppercase tracking-wider">
              Pending
            </span>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-[2px] bg-[#FFFBEB] text-[#D97706] border border-amber-200 flex items-center justify-center">
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-display text-[#D97706] mt-2">
            {stats.planning}
          </div>
        </div>
      </div>

      {/* Modern Filter Toolbar */}
      <div className="bg-white border border-[#DDE2D8] rounded-[2px] p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E99A8]" />
          <input
            type="search"
            placeholder="Filter projects by title, key, lead..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-xs font-medium rounded-[2px] border border-[#DDE2D8] bg-[#F8F9F6] text-[#071A49] placeholder:text-[#8E99A8] focus:outline-none focus:ring-1 focus:ring-[#071A49] focus:border-[#071A49] transition-all"
          />
        </div>

        {/* Status Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <div className="flex items-center bg-[#F0F2EC] p-0.5 rounded-[2px] gap-0.5 sm:gap-1 overflow-x-auto max-w-full border border-[#DDE2D8]">
            {[
              { label: "ALL", value: "ALL" },
              { label: "PROGRESSING", value: "IN_PROGRESS" },
              { label: "PENDING", value: "PENDING" },
              { label: "TESTING", value: "TESTING" },
              { label: "HOLD", value: "ON_HOLD" },
              { label: "REVIEW", value: "REVIEW" },
              { label: "COMPLETE", value: "COMPLETED" },
              { label: "RE-OPEN", value: "REOPENED" },
              { label: "CANCEL", value: "CANCELLED" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  "px-2.5 sm:px-3 py-1 text-xs font-mono font-bold rounded-[2px] transition-all cursor-pointer whitespace-nowrap",
                  statusFilter === tab.value
                    ? "bg-[#071A49] text-[#B7D600] shadow-2xs"
                    : "text-[#586274] hover:text-[#071A49]"
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
              className="h-8 px-2.5 sm:px-3 text-xs font-mono font-bold rounded-[2px] border border-[#DDE2D8] bg-white text-[#071A49] focus:outline-none focus:ring-1 focus:ring-[#071A49] cursor-pointer"
            >
              <option value="ALL">ALL PRIORITIES</option>
              <option value="HIGH">HIGH PRIORITY</option>
              <option value="MEDIUM">MEDIUM PRIORITY</option>
              <option value="LOW">LOW PRIORITY</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <Link
            href="/projects/new"
            className="inline-flex items-center gap-1.5 sm:gap-2 h-8 px-3 sm:px-3.5 text-xs font-bold font-mono uppercase rounded-[2px] bg-[#071A49] hover:bg-[#041030] text-[#B7D600] transition-colors shadow-2xs cursor-pointer ml-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Project</span>
          </Link>
        </div>
      </div>

      {/* Main Table Container with smooth horizontal scrolling */}
      <div className="bg-white border border-[#DDE2D8] rounded-[2px] shadow-xs min-h-[360px] pb-8 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-[#F0F2EC] border-b border-[#DDE2D8] text-[11px] font-mono font-bold uppercase tracking-wider text-[#071A49]">
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
            <tbody className="divide-y divide-[#DDE2D8] text-xs">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#8E99A8]">
                    <LayoutGrid className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="font-bold uppercase font-display text-sm text-[#071A49]">No projects found</p>
                    <p className="text-xs text-[#586274] mt-0.5">Try clearing filters or search query.</p>
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
                      className="hover:bg-[#F8F9F6] transition-colors group"
                    >
                      {/* Project Name & Key */}
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-[2px] bg-[#071A49] text-[#B7D600] border border-[#071A49] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                            <ProjectIcon name={project.icon} className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <Link
                                href={`/projects/${project.id}`}
                                className="font-bold text-xs sm:text-[13px] text-[#071A49] hover:text-[#041030] transition-colors truncate max-w-[150px] sm:max-w-[200px]"
                              >
                                {project.name}
                              </Link>
                              <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 bg-[#F0F2EC] text-[#586274] rounded-[2px] border border-[#DDE2D8]">
                                {project.key}
                              </span>
                            </div>
                            {project.description && (
                              <p className="text-[10px] sm:text-[11px] text-[#586274] truncate max-w-xs mt-0.5">
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
                            <span className="font-mono font-bold text-[#071A49]">
                              {project.progress}%
                            </span>
                            <span className="text-[#586274] font-mono text-[10px] sm:text-[11px]">
                              {project.completedTasks}/{project.totalTasks} tasks
                            </span>
                          </div>
                          <div className="h-2 w-full bg-[#F0F2EC] rounded-[2px] overflow-hidden">
                            <div
                              className="h-full bg-[#B7D600] rounded-[2px] transition-all duration-300"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold border border-[#DDE2D8]",
                            priority.bg,
                            priority.text
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-[2px] shrink-0",
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
                              className="h-6 w-6 rounded-[2px] ring-1 ring-[#DDE2D8]"
                            />
                            <span className="font-semibold text-[#071A49] truncate max-w-[90px]">
                              {project.lead.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#8E99A8] italic font-mono text-[11px]">Unassigned</span>
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
                              className="h-6 w-6 rounded-[2px] ring-1 ring-white"
                            />
                          ))}
                          {(project.members?.length || 0) > 3 && (
                            <div className="h-6 w-6 rounded-[2px] bg-[#F0F2EC] border border-[#DDE2D8] flex items-center justify-center text-[10px] font-mono font-bold text-[#586274]">
                              +{project.members!.length - 3}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Deadline */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-[#586274] font-mono text-[11px]">
                          <Calendar className="h-3.5 w-3.5 text-[#8E99A8]" />
                          <span>{formattedDeadline}</span>
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
                            className="p-1 text-[#8E99A8] hover:text-[#071A49] rounded-[2px] hover:bg-[#F0F2EC] transition-colors cursor-pointer"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {activeActionMenu === project.id && (
                            <div
                              className={cn(
                                "absolute right-0 w-48 bg-white border border-[#DDE2D8] rounded-[2px] shadow-sm z-[100] py-1 text-xs font-medium text-left",
                                isLastRow && filteredProjects.length > 2 ? "bottom-full mb-1" : "top-full mt-1"
                              )}
                            >
                              <Link
                                href={`/projects/${project.id}`}
                                onClick={() => setActiveActionMenu(null)}
                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F0F2EC] text-[#071A49] rounded-[2px] mx-1"
                              >
                                <Folder className="h-3.5 w-3.5 text-[#8E99A8]" />
                                <span>Project Details</span>
                              </Link>
                              <Link
                                href={`/projects/${project.id}/board`}
                                onClick={() => setActiveActionMenu(null)}
                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F0F2EC] text-[#071A49] rounded-[2px] mx-1"
                              >
                                <ExternalLink className="h-3.5 w-3.5 text-[#8E99A8]" />
                                <span>Kanban Board</span>
                              </Link>
                              <Link
                                href={`/projects/${project.id}/settings`}
                                onClick={() => setActiveActionMenu(null)}
                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F0F2EC] text-[#071A49] rounded-[2px] mx-1"
                              >
                                <Edit className="h-3.5 w-3.5 text-[#8E99A8]" />
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
