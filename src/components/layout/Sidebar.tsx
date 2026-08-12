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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    avatar?: string | null;
  };
  unreadNotifications?: number;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "My Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Team", href: "/team", icon: Users },
];

export function Sidebar({ user, unreadNotifications = 0 }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="fixed left-0 top-0 h-full w-[240px] bg-[var(--surface)] border-r border-[var(--border)] flex flex-col z-30 hidden md:flex"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="px-4 py-4 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="h-7 w-7 bg-[var(--primary)] rounded-[8px] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--primary-hover)] transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="5" height="5" rx="1.5" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.7" />
              <rect x="1" y="8" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.7" />
              <rect x="8" y="8" width="5" height="5" rx="1.5" fill="white" />
            </svg>
          </div>
          <span className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
            Flowdesk
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-sm font-medium transition-all duration-150",
                active
                  ? "bg-[var(--primary-subtle)] text-[var(--text-primary)] font-semibold"
                  : "text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--text-primary)]"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  active ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
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
            "flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-sm font-medium transition-all duration-150",
            isActive("/notifications")
              ? "bg-[var(--primary-subtle)] text-[var(--text-primary)] font-semibold"
              : "text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--text-primary)]"
          )}
        >
          <Bell
            className={cn(
              "h-4 w-4 flex-shrink-0",
              isActive("/notifications") ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
            )}
          />
          <span className="flex-1">Notifications</span>
          {unreadNotifications > 0 && (
            <span className="ml-auto h-4 min-w-[16px] px-1 bg-[var(--primary)] text-[var(--text-primary)] text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadNotifications > 99 ? "99+" : unreadNotifications}
            </span>
          )}
        </Link>
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-[var(--border)] space-y-0.5 flex-shrink-0">
        <Link
          href="/settings"
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--text-primary)] transition-all duration-150"
        >
          <Settings className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)]" />
          Settings
        </Link>

        {/* Profile */}
        <Link
          href="/profile"
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] transition-all duration-150 hover:bg-[var(--background)] group"
        >
          <Avatar name={user.name} src={user.avatar} size="xs" className="flex-shrink-0 ring-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[var(--text-primary)] truncate">{user.name}</p>
            <p className="text-[10px] text-[var(--text-muted)] truncate">{user.email}</p>
          </div>
          <ChevronRight className="h-3 w-3 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-sm font-medium text-[var(--text-secondary)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 transition-all duration-150"
        >
          <LogOut className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)]" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
