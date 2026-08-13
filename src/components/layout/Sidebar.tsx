"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  MessageSquare,
  LayoutGrid,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    avatar?: string | null;
    role?: "ADMIN" | "MEMBER";
  };
  unreadNotifications?: number;
}

export function Sidebar({ user, unreadNotifications = 0 }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  }

  const workspaceNav = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Projects", href: "/projects", icon: FolderKanban },
    { label: "My Tasks", href: "/tasks", icon: CheckSquare },
  ];

  const collaborationNav = [
    { label: "Team", href: "/team", icon: Users },
    { label: "Chat", href: "/chat", icon: MessageSquare },
  ];

  return (
    <aside
      className="fixed left-0 top-0 h-full w-[var(--sidebar-width)] bg-surface border-r border-border flex flex-col z-30 hidden md:flex transition-all duration-200"
      aria-label="LimeFlow Navigation Sidebar"
    >
      {/* Workspace Brand Header */}
      <div className="px-5 py-4 flex-shrink-0 flex items-center justify-between border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="h-9 w-9 bg-[#172018] rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs text-[#C3D946] group-hover:scale-105 transition-transform duration-200">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black text-[#172018] tracking-tight leading-none">
              Flowdesk
            </span>
            <span className="text-[10px] font-bold text-[#8A918A] tracking-widest uppercase mt-1">
              LimeFlow Workspace
            </span>
          </div>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {/* WORKSPACE SECTION */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-black uppercase tracking-widest text-[#8A918A]">
            Workspace
          </div>
          <div className="space-y-1">
            {workspaceNav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 border border-transparent",
                    active
                      ? "bg-[#F2F4EA] text-[#172018] font-black border-[#E4E8DD] shadow-2xs"
                      : "text-[#667066] hover:bg-[#F2F4EA] hover:text-[#172018]"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-[#C3D946] rounded-r-full glow-lime" />
                  )}
                  <item.icon
                    className={cn(
                      "h-4 w-4 flex-shrink-0 transition-colors duration-150",
                      active ? "text-[#172018]" : "text-[#8A918A] group-hover:text-[#172018]"
                    )}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* COLLABORATION SECTION */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-black uppercase tracking-widest text-[#8A918A]">
            Collaboration
          </div>
          <div className="space-y-1">
            {collaborationNav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 border border-transparent",
                    active
                      ? "bg-[#F2F4EA] text-[#172018] font-black border-[#E4E8DD] shadow-2xs"
                      : "text-[#667066] hover:bg-[#F2F4EA] hover:text-[#172018]"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-[#C3D946] rounded-r-full glow-lime" />
                  )}
                  <item.icon
                    className={cn(
                      "h-4 w-4 flex-shrink-0 transition-colors duration-150",
                      active ? "text-[#172018]" : "text-[#8A918A] group-hover:text-[#172018]"
                    )}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              );
            })}

            {/* Notifications Link */}
            <Link
              href="/notifications"
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 border border-transparent",
                isActive("/notifications")
                  ? "bg-[#F2F4EA] text-[#172018] font-black border-[#E4E8DD] shadow-2xs"
                  : "text-[#667066] hover:bg-[#F2F4EA] hover:text-[#172018]"
              )}
            >
              {isActive("/notifications") && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-[#C3D946] rounded-r-full glow-lime" />
              )}
              <Bell
                className={cn(
                  "h-4 w-4 flex-shrink-0 transition-colors duration-150",
                  isActive("/notifications") ? "text-[#172018]" : "text-[#8A918A] group-hover:text-[#172018]"
                )}
              />
              <span className="flex-1 truncate">Notifications</span>
              {unreadNotifications > 0 && (
                <span className="ml-auto h-4.5 min-w-[18px] px-1 bg-[#C3D946] text-[#172018] text-[10px] font-black rounded-full flex items-center justify-center shadow-2xs">
                  {unreadNotifications > 99 ? "99+" : unreadNotifications}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* ADMINISTRATION SECTION */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-black uppercase tracking-widest text-[#8A918A]">
            Administration
          </div>
          <div className="space-y-1">
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 border",
                  isActive("/admin")
                    ? "bg-[#F2F4EA] text-[#172018] font-black border-[#E4E8DD] shadow-2xs"
                    : "bg-[#F2F4EA]/60 text-[#667066] border-[#E4E8DD] hover:bg-[#F2F4EA] hover:text-[#172018]"
                )}
              >
                <ShieldCheck className="h-4 w-4 flex-shrink-0 text-[#8A918A]" />
                <span className="flex-1">Admin Portal</span>
              </Link>
            )}

            <Link
              href="/settings"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 border border-transparent",
                isActive("/settings")
                  ? "bg-[#F2F4EA] text-[#172018] font-black border-[#E4E8DD] shadow-2xs"
                  : "text-[#667066] hover:bg-[#F2F4EA] hover:text-[#172018]"
              )}
            >
              <Settings className="h-4 w-4 flex-shrink-0 text-[#8A918A]" />
              Settings
            </Link>
          </div>
        </div>
      </nav>

      {/* Footer / User Profile */}
      <div className="px-3 py-3 border-t border-border flex-shrink-0 bg-[#F2F4EA]/40 space-y-2">
        {/* User Card */}
        <Link
          href="/profile"
          className="flex items-center gap-2.5 p-2 rounded-xl transition-all duration-150 hover:bg-[#F2F4EA] group border border-transparent hover:border-border"
        >
          <Avatar name={user.name} src={user.avatar} size="sm" className="flex-shrink-0 ring-1 ring-border" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#172018] truncate leading-snug">{user.name}</p>
            <p className="text-[10px] text-[#8A918A] truncate leading-none mt-0.5">{user.email}</p>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-[#8A918A] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </Link>

        {/* Spaced Sign Out Button */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#667066] hover:bg-danger-subtle hover:text-danger transition-all duration-150 cursor-pointer border border-transparent hover:border-danger/20"
        >
          <LogOut className="h-4 w-4 flex-shrink-0 text-danger/80" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
