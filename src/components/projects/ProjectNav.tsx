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
  FolderOpen,
  CalendarRange,
  MessagesSquare,
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
    { label: "Timeline", href: `${baseUrl}/timeline`, icon: CalendarRange },
    { label: "Files", href: `${baseUrl}/files`, icon: FolderOpen },
    { label: "Team", href: `${baseUrl}/team`, icon: Users },
    { label: "Comments", href: `${baseUrl}/comments`, icon: MessagesSquare },
    { label: "Chat", href: `${baseUrl}/chat`, icon: MessageSquare },
    { label: "Activity", href: `${baseUrl}/activity`, icon: Activity },
    ...(userRole === "OWNER"
      ? [{ label: "Settings", href: `${baseUrl}/settings`, icon: Settings }]
      : []),
  ];

  return (
    <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pt-3 sm:pt-4 pb-1 scrollbar-thin border-t border-[#EAEDF2]">
      {tabs.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shrink-0",
              isActive
                ? "bg-[#F3F9DE] text-[#111827] font-bold shadow-2xs border border-[#88C315]/20"
                : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
            )}
          >
            <tab.icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", isActive ? "text-[#88C315]" : "text-[#9CA3AF]")} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
