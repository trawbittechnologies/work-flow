import { cn, getPriorityColor, getStatusColor, getStatusLabel } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "priority" | "status" | "custom";
  colorClass?: string;
  className?: string;
}

export function Badge({ children, colorClass, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-[2px] font-mono text-[11px] font-semibold uppercase tracking-[0.05em] border border-[#DDE2D8] bg-white text-[#071A49] transition-colors",
        colorClass,
        className
      )}
    >
      {children}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL";
  showDot?: boolean;
  className?: string;
}

const priorityDots: Record<string, string> = {
  CRITICAL: "bg-red-500 animate-pulse",
  URGENT: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-amber-500",
  LOW: "bg-[#0A1237]/60 dark:bg-slate-400",
};

const priorityLabels: Record<string, string> = {
  CRITICAL: "Critical",
  URGENT: "Urgent",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export function PriorityBadge({ priority, showDot = true, className }: PriorityBadgeProps) {
  return (
    <Badge colorClass={getPriorityColor(priority)} className={className}>
      {showDot && (
        <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5 flex-shrink-0", priorityDots[priority])} />
      )}
      {priorityLabels[priority]}
    </Badge>
  );
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge colorClass={getStatusColor(status)} className={className}>
      <span className="h-1.5 w-1.5 rounded-full mr-1.5 bg-current opacity-70 flex-shrink-0" />
      {getStatusLabel(status)}
    </Badge>
  );
}
