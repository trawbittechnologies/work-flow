import { ReactNode } from "react";
import {
  ArrowUpRight,
  TrendingUp,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  iconBg?: string;
  trendText?: string;
  trendType?: "positive" | "negative" | "neutral";
  showArrow?: boolean;
  color?: "indigo" | "blue" | "amber" | "red" | "emerald" | "lime" | string;
  trend?: number;
}

const colorMap: Record<
  string,
  { bg: string; text: string; border: string; icon: ReactNode }
> = {
  lime: {
    bg: "bg-[#F1F8CE]",
    text: "text-[#071A49]",
    border: "border-[#B7D600]",
    icon: <FolderKanban className="h-5 w-5 text-[#071A49]" />,
  },
  indigo: {
    bg: "bg-[#EDE9FE]",
    text: "text-[#7C3AED]",
    border: "border-[#7C3AED]/30",
    icon: <FolderKanban className="h-5 w-5 text-[#7C3AED]" />,
  },
  blue: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    icon: <Clock className="h-5 w-5 text-sky-700" />,
  },
  amber: {
    bg: "bg-[#FFFBEB]",
    text: "text-[#D97706]",
    border: "border-amber-200",
    icon: <Clock className="h-5 w-5 text-[#D97706]" />,
  },
  red: {
    bg: "bg-[#FEF2F2]",
    text: "text-[#DC2626]",
    border: "border-red-200",
    icon: <AlertCircle className="h-5 w-5 text-[#DC2626]" />,
  },
  emerald: {
    bg: "bg-[#ECFDF5]",
    text: "text-[#16A34A]",
    border: "border-emerald-200",
    icon: <CheckCircle2 className="h-5 w-5 text-[#16A34A]" />,
  },
};

export function StatCard({
  label,
  value,
  icon,
  iconBg,
  trendText,
  trendType = "positive",
  showArrow = true,
  color = "lime",
  trend,
}: MetricCardProps) {
  const fallback = colorMap[color] || colorMap.lime;

  return (
    <div className="bg-white border border-[#DDE2D8] rounded-[2px] p-5 shadow-xs transition-all duration-200">
      <div className="flex items-start gap-4">
        {/* Micro-radius Icon Box */}
        <div
          className={cn(
            "h-11 w-11 rounded-[2px] border border-[#DDE2D8] flex items-center justify-center flex-shrink-0 shadow-2xs",
            iconBg || fallback.bg
          )}
        >
          {icon || fallback.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#586274]">{label}</p>
          <h3 className="text-2xl font-black font-display text-[#071A49] tracking-tight mt-0.5">
            {value}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            {trendText ? (
              <span
                className={cn(
                  "text-[11px] font-mono font-semibold flex items-center",
                  trendType === "positive" && "text-[#16A34A]",
                  trendType === "negative" && "text-[#DC2626]",
                  trendType === "neutral" && "text-[#586274]"
                )}
              >
                {trendText}
                {showArrow && (
                  <ArrowUpRight className="h-3.5 w-3.5 inline stroke-[2.5]" />
                )}
              </span>
            ) : trend !== undefined ? (
              <span className="text-[11px] font-mono font-semibold text-[#16A34A] flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" />
                <span>
                  {trend > 0 ? "+" : ""}
                  {trend}%
                </span>
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
