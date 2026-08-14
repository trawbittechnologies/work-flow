"use client";

import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CheckCircle2, Clock, ListTodo, Eye, LayoutGrid } from "lucide-react";

interface TaskStats {
  completed: number;
  inProgress: number;
  todo: number;
  inReview: number;
  total: number;
}

interface TasksOverviewChartProps {
  stats: TaskStats;
}

export function TasksOverviewChart({ stats }: TasksOverviewChartProps) {
  const { completed, inProgress, todo, inReview, total } = stats;

  const data = [
    { name: "Completed", value: completed, color: "#88C315", bgClass: "bg-[#88C315]", icon: CheckCircle2 },
    { name: "In Progress", value: inProgress, color: "#F59E0B", bgClass: "bg-[#F59E0B]", icon: Clock },
    { name: "To Do", value: todo, color: "#7C3AED", bgClass: "bg-[#7C3AED]", icon: ListTodo },
    { name: "In Review", value: inReview, color: "#3B82F6", bgClass: "bg-[#3B82F6]", icon: Eye },
  ].filter((d) => d.value > 0);

  const isEmpty = total === 0;

  return (
    <div className="bg-white border border-[#EAEDF2] rounded-2xl p-4 sm:p-6 shadow-2xs h-full flex flex-col justify-between">
      <h3 className="text-sm sm:text-[15px] font-bold text-[#111827] mb-2">
        My Tasks Overview
      </h3>

      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <LayoutGrid className="h-10 w-10 text-[#D1D5DB] mb-3 stroke-[1.5]" />
          <p className="text-sm font-semibold text-[#9CA3AF]">No tasks assigned yet</p>
          <p className="text-xs text-[#C4C9D4] mt-1">Your task breakdown will appear here</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 sm:gap-6 my-auto">
          {/* Donut Chart */}
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
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl sm:text-2xl font-black text-[#111827] leading-none">
                {total}
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#9CA3AF] mt-0.5">
                Total Tasks
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2.5 sm:space-y-3 w-full">
            {data.map((item) => {
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-sm flex-shrink-0 ${item.bgClass}`} />
                    <span className="font-semibold text-[#4B5563]">{item.name}</span>
                  </div>
                  <span className="font-bold text-[#111827]">
                    {item.value} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
