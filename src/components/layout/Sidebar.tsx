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
      className="fixed left-0 top-0 h-full w-[var(--sidebar-width)] bg-surface border-r border-border flex flex-col z-30 hidden md:flex"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="px-5 py-5 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-dark transition-colors shadow-sm text-white">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <span className="text-base font-bold text-text-primary tracking-tight">
            Flowdesk
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {user.role === "ADMIN" && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 mb-2 border border-primary/20",
              isActive("/admin")
                ? "bg-primary text-white shadow-sm"
                : "bg-primary-subtle text-primary hover:bg-primary hover:text-white"
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
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-primary-subtle text-primary font-semibold"
                  : "text-text-secondary hover:bg-surface-alt hover:text-text-primary"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  active ? "text-primary" : "text-text-muted group-hover:text-text-secondary"
                )}
              />
              {item.label}
            </Link>
          );
        })}

        {/* Notifications with badge */}
        <Link
          href="/notifications"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
            isActive("/notifications")
              ? "bg-primary-subtle text-primary font-semibold"
              : "text-text-secondary hover:bg-surface-alt hover:text-text-primary"
          )}
        >
          <Bell
            className={cn(
              "h-4 w-4 flex-shrink-0",
              isActive("/notifications") ? "text-primary" : "text-text-muted"
            )}
          />
          <span className="flex-1">Notifications</span>
          {unreadNotifications > 0 && (
            <span className="ml-auto h-5 min-w-[20px] px-1.5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
              {unreadNotifications > 99 ? "99+" : unreadNotifications}
            </span>
          )}
        </Link>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-border space-y-1 flex-shrink-0">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-all duration-150"
        >
          <Settings className="h-4 w-4 flex-shrink-0 text-text-muted" />
          Settings
        </Link>

        {/* Profile */}
        <Link
          href="/profile"
          className="flex items-center gap-3 px-3 py-2 mt-1 rounded-lg transition-all duration-150 hover:bg-surface-alt group border border-transparent hover:border-border-subtle"
        >
          <Avatar name={user.name} src={user.avatar} size="xs" className="flex-shrink-0 ring-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-primary truncate">{user.name}</p>
            <p className="text-[10px] text-text-muted truncate">{user.email}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-danger-subtle hover:text-danger transition-all duration-150 mt-1"
        >
          <LogOut className="h-4 w-4 flex-shrink-0 text-danger/70" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
