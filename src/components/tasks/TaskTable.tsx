"use client";

import { useState } from "react";
import { cn, formatDueDate, isOverdue } from "@/lib/utils";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import type { TaskWithDetails } from "@/types";
import { CalendarDays, MessageSquare, MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TaskTableProps {
  tasks: TaskWithDetails[];
  onTaskClick?: (task: TaskWithDetails) => void;
  onStatusChange?: (taskId: string, newStatus: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE") => void;
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
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[var(--background)] border-b border-[var(--border)] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
              <th className="py-2.5 px-4 w-10">Done</th>
              <th className="py-2.5 px-4 cursor-pointer hover:text-[var(--text-primary)]" onClick={() => toggleSort("title")}>
                <div className="flex items-center gap-1">
                  Title <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4 cursor-pointer hover:text-[var(--text-primary)]" onClick={() => toggleSort("priority")}>
                <div className="flex items-center gap-1">
                  Priority <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-2.5 px-4">Assignee</th>
              <th className="py-2.5 px-4 cursor-pointer hover:text-[var(--text-primary)]" onClick={() => toggleSort("dueDate")}>
                <div className="flex items-center gap-1">
                  Due Date <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-2.5 px-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)] font-medium text-[var(--text-primary)]">
            {sortedTasks.map((task) => {
              const isDone = task.status === "DONE";
              const overdue = task.dueDate ? isOverdue(task.dueDate) : false;

              return (
                <tr
                  key={task.id}
                  className="hover:bg-[var(--background)] transition-colors group cursor-pointer"
                  onClick={() => onTaskClick?.(task)}
                >
                  <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={(e) => {
                        const newStatus = e.target.checked ? "DONE" : "TODO";
                        onStatusChange?.(task.id, newStatus);
                      }}
                      className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                    />
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-medium truncate max-w-xs sm:max-w-md", isDone && "line-through text-[var(--text-muted)]")}>
                        {task.title}
                      </span>
                      {task._count?.comments > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-[var(--text-muted)]">
                          <MessageSquare className="h-3 w-3" />
                          {task._count.comments}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="py-2.5 px-4">
                    <PriorityBadge priority={task.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT"} />
                  </td>
                  <td className="py-2.5 px-4">
                    {task.assignee ? (
                      <div className="flex items-center gap-1.5">
                        <Avatar name={task.assignee.name} src={task.assignee.avatar} size="xs" className="ring-0" />
                        <span className="text-[11px] truncate max-w-[100px] text-[var(--text-secondary)]">{task.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[var(--text-muted)] font-normal">Unassigned</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    {task.dueDate ? (
                      <span className={cn("flex items-center gap-1 text-[11px]", overdue && !isDone ? "text-red-500 font-semibold" : "text-[var(--text-muted)]")}>
                        <CalendarDays className="h-3 w-3" />
                        {formatDueDate(task.dueDate)}
                      </span>
                    ) : (
                      <span className="text-[11px] text-[var(--text-muted)] font-normal">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-3.5 w-3.5" />
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
