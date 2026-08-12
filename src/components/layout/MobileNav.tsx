"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, CheckSquare, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  unreadNotifications?: number;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Alerts", href: "/notifications", icon: Bell },
];

export function MobileNav({ unreadNotifications = 0 }: MobileNavProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-[var(--surface)]/95 backdrop-blur-sm border-t border-[var(--border)] flex items-center"
      aria-label="Mobile navigation"
    >
      {navItems.map((item) => {
        const active = isActive(item.href);
        const showBadge = item.href === "/notifications" && unreadNotifications > 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center gap-0.5 py-2.5 relative transition-colors",
              active ? "text-[var(--primary)]" : "text-[var(--text-muted)]"
            )}
            aria-current={active ? "page" : undefined}
          >
            <div className="relative">
              <item.icon className="h-5 w-5" />
              {showBadge && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-[var(--primary)] rounded-full" />
              )}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 bg-[var(--primary)] rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
