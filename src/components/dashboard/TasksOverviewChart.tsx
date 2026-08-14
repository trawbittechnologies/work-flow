"use client";

import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const data = [
  { name: "Completed", value: 34, percentage: "40%", color: "#88C315", bgClass: "bg-[#88C315]" },
  { name: "In Progress", value: 18, percentage: "21%", color: "#F59E0B", bgClass: "bg-[#F59E0B]" },
  { name: "Pending", value: 22, percentage: "26%", color: "#7C3AED", bgClass: "bg-[#7C3AED]" },
  { name: "On Hold", value: 10, percentage: "13%", color: "#CBD5E1", bgClass: "bg-[#CBD5E1]" },
];

const totalTasks = 84;

export function TasksOverviewChart() {
  return (
    <div className="bg-white border border-[#EAEDF2] rounded-2xl p-4 sm:p-6 shadow-2xs h-full flex flex-col justify-between">
      {/* Header */}
      <h3 className="text-sm sm:text-[15px] font-bold text-[#111827] mb-2">
        Tasks Overview
      </h3>

      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 sm:gap-6 my-auto">
        {/* Donut Chart with Center Total */}
        <div className="relative h-40 w-40 sm:h-48 sm:w-48 flex-shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={68}
                paddingAngle={3}
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl sm:text-2.5xl font-black text-[#111827] leading-none">
              {totalTasks}
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-[#9CA3AF] mt-0.5">
              Total Tasks
            </span>
          </div>
        </div>

        {/* Legend Breakdown */}
        <div className="flex-1 space-y-2.5 sm:space-y-3 w-full">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-sm flex-shrink-0 ${item.bgClass}`}
                />
                <span className="font-semibold text-[#4B5563]">
                  {item.name}
                </span>
              </div>
              <span className="font-bold text-[#111827]">
                {item.value} ({item.percentage})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
