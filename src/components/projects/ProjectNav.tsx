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
    <nav className="flex items-center gap-1.5 overflow-x-auto pt-4 scrollbar-none border-t border-border-subtle">
      {tabs.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "bg-primary-subtle text-primary font-bold shadow-sm"
                : "text-text-secondary hover:bg-surface-alt hover:text-text-primary"
            )}
          >
            <tab.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-text-muted")} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
