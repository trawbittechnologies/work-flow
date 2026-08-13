"use client";

import { useState, useTransition } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ChevronDown, Loader2 } from "lucide-react";

const datasets: Record<
  string,
  Array<{ day: string; completed: number; inProgress: number }>
> = {
  "This Week": [
    { day: "May 12", completed: 28, inProgress: 10 },
    { day: "May 13", completed: 42, inProgress: 12 },
    { day: "May 14", completed: 58, inProgress: 18 },
    { day: "May 15", completed: 64, inProgress: 26 },
    { day: "May 16", completed: 78, inProgress: 32 },
    { day: "May 17", completed: 88, inProgress: 38 },
    { day: "May 18", completed: 100, inProgress: 44 },
  ],
  "This Month": [
    { day: "Week 1", completed: 20, inProgress: 15 },
    { day: "Week 2", completed: 45, inProgress: 25 },
    { day: "Week 3", completed: 72, inProgress: 35 },
    { day: "Week 4", completed: 95, inProgress: 42 },
  ],
  "This Quarter": [
    { day: "Month 1", completed: 30, inProgress: 20 },
    { day: "Month 2", completed: 65, inProgress: 35 },
    { day: "Month 3", completed: 98, inProgress: 45 },
  ],
};

export function ProjectProgressChart() {
  const [timeframe, setTimeframe] = useState("This Week");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSelect = (t: string) => {
    setDropdownOpen(false);
    startTransition(() => {
      setTimeframe(t);
    });
  };

  const chartData = datasets[timeframe] || datasets["This Week"];

  return (
    <div className="bg-white border border-[#EAEDF2] rounded-2xl p-6 shadow-2xs relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-bold text-[#111827]">
            Project Progress
          </h3>
          {isPending && (
            <Loader2 className="h-4 w-4 animate-spin text-[#88C315]" />
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#4B5563] bg-white border border-[#E5E7EB] px-3 py-1.5 rounded-xl hover:bg-[#F9FAFB] active:scale-95 transition-all cursor-pointer shadow-2xs"
          >
            <span>{timeframe}</span>
            <ChevronDown className="h-3.5 w-3.5 text-[#9CA3AF]" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-32 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-10 py-1 text-xs font-medium animate-in">
              {["This Week", "This Month", "This Quarter"].map((t) => (
                <button
                  key={t}
                  onClick={() => handleSelect(t)}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#F3F4F6] text-[#374151] flex items-center justify-between"
                >
                  <span>{t}</span>
                  {timeframe === t && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#88C315]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-6 text-xs font-medium text-[#4B5563]">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1 rounded-full bg-[#88C315]" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1 rounded-full bg-[#9CA3AF]" />
          <span>In Progress</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full relative">
        {isPending && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
            <Loader2 className="h-6 w-6 animate-spin text-[#88C315]" />
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F3F4F6"
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: 500 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white border border-[#E5E7EB] p-2.5 rounded-xl shadow-lg text-xs">
                      <p className="font-bold text-[#111827] mb-1">
                        {payload[0].payload.day}
                      </p>
                      <p className="text-[#88C315] font-semibold">
                        Completed: {payload[0].value}%
                      </p>
                      <p className="text-[#6B7280] font-semibold">
                        In Progress: {payload[1]?.value}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#88C315"
              strokeWidth={2.5}
              dot={{ fill: "#88C315", r: 4, strokeWidth: 2, stroke: "#FFFFFF" }}
              activeDot={{ r: 6, fill: "#88C315" }}
            />
            <Line
              type="monotone"
              dataKey="inProgress"
              stroke="#9CA3AF"
              strokeWidth={2}
              dot={{ fill: "#9CA3AF", r: 3.5, strokeWidth: 2, stroke: "#FFFFFF" }}
              activeDot={{ r: 5, fill: "#9CA3AF" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
