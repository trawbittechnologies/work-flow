"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, CheckSquare, Bell, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  unreadNotifications?: number;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Chat", href: "/chat", icon: MessageSquare },
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
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-surface/95 backdrop-blur-xl border-t border-border flex items-center shadow-lg"
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
              "flex-1 flex flex-col items-center gap-1 py-2.5 relative transition-colors",
              active ? "text-primary font-bold" : "text-text-muted hover:text-text-secondary"
            )}
            aria-current={active ? "page" : undefined}
          >
            <div className="relative">
              <item.icon className="h-5 w-5" />
              {showBadge && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-indigo-600 rounded-full animate-pulse" />
              )}
            </div>
            <span className="text-[10px] font-semibold tracking-tight">{item.label}</span>
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-primary rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
