"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, CheckSquare, MessageSquare, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileMenu } from "@/lib/useMobileMenu";

interface MobileNavProps {
  unreadNotifications?: number;
}

export function MobileNav({ unreadNotifications: _unreadNotifications = 0 }: MobileNavProps) {
  const pathname = usePathname();
  const { isOpen, toggle } = useMobileMenu();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  }

  const navLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Projects", href: "/projects", icon: FolderKanban },
    { label: "Tasks", href: "/tasks", icon: CheckSquare },
    { label: "Chat", href: "/chat", icon: MessageSquare },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/95 backdrop-blur-xl border-t border-[#DDE2D8] flex items-center justify-around px-2 py-2 shadow-lg safe-area-bottom"
      aria-label="Mobile navigation"
    >
      {navLinks.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-1 px-1 relative transition-all rounded-[2px]",
              active
                ? "text-[#071A49] font-bold"
                : "text-[#586274] hover:text-[#071A49]"
            )}
            aria-current={active ? "page" : undefined}
          >
            <item.icon
              className={cn(
                "h-5 w-5 transition-transform",
                active && "scale-105 text-[#071A49]"
              )}
              strokeWidth={active ? 2.4 : 1.9}
            />
            <span className="text-[10px] font-bold tracking-tight leading-none uppercase">
              {item.label}
            </span>
            {active && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 h-0.5 w-6 bg-[#B7D600] rounded-[2px]" />
            )}
          </Link>
        );
      })}

      {/* Mobile Menu Button to open slide-out Drawer */}
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "flex-1 flex flex-col items-center gap-1 py-1 px-1 relative transition-all rounded-[2px] cursor-pointer",
          isOpen
            ? "text-[#071A49] font-bold"
            : "text-[#586274] hover:text-[#071A49]"
        )}
        aria-label="Toggle full workspace navigation"
      >
        <Menu
          className={cn(
            "h-5 w-5 transition-transform",
            isOpen && "scale-105 text-[#071A49]"
          )}
          strokeWidth={isOpen ? 2.4 : 1.9}
        />
        <span className="text-[10px] font-bold tracking-tight leading-none uppercase">
          Menu
        </span>
        {isOpen && (
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 h-0.5 w-6 bg-[#B7D600] rounded-[2px]" />
        )}
      </button>
    </nav>
  );
}
