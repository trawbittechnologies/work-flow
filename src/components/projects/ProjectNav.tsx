"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CheckSquare,
  Kanban,
  Users,
  MessageSquare,
  Activity,
  Settings,
} from "lucide-react";

interface ProjectNavProps {
  projectId: string;
  userRole: "OWNER" | "MEMBER";
}

export function ProjectNav({ projectId, userRole }: ProjectNavProps) {
  const pathname = usePathname();
  const baseUrl = `/projects/${projectId}`;

  const tabs = [
    { label: "Overview", href: baseUrl, exact: true, icon: LayoutDashboard },
    { label: "Tasks", href: `${baseUrl}/tasks`, icon: CheckSquare },
    { label: "Board", href: `${baseUrl}/board`, icon: Kanban },
    { label: "Team", href: `${baseUrl}/team`, icon: Users },
    { label: "Chat", href: `${baseUrl}/chat`, icon: MessageSquare },
    { label: "Activity", href: `${baseUrl}/activity`, icon: Activity },
    ...(userRole === "OWNER"
      ? [{ label: "Settings", href: `${baseUrl}/settings`, icon: Settings }]
      : []),
  ];

  return (
    <nav className="flex items-center gap-1 overflow-x-auto pt-2 scrollbar-none border-t border-[var(--border)]">
      {tabs.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-xs font-medium whitespace-nowrap transition-colors",
              isActive
                ? "bg-[var(--primary-subtle)] text-[var(--primary)] font-semibold"
                : "text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--text-primary)]"
            )}
          >
            <tab.icon className={cn("h-3.5 w-3.5", isActive ? "text-[var(--primary)]" : "text-[var(--text-muted)]")} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
