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
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    avatar?: string | null;
    role?: "ADMIN" | "MEMBER";
  };
  unreadNotifications?: number;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "My Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Team", href: "/team", icon: Users },
  { label: "Chat", href: "/chat", icon: MessageSquare },
];

export function Sidebar({ user, unreadNotifications = 0 }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="fixed left-0 top-0 h-full w-[var(--sidebar-width)] bg-surface border-r border-border flex flex-col z-30 hidden md:flex transition-all duration-200"
      aria-label="Main navigation"
    >
      {/* Logo Header */}
      <div className="px-5 py-5 flex-shrink-0 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="h-9 w-9 bg-[#0A1237] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md text-[#C3D946] group-hover:scale-105 transition-transform duration-200">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black text-[#0A1237] dark:text-white tracking-tight leading-none">
              Flowdesk
            </span>
            <span className="text-[10px] font-extrabold text-[#828EA8] tracking-widest uppercase mt-1">
              Workspace
            </span>
          </div>
        </Link>
        <ThemeToggle className="h-7 w-7" />
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
        {user.role === "ADMIN" && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 mb-2 border",
              isActive("/admin")
                ? "bg-[#0A1237] text-[#C3D946] shadow-md border-transparent"
                : "bg-[#F3F8D7] text-[#0A1237] dark:bg-[#1B2758] dark:text-[#C3D946] border-[#C3D946]/40 hover:bg-[#C3D946] hover:text-[#0A1237]"
            )}
          >
            <ShieldCheck className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">Admin Portal</span>
          </Link>
        )}

        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150",
                active
                  ? "bg-[#0A1237] text-[#C3D946] font-extrabold shadow-sm"
                  : "text-text-secondary hover:bg-surface-alt hover:text-text-primary"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#C3D946] rounded-r-full glow-lime" />
              )}
              <item.icon
                className={cn(
                  "h-4 w-4 flex-shrink-0 transition-colors duration-150",
                  active ? "text-[#C3D946]" : "text-text-muted group-hover:text-text-secondary"
                )}
              />
              <span className="flex-1 truncate">{item.label}</span>
            </Link>
          );
        })}

        {/* Notifications */}
        <Link
          href="/notifications"
          className={cn(
            "group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150",
            isActive("/notifications")
              ? "bg-[#0A1237] text-[#C3D946] font-extrabold shadow-sm"
              : "text-text-secondary hover:bg-surface-alt hover:text-text-primary"
          )}
        >
          {isActive("/notifications") && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#C3D946] rounded-r-full glow-lime" />
          )}
          <Bell
            className={cn(
              "h-4 w-4 flex-shrink-0 transition-colors duration-150",
              isActive("/notifications") ? "text-[#C3D946]" : "text-text-muted group-hover:text-text-secondary"
            )}
          />
          <span className="flex-1 truncate">Notifications</span>
          {unreadNotifications > 0 && (
            <span className="ml-auto h-5 min-w-[20px] px-1.5 bg-[#C3D946] text-[#0A1237] text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
              {unreadNotifications > 99 ? "99+" : unreadNotifications}
            </span>
          )}
        </Link>
      </nav>

      {/* Footer / User Profile */}
      <div className="px-3 py-3 border-t border-border space-y-1 flex-shrink-0 bg-surface-alt/30">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150",
            isActive("/settings")
              ? "bg-surface-alt text-text-primary"
              : "text-text-secondary hover:bg-surface-alt hover:text-text-primary"
          )}
        >
          <Settings className="h-4 w-4 flex-shrink-0 text-text-muted" />
          Settings
        </Link>

        {/* User Card */}
        <Link
          href="/profile"
          className="flex items-center gap-2.5 p-2 rounded-xl transition-all duration-150 hover:bg-surface-alt group border border-transparent hover:border-border-subtle"
        >
          <Avatar name={user.name} src={user.avatar} size="sm" className="flex-shrink-0 ring-1 ring-border" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-text-primary truncate leading-snug">{user.name}</p>
            <p className="text-[10px] text-text-muted truncate leading-none mt-0.5">{user.email}</p>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-text-secondary hover:bg-danger-subtle hover:text-danger transition-all duration-150 cursor-pointer"
        >
          <LogOut className="h-4 w-4 flex-shrink-0 text-danger/80" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
