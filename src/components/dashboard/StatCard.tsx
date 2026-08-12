import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

type StatColor = "indigo" | "blue" | "amber" | "red" | "emerald";

interface StatCardProps {
  label: string;
  value: number;
  color?: StatColor;
  trend?: number;
}

const colorMap: Record<StatColor, { bg: string; text: string; icon: string }> = {
  indigo: { bg: "bg-indigo-50 dark:bg-indigo-950", text: "text-indigo-600 dark:text-indigo-400", icon: "text-indigo-400" },
  blue: { bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-600 dark:text-blue-400", icon: "text-blue-400" },
  amber: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-600 dark:text-amber-400", icon: "text-amber-400" },
  red: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-600 dark:text-red-400", icon: "text-red-400" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-600 dark:text-emerald-400", icon: "text-emerald-400" },
};

export function StatCard({ label, value, color = "indigo", trend }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div className="bg-surface border border-border rounded-xl p-3.5 shadow-sm hover:border-border-subtle hover:shadow-md transition-all duration-200">
      <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1.5">{label}</p>
      <div className="flex items-end justify-between">
        <p className={cn("text-xl font-bold", colors.text)}>{value}</p>
        {trend !== undefined && (
          <div className={cn("flex items-center gap-0.5 text-[10px] font-semibold bg-surface-alt px-1.5 py-0.5 rounded", colors.text)}>
            <TrendingUp className="h-3 w-3" />
            <span>{trend > 0 ? "+" : ""}{trend}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
