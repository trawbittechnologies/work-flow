import { cn } from "@/lib/utils";
import { TrendingUp, AlertCircle, Clock, FolderKanban, CheckCircle2 } from "lucide-react";

type StatColor = "indigo" | "blue" | "amber" | "red" | "emerald";

interface StatCardProps {
  label: string;
  value: number;
  color?: StatColor;
  trend?: number;
}

const colorMap: Record<StatColor, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  indigo: {
    bg: "bg-indigo-50/60 dark:bg-indigo-950/30",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-200/60 dark:border-indigo-800/40",
    icon: <FolderKanban className="h-4 w-4 text-indigo-500" />,
  },
  blue: {
    bg: "bg-blue-50/60 dark:bg-blue-950/30",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200/60 dark:border-blue-800/40",
    icon: <Clock className="h-4 w-4 text-blue-500" />,
  },
  amber: {
    bg: "bg-amber-50/60 dark:bg-amber-950/30",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200/60 dark:border-amber-800/40",
    icon: <Clock className="h-4 w-4 text-amber-500" />,
  },
  red: {
    bg: "bg-red-50/60 dark:bg-red-950/30",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-200/60 dark:border-red-800/40",
    icon: <AlertCircle className="h-4 w-4 text-red-500" />,
  },
  emerald: {
    bg: "bg-emerald-50/60 dark:bg-emerald-950/30",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200/60 dark:border-emerald-800/40",
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  },
};

export function StatCard({ label, value, color = "indigo", trend }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div className={cn(
      "bg-surface border rounded-2xl p-4 transition-all duration-200 card-shadow hover:-translate-y-0.5",
      colors.border
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{label}</span>
        <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", colors.bg)}>
          {colors.icon}
        </div>
      </div>
      <div className="flex items-baseline justify-between mt-1">
        <p className={cn("text-2xl font-black tracking-tight", colors.text)}>{value}</p>
        {trend !== undefined && (
          <div className={cn("flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full", colors.bg, colors.text)}>
            <TrendingUp className="h-3 w-3" />
            <span>{trend > 0 ? "+" : ""}{trend}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
