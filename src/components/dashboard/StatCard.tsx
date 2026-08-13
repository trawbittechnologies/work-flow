import { cn } from "@/lib/utils";
import { TrendingUp, AlertCircle, Clock, FolderKanban, CheckCircle2 } from "lucide-react";

type StatColor = "indigo" | "blue" | "amber" | "red" | "emerald" | "lime";

interface StatCardProps {
  label: string;
  value: number;
  color?: StatColor;
  trend?: number;
}

const colorMap: Record<StatColor, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  lime: {
    bg: "bg-[#F3F8D7] dark:bg-[#C3D946]/20",
    text: "text-[#0A1237] dark:text-[#C3D946]",
    border: "border-[#C3D946]/50",
    icon: <FolderKanban className="h-4 w-4 text-[#0A1237] dark:text-[#C3D946]" />,
  },
  indigo: {
    bg: "bg-[#F3F8D7] dark:bg-[#C3D946]/20",
    text: "text-[#0A1237] dark:text-[#C3D946]",
    border: "border-[#C3D946]/50",
    icon: <FolderKanban className="h-4 w-4 text-[#0A1237] dark:text-[#C3D946]" />,
  },
  blue: {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    text: "text-sky-700 dark:text-sky-400",
    border: "border-sky-200 dark:border-sky-800/40",
    icon: <Clock className="h-4 w-4 text-sky-600" />,
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800/40",
    icon: <Clock className="h-4 w-4 text-amber-600" />,
  },
  red: {
    bg: "bg-red-50 dark:bg-red-950/40",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800/40",
    icon: <AlertCircle className="h-4 w-4 text-red-600" />,
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800/40",
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
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
        <span className="text-[11px] font-extrabold text-[#828EA8] uppercase tracking-wider">{label}</span>
        <div className={cn("h-7 w-7 rounded-xl flex items-center justify-center shadow-xs", colors.bg)}>
          {colors.icon}
        </div>
      </div>
      <div className="flex items-baseline justify-between mt-1">
        <p className={cn("text-2.5xl font-black tracking-tight", colors.text)}>{value}</p>
        {trend !== undefined && (
          <div className={cn("flex items-center gap-0.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-current/20", colors.bg, colors.text)}>
            <TrendingUp className="h-3 w-3" />
            <span>{trend > 0 ? "+" : ""}{trend}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
