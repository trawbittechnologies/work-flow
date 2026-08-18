import { cn } from "@/lib/utils";
import { FolderKanban, CheckSquare, MessageSquare, Users, Bell, type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center bg-tech-grid rounded-[2px] border border-[#DDE2D8] dark:border-[#1E3A7B]",
        className
      )}
    >
      {Icon && (
        <div className="h-12 w-12 rounded-[2px] bg-white dark:bg-[#071A49] border border-[#DDE2D8] dark:border-[#1E3A7B] flex items-center justify-center mb-4 shadow-2xs">
          <Icon className="h-5 w-5 text-[#8E99A8]" />
        </div>
      )}
      <h3 className="text-sm font-bold uppercase font-display text-[#071A49] dark:text-[#F8F9F6] tracking-tight mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-[#586274] dark:text-[#A6B4C9] max-w-sm mb-5">{description}</p>
      )}
      {action}
    </div>
  );
}

export const emptyStates = {
  projects: {
    icon: FolderKanban,
    title: "No projects yet",
    description: "Create your first project to get started with your team.",
  },
  tasks: {
    icon: CheckSquare,
    title: "No tasks here",
    description: "Add a task to get started.",
  },
  chat: {
    icon: MessageSquare,
    title: "No messages yet",
    description: "Start the conversation.",
  },
  notifications: {
    icon: Bell,
    title: "You're all caught up",
    description: "No new notifications.",
  },
  team: {
    icon: Users,
    title: "No members yet",
    description: "Invite your teammates to collaborate.",
  },
};
