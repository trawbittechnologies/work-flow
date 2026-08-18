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
        <h1 className="text-xl sm:text-2xl font-black font-display uppercase tracking-tight text-[#071A49]">
          Dashboard
        </h1>
        <p className="text-xs sm:text-[13px] font-medium text-[#586274] mt-0.5">
          Welcome back, {userName}
        </p>
      </div>

      {/* Date Filter Button */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto px-3.5 py-2 bg-white border border-[#DDE2D8] rounded-[2px] text-xs font-semibold text-[#071A49] hover:bg-[#F8F9F6] active:scale-95 shadow-2xs transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#B7D600]" />
            ) : (
              <Calendar className="h-4 w-4 text-[#8E99A8]" />
            )}
            <span className="font-mono">{selectedRange}</span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-[#8E99A8]" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-1 w-72 bg-white border border-[#DDE2D8] rounded-[2px] shadow-sm z-20 py-1 text-xs font-medium animate-in">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className="w-full text-left px-3.5 py-2 hover:bg-[#F0F2EC] text-[#071A49] flex items-center justify-between transition-colors font-mono"
              >
                <span>{opt}</span>
                {selectedRange === opt && (
                  <span className="h-2 w-2 rounded-[2px] bg-[#B7D600]" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
