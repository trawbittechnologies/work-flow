"use client";

import { useState, useTransition } from "react";
import { Calendar, ChevronDown, Loader2 } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
}

function getDateRangeOptions() {
  const now = new Date();
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  // This week (Mon–Sun)
  const dow = now.getDay(); // 0=Sun
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  // Last week
  const lastMonday = new Date(monday);
  lastMonday.setDate(monday.getDate() - 7);
  const lastSunday = new Date(lastMonday);
  lastSunday.setDate(lastMonday.getDate() + 6);

  // This month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // This quarter
  const qMonth = Math.floor(now.getMonth() / 3) * 3;
  const qStart = new Date(now.getFullYear(), qMonth, 1);
  const qEnd = new Date(now.getFullYear(), qMonth + 3, 0);

  return [
    `${fmt(monday)} – ${fmt(sunday)}`,
    `${fmt(lastMonday)} – ${fmt(lastSunday)}`,
    `${now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
    `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()} (${fmt(qStart)} – ${fmt(qEnd)})`,
  ];
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const options = getDateRangeOptions();
  const [selectedRange, setSelectedRange] = useState(options[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSelect = (range: string) => {
    setDropdownOpen(false);
    startTransition(() => {
      setSelectedRange(range);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#111827]">
          Dashboard
        </h1>
        <p className="text-xs sm:text-[13px] font-medium text-[#6B7280] mt-0.5">
          Welcome back, {userName} 👋
        </p>
      </div>

      {/* Date Filter Button */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto px-3.5 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#374151] hover:bg-[#F9FAFB] active:scale-95 shadow-2xs transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#88C315]" />
            ) : (
              <Calendar className="h-4 w-4 text-[#6B7280]" />
            )}
            <span>{selectedRange}</span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-[#9CA3AF]" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-72 bg-white border border-[#E5E7EB] rounded-xl shadow-xl z-20 py-1.5 text-xs font-medium animate-in">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className="w-full text-left px-3.5 py-2 hover:bg-[#F3F4F6] text-[#374151] flex items-center justify-between transition-colors"
              >
                <span>{opt}</span>
                {selectedRange === opt && (
                  <span className="h-2 w-2 rounded-full bg-[#88C315]" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
