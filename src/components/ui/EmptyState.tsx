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
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      {Icon && (
        <div className="h-12 w-12 rounded-[12px] bg-[var(--background)] border border-[var(--border)] flex items-center justify-center mb-4">
          <Icon className="h-5 w-5 text-[var(--text-muted)]" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--text-muted)] max-w-sm mb-5">{description}</p>
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
