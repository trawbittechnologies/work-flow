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
  ShieldCheck,
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

export function Sidebar({ user, unreadNotifications: _unreadNotifications = 0 }: SidebarProps) {
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
      className="fixed left-0 top-0 h-full w-[var(--sidebar-width)] bg-white border-r border-[#DDE2D8] flex flex-col z-30 hidden md:flex transition-all duration-200"
      aria-label="Trawbit FlowDesk Navigation"
    >
      {/* Brand Header */}
      <div className="px-6 py-6 flex-shrink-0 flex items-center justify-between border-b border-[#DDE2D8]/60 bg-white">
        <Link
          href="/dashboard"
          onClick={() => setNavigatingHref("/dashboard")}
          className="flex items-center gap-3 group"
        >
          {/* Trawbit Official Emblem Icon */}
          <div className="relative h-8 w-8 rounded-[2px] overflow-hidden flex items-center justify-center flex-shrink-0 shadow-2xs border border-[#DDE2D8] group-hover:border-[#071A49] transition-colors">
            <Image
              src="/logo.png"
              alt="Trawbit Logo"
              width={32}
              height={32}
              className="h-8 w-8 object-cover rounded-[2px]"
              priority
            />
          </div>
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-[17px] font-black text-[#071A49] tracking-tight font-display">
              Trawbit
            </span>
            <span className="text-[17px] font-black text-[#B7D600] tracking-tight font-display">
              FlowDesk
            </span>
          </div>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto bg-tech-grid">
        {/* MAIN MENU */}
        <div className="space-y-1">
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              onClick={() => setNavigatingHref("/admin")}
              className={cn(
                "group flex items-center gap-3 px-3 py-2 rounded-[2px] text-[13px] font-bold transition-all duration-150 relative mb-1.5 border",
                isActive("/admin")
                  ? "bg-[#F1F8CE] text-[#071A49] border-[#B7D600] shadow-2xs"
                  : "border-transparent text-[#586274] hover:bg-[#F0F2EC] hover:text-[#071A49]"
              )}
            >
              <ShieldCheck className="h-4 w-4 text-[#071A49] flex-shrink-0" />
              <span className="flex-1 truncate font-medium">Admin Portal</span>
            </Link>
          )}
          {mainNav.map((item) => {
            const active = isActive(item.href);
            const isNavigating = navigatingHref === item.href && pathname !== item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setNavigatingHref(item.href)}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2 rounded-[2px] text-[13px] font-medium transition-all duration-150 relative border",
                  active
                    ? "bg-[#F1F8CE] text-[#071A49] font-bold border-[#B7D600] shadow-2xs"
                    : "border-transparent text-[#586274] hover:bg-[#F0F2EC] hover:text-[#071A49]"
                )}
              >
                {isNavigating ? (
                  <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-[#071A49]" />
                ) : (
                  <item.icon
                    className={cn(
                      "h-4 w-4 flex-shrink-0 transition-colors duration-150",
                      active
                        ? "text-[#071A49]"
                        : "text-[#8E99A8] group-hover:text-[#071A49]"
                    )}
                    strokeWidth={active ? 2.3 : 1.9}
                  />
                )}
                <span className="flex-1 truncate">{item.label}</span>
                {isNavigating && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#B7D600] animate-ping" />
                )}
              </Link>
            );
          })}
        </div>

        {/* YOUR PROJECTS SECTION */}
        <div className="pt-2 border-t border-[#DDE2D8]/60">
          <div className="flex items-center justify-between px-3 mb-2.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#071A49]">
              Your Projects
            </span>
            <Link
              href="/projects/new"
              className="p-1 text-[#8E99A8] hover:text-[#071A49] hover:bg-[#F0F2EC] rounded-[2px] transition-colors cursor-pointer"
              title="Add Project"
            >
              <Plus className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-0.5">
            {yourProjects.map((project) => (
              <Link
                key={project.name}
                href={project.href}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-[2px] text-[12px] font-medium text-[#586274] hover:bg-[#F0F2EC] hover:text-[#071A49] transition-all duration-150"
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-[2px] flex-shrink-0",
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
