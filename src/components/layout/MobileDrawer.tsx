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
      <div className="relative w-[300px] max-w-[85vw] h-full bg-white flex flex-col z-10 shadow-2xl slide-in-right overflow-hidden border-r border-[#EAEDF2]">
        {/* Brand Header & Close */}
        <div className="p-4 border-b border-[#EAEDF2] flex items-center justify-between bg-[#F8F9FA]">
          <Link href="/dashboard" onClick={close} className="flex items-center gap-2.5">
            <div className="relative h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Image
                src="/logo.png"
                alt="Trawbit Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-cover rounded-lg"
                priority
              />
            </div>
            <div className="flex items-center gap-1 leading-none">
              <span className="text-base font-black text-[#111827] tracking-tight">Trawbit</span>
              <span className="text-base font-black text-[#98CD28] tracking-tight">FlowDesk</span>
            </div>
          </Link>

          <button
            onClick={close}
            className="p-1.5 rounded-xl text-[#9CA3AF] hover:text-[#111827] hover:bg-white transition-colors cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="p-3.5 mx-3 mt-3 rounded-2xl bg-[#F6F8FA] border border-[#EAEDF2] flex items-center gap-3">
          <Avatar
            name={displayName}
            src={user.avatar}
            size="md"
            className="ring-1 ring-border rounded-full"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#111827] truncate">{displayName}</p>
            <p className="text-[11px] text-[#6B7280] truncate mt-0.5">{user.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F3F9DE] text-[#659A08]">
              {displayRole}
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {/* Main Menu */}
          <div className="space-y-1">
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={close}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
                  isActive("/admin")
                    ? "bg-[#F3F9DE] text-[#111827]"
                    : "text-[#4B5563] hover:bg-[#F7F8FA] hover:text-[#111827]"
                )}
              >
                <ShieldCheck className="h-4 w-4 text-[#88C315] flex-shrink-0" />
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
                    "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all",
                    active
                      ? "bg-[#F3F9DE] text-[#111827] font-bold"
                      : "text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#111827]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        active ? "text-[#88C315]" : "text-[#9CA3AF]"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#88C315] text-white">
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Your Projects Section */}
          <div className="pt-2 border-t border-[#EAEDF2]">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[11px] font-bold text-[#111827] uppercase tracking-wider">
                Your Projects
              </span>
              <Link
                href="/projects/new"
                onClick={close}
                className="p-1 text-[#9CA3AF] hover:text-[#111827] rounded hover:bg-[#F3F4F6] transition-colors"
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
                  onClick={close}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#4B5563] hover:bg-[#F7F8FA] hover:text-[#111827] transition-all"
                >
                  <span className={cn("h-2 w-2 rounded-full shrink-0", project.color)} />
                  <span className="truncate">{project.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#EAEDF2] bg-[#F8F9FA] space-y-1">
          <Link
            href="/profile"
            onClick={close}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#4B5563] hover:bg-white transition-colors"
          >
            <UserIcon className="h-4 w-4 text-[#9CA3AF]" />
            <span>Profile</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#EF4444] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-[#EF4444]" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
