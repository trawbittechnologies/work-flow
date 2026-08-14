"use client";

import { useState } from "react";
import { cn, formatDueDate, isOverdue } from "@/lib/utils";
import { PriorityBadge } from "@/components/ui/Badge";
import { TaskStatusSelect, TaskStatusType } from "@/components/tasks/TaskStatusSelect";
import { Avatar } from "@/components/ui/Avatar";
import type { TaskWithDetails } from "@/types";
import { CalendarDays, MessageSquare, MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TaskTableProps {
  tasks: TaskWithDetails[];
  onTaskClick?: (task: TaskWithDetails) => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatusType | string) => void;
}

export function TaskTable({ tasks, onTaskClick, onStatusChange }: TaskTableProps) {
  const [sortField, setSortField] = useState<"title" | "dueDate" | "priority">("dueDate");
  const [sortAsc, setSortAsc] = useState(true);

  function toggleSort(field: "title" | "dueDate" | "priority") {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    let result = 0;
    if (sortField === "title") {
      result = a.title.localeCompare(b.title);
    } else if (sortField === "dueDate") {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      result = dateA - dateB;
    } else if (sortField === "priority") {
      const order: Record<string, number> = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      result = (order[b.priority] || 0) - (order[a.priority] || 0);
    }
    return sortAsc ? result : -result;
  });

  return (
    <div className="bg-white border border-[#EAEDF2] rounded-2xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse text-xs min-w-[650px]">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-[#EAEDF2] text-[#6B7280] uppercase tracking-wider font-extrabold text-[11px]">
              <th className="py-3.5 px-4 w-10">Done</th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-[#111827] transition-colors" onClick={() => toggleSort("title")}>
                <div className="flex items-center gap-1.5">
                  Title <ArrowUpDown className="h-3.5 w-3.5 opacity-70" />
                </div>
              </th>
              <th className="py-3.5 px-4 min-w-[140px]">Status</th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-[#111827] transition-colors" onClick={() => toggleSort("priority")}>
                <div className="flex items-center gap-1.5">
                  Priority <ArrowUpDown className="h-3.5 w-3.5 opacity-70" />
                </div>
              </th>
              <th className="py-3.5 px-4">Assignee</th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-[#111827] transition-colors" onClick={() => toggleSort("dueDate")}>
                <div className="flex items-center gap-1.5">
                  Due Date <ArrowUpDown className="h-3.5 w-3.5 opacity-70" />
                </div>
              </th>
              <th className="py-3.5 px-4 w-12 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAEDF2] font-medium text-[#111827]">
            {sortedTasks.map((task) => {
              const isDone = (task.status as string) === "DONE" || (task.status as string) === "COMPLETED";
              const overdue = task.dueDate ? isOverdue(task.dueDate) : false;

              return (
                <tr
                  key={task.id}
                  className="hover:bg-[#F9FAFB] transition-colors group cursor-pointer"
                  onClick={() => onTaskClick?.(task)}
                >
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={(e) => {
                        const newStatus = e.target.checked ? "COMPLETED" : "PENDING";
                        onStatusChange?.(task.id, newStatus);
                      }}
                      className="h-4 w-4 rounded border-[#D1D5DB] text-[#88C315] focus:ring-[#88C315] cursor-pointer transition-colors"
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className={cn("font-bold text-[13px] truncate max-w-xs sm:max-w-md transition-colors", isDone && "line-through text-[#9CA3AF]")}>
                        {task.title}
                      </span>
                      {task._count?.comments > 0 && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-1.5 py-0.5 rounded">
                          <MessageSquare className="h-3 w-3" />
                          {task._count.comments}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 min-w-[140px]" onClick={(e) => e.stopPropagation()}>
                    <TaskStatusSelect
                      taskId={task.id}
                      initialStatus={task.status}
                      onStatusChange={(newStatus) => onStatusChange?.(task.id, newStatus)}
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <PriorityBadge priority={task.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT"} />
                  </td>
                  <td className="py-3.5 px-4">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar name={task.assignee.name} src={task.assignee.avatar} size="xs" className="ring-1 ring-border" />
                        <span className="text-xs truncate max-w-[100px] text-[#4B5563] font-semibold">{task.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-[#9CA3AF] font-normal italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {task.dueDate ? (
                      <span className={cn("flex items-center gap-1.5 text-xs font-semibold", overdue && !isDone ? "text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded inline-flex w-fit" : "text-[#6B7280]")}>
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDueDate(task.dueDate)}
                      </span>
                    ) : (
                      <span className="text-xs text-[#9CA3AF] font-normal">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-[#9CA3AF] hover:text-[#111827]">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
