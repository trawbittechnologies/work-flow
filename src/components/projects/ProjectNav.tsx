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
    <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pt-3 sm:pt-4 pb-1 scrollbar-thin border-t border-[#DDE2D8]">
      {tabs.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-[2px] text-xs font-mono font-bold uppercase whitespace-nowrap transition-all shrink-0",
              isActive
                ? "bg-[#F1F8CE] text-[#071A49] shadow-2xs border border-[#B7D600]"
                : "text-[#586274] hover:bg-[#F8F9F6] hover:text-[#071A49] border border-transparent"
            )}
          >
            <tab.icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", isActive ? "text-[#071A49]" : "text-[#8E99A8]")} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
