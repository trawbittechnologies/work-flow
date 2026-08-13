"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  LayoutGrid,
  Calendar,
  Clock,
  BarChart2,
  Users,
  Settings,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    avatar?: string | null;
    role?: "ADMIN" | "MEMBER";
  };
  unreadNotifications?: number;
}

export function Sidebar({ user: _user, unreadNotifications: _unreadNotifications = 0 }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  }

  const mainNav = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Projects", href: "/projects", icon: FolderKanban },
    { label: "Tasks", href: "/tasks", icon: CheckSquare },
    { label: "Board", href: "/board", icon: LayoutGrid },
    { label: "Calendar", href: "/calendar", icon: Calendar },
    { label: "Time Tracking", href: "/time-tracking", icon: Clock },
    { label: "Reports", href: "/reports", icon: BarChart2 },
    { label: "Members", href: "/team", icon: Users },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const yourProjects = [
    { name: "Website Redesign", color: "bg-[#84CC16]", href: "/projects" },
    { name: "Mobile App", color: "bg-[#8B5CF6]", href: "/projects" },
    { name: "Marketing Campaign", color: "bg-[#F59E0B]", href: "/projects" },
    { name: "Product Design", color: "bg-[#EC4899]", href: "/projects" },
    { name: "Internal Tool", color: "bg-[#3B82F6]", href: "/projects" },
  ];

  return (
    <aside
      className="fixed left-0 top-0 h-full w-[var(--sidebar-width)] bg-white border-r border-[#EBECEF] flex flex-col z-30 hidden md:flex transition-all duration-200"
      aria-label="Trawbit FlowDesk Navigation"
    >
      {/* Brand Header */}
      <div className="px-6 py-6 flex-shrink-0 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          {/* Stylized X/Leaf Logo Icon */}
          <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7"
            >
              <path
                d="M8 8L24 24M24 8L8 24"
                stroke="#94CB1E"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="8" cy="8" r="2.5" fill="#94CB1E" />
              <circle cx="24" cy="8" r="2.5" fill="#94CB1E" />
              <circle cx="8" cy="24" r="2.5" fill="#94CB1E" />
              <circle cx="24" cy="24" r="2.5" fill="#94CB1E" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[17px] font-black text-[#111827] tracking-tight">
              Trawbit
            </span>
            <span className="text-[17px] font-black text-[#94CB1E] tracking-tight">
              FlowDesk
            </span>
          </div>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 py-2 space-y-6 overflow-y-auto">
        {/* MAIN MENU */}
        <div className="space-y-1">
          {mainNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150",
                  active
                    ? "bg-[#F3F9DE] text-[#111827] font-bold shadow-2xs"
                    : "text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#111827]"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 flex-shrink-0 transition-colors duration-150",
                    active
                      ? "text-[#88C315]"
                      : "text-[#9CA3AF] group-hover:text-[#111827]"
                  )}
                  strokeWidth={active ? 2.3 : 1.9}
                />
                <span className="flex-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* YOUR PROJECTS SECTION */}
        <div className="pt-2">
          <div className="flex items-center justify-between px-3.5 mb-2.5">
            <span className="text-[12px] font-bold text-[#111827] tracking-tight">
              Your Projects
            </span>
            <Link
              href="/projects/new"
              className="p-0.5 text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] rounded transition-colors"
              title="Add Project"
            >
              <Plus className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-1">
            {yourProjects.map((project) => (
              <Link
                key={project.name}
                href={project.href}
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13px] font-medium text-[#4B5563] hover:bg-[#F7F8FA] hover:text-[#111827] transition-all duration-150"
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full flex-shrink-0",
                    project.color
                  )}
                />
                <span className="truncate">{project.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Upgrade Plan Card Footer */}
      <div className="p-4 flex-shrink-0">
        <div className="bg-[#F6F7FA] border border-[#EAEDF2] rounded-2xl p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-[#111827] leading-tight">
                Upgrade Plan
              </p>
              <p className="text-[10px] text-[#6B7280] leading-tight mt-0.5 line-clamp-2">
                Unlock advanced features for your team.
              </p>
            </div>
          </div>
          <button
            aria-label="Upgrade details"
            className="h-7 w-7 rounded-full border border-[#D1D5DB] flex items-center justify-center text-[#4B5563] hover:bg-white hover:text-black hover:border-gray-400 transition-all flex-shrink-0 cursor-pointer shadow-2xs"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
