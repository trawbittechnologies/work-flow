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
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/95 backdrop-blur-xl border-t border-[#EAEDF2] flex items-center justify-around px-2 py-2 shadow-lg safe-area-bottom"
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
              "flex-1 flex flex-col items-center gap-1 py-1 px-1 relative transition-all rounded-xl",
              active
                ? "text-[#88C315] font-bold"
                : "text-[#6B7280] hover:text-[#111827]"
            )}
            aria-current={active ? "page" : undefined}
          >
            <div className="relative">
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  active && "scale-110 text-[#88C315]"
                )}
                strokeWidth={active ? 2.5 : 2}
              />
              {showBadge && (
                <span className="absolute -top-1 -right-1.5 h-3.5 min-w-[14px] px-0.5 bg-[#88C315] text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold tracking-tight leading-none">
              {item.label}
            </span>
            {active && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 h-1 w-6 bg-[#88C315] rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
