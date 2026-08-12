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
        "inline-flex items-center px-2 py-0.5 rounded-[6px] text-xs font-medium border",
        colorClass,
        className
      )}
    >
      {children}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  showDot?: boolean;
  className?: string;
}

const priorityDots: Record<string, string> = {
  URGENT: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-amber-500",
  LOW: "bg-slate-400",
};

const priorityLabels: Record<string, string> = {
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
      {getStatusLabel(status)}
    </Badge>
  );
}
