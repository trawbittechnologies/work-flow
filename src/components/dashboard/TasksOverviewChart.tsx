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
    { name: "Completed", value: completed, color: "#B7D600", bgClass: "bg-[#B7D600]", icon: CheckCircle2 },
    { name: "In Progress", value: inProgress, color: "#071A49", bgClass: "bg-[#071A49]", icon: Clock },
    { name: "To Do", value: todo, color: "#7C3AED", bgClass: "bg-[#7C3AED]", icon: ListTodo },
    { name: "In Review", value: inReview, color: "#0284C7", bgClass: "bg-[#0284C7]", icon: Eye },
  ].filter((d) => d.value > 0);

  const isEmpty = total === 0;

  return (
    <div className="bg-white border border-[#DDE2D8] rounded-[2px] p-4 sm:p-6 shadow-xs h-full flex flex-col justify-between">
      <h3 className="text-sm sm:text-[15px] font-bold uppercase font-display text-[#071A49] mb-2">
        My Tasks Overview
      </h3>

      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8 bg-tech-grid rounded-[2px] border border-[#DDE2D8]">
          <LayoutGrid className="h-10 w-10 text-[#8E99A8] mb-3 stroke-[1.5]" />
          <p className="text-sm font-bold uppercase font-display text-[#071A49]">No tasks assigned yet</p>
          <p className="text-xs text-[#586274] mt-1">Your task breakdown will appear here</p>
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
              <span className="text-xl sm:text-2xl font-black font-display text-[#071A49] leading-none">
                {total}
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono uppercase font-bold text-[#586274] mt-0.5">
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
                    <span className={`h-2.5 w-2.5 rounded-[2px] flex-shrink-0 ${item.bgClass}`} />
                    <span className="font-semibold text-[#586274]">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-[#071A49]">
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
