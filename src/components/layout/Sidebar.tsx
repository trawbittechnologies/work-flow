"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Loader2,
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
  const [navigatingHref, setNavigatingHref] = useState<string | null>(null);

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
        <Link
          href="/dashboard"
          onClick={() => setNavigatingHref("/dashboard")}
          className="flex items-center gap-2.5 group"
        >
          {/* Trawbit Official Logo */}
          <div className="relative h-8 w-8 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Trawbit Logo"
              width={36}
              height={36}
              className="h-8 w-8 object-contain scale-[2.2] object-[20%_50%]"
              priority
            />
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
            const isNavigating = navigatingHref === item.href && pathname !== item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setNavigatingHref(item.href)}
                className={cn(
                  "group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 relative",
                  active
                    ? "bg-[#F3F9DE] text-[#111827] font-bold shadow-2xs"
                    : "text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#111827]"
                )}
              >
                {isNavigating ? (
                  <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-[#88C315]" />
                ) : (
                  <item.icon
                    className={cn(
                      "h-4 w-4 flex-shrink-0 transition-colors duration-150",
                      active
                        ? "text-[#88C315]"
                        : "text-[#9CA3AF] group-hover:text-[#111827]"
                    )}
                    strokeWidth={active ? 2.3 : 1.9}
                  />
                )}
                <span className="flex-1 truncate">{item.label}</span>
                {isNavigating && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#88C315] animate-ping" />
                )}
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
              className="p-0.5 text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] rounded transition-colors cursor-pointer"
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
    </aside>
  );
}
