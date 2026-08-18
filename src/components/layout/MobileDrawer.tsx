"use client";

import React, { useEffect, useRef } from "react";
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
  X,
  LogOut,
  User as UserIcon,
  MessageSquare,
  Bell,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import { useMobileMenu } from "@/lib/useMobileMenu";

interface MobileDrawerProps {
  user: {
    name: string;
    email: string;
    avatar?: string | null;
    role?: "ADMIN" | "MEMBER";
  };
  unreadNotifications?: number;
}

export function MobileDrawer({
  user,
  unreadNotifications = 0,
}: MobileDrawerProps) {
  const pathname = usePathname();
  const { isOpen, close } = useMobileMenu();
  const prevPathname = useRef(pathname);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close drawer on route change (only when route actually changes, not on initial mount)
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      close();
    }
  }, [pathname, close]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  if (!isOpen) return null;

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
    { label: "Chat & DMs", href: "/chat", icon: MessageSquare },
    { label: "Notifications", href: "/notifications", icon: Bell, count: unreadNotifications },
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

  const displayName = user.name || "Athul Krishna";
  const displayRole = user.role === "ADMIN" ? "Admin" : "Member";

  return (
    <div className="fixed inset-0 z-[100] md:hidden flex" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in transition-opacity"
        onClick={close}
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative w-[300px] max-w-[85vw] h-full bg-white flex flex-col z-10 shadow-2xl slide-in-left overflow-hidden border-r border-[#DDE2D8]">
        {/* Brand Header & Close */}
        <div className="p-4 border-b border-[#DDE2D8] flex items-center justify-between bg-[#F8F9F6]">
          <Link href="/dashboard" onClick={close} className="flex items-center gap-2.5">
            <div className="relative h-8 w-8 rounded-[2px] overflow-hidden flex items-center justify-center flex-shrink-0 shadow-2xs border border-[#DDE2D8]">
              <Image
                src="/logo.png"
                alt="Trawbit Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-cover rounded-[2px]"
                priority
              />
            </div>
            <div className="flex items-center gap-1 leading-none font-display">
              <span className="text-base font-black text-[#071A49] tracking-tight">Trawbit</span>
              <span className="text-base font-black text-[#B7D600] tracking-tight">FlowDesk</span>
            </div>
          </Link>

          <button
            onClick={close}
            className="p-1.5 rounded-[2px] text-[#8E99A8] hover:text-[#071A49] hover:bg-[#F0F2EC] transition-colors cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="p-3.5 mx-3 mt-3 rounded-[2px] bg-[#F8F9F6] border border-[#DDE2D8] flex items-center gap-3">
          <Avatar
            name={displayName}
            src={user.avatar}
            size="md"
            className="ring-1 ring-[#DDE2D8] rounded-[2px]"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#071A49] truncate">{displayName}</p>
            <p className="text-[11px] text-[#586274] truncate mt-0.5">{user.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-bold bg-[#F1F8CE] text-[#071A49] border border-[#B7D600]">
              {displayRole}
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 bg-tech-grid">
          {/* Main Menu */}
          <div className="space-y-1">
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={close}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-[2px] text-xs font-bold transition-all border",
                  isActive("/admin")
                    ? "bg-[#F1F8CE] text-[#071A49] border-[#B7D600]"
                    : "border-transparent text-[#586274] hover:bg-[#F0F2EC] hover:text-[#071A49]"
                )}
              >
                <ShieldCheck className="h-4 w-4 text-[#B7D600] flex-shrink-0" />
                <span>Admin Portal</span>
              </Link>
            )}

            {mainNav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={close}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-[2px] text-xs font-semibold transition-all border",
                    active
                      ? "bg-[#F1F8CE] text-[#071A49] font-bold border-[#B7D600]"
                      : "border-transparent text-[#586274] hover:bg-[#F0F2EC] hover:text-[#071A49]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        active ? "text-[#071A49]" : "text-[#8E99A8]"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="px-1.5 py-0.2 rounded-[2px] font-mono text-[10px] font-bold bg-[#B7D600] text-[#071A49] border border-[#071A49]">
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Your Projects Section */}
          <div className="pt-2 border-t border-[#DDE2D8]">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[11px] font-bold text-[#071A49] uppercase tracking-wider">
                Your Projects
              </span>
              <Link
                href="/projects/new"
                onClick={close}
                className="p-1 text-[#8E99A8] hover:text-[#071A49] rounded-[2px] hover:bg-[#F0F2EC] transition-colors"
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
                  onClick={close}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-[2px] text-xs font-medium text-[#586274] hover:bg-[#F0F2EC] hover:text-[#071A49] transition-all"
                >
                  <span className={cn("h-2 w-2 rounded-[2px] shrink-0", project.color)} />
                  <span className="truncate">{project.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#DDE2D8] bg-[#F8F9F6] space-y-1">
          <Link
            href="/profile"
            onClick={close}
            className="flex items-center gap-2.5 px-3 py-2 rounded-[2px] text-xs font-bold text-[#586274] hover:bg-white transition-colors"
          >
            <UserIcon className="h-4 w-4 text-[#8E99A8]" />
            <span>Profile</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[2px] text-xs font-bold text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-[#DC2626]" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
