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
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-surface-alt border-b border-border text-text-muted uppercase tracking-wider font-bold">
              <th className="py-3 px-4 w-10">Done</th>
              <th className="py-3 px-4 cursor-pointer hover:text-text-primary transition-colors" onClick={() => toggleSort("title")}>
                <div className="flex items-center gap-1.5">
                  Title <ArrowUpDown className="h-3.5 w-3.5 opacity-70" />
                </div>
              </th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 cursor-pointer hover:text-text-primary transition-colors" onClick={() => toggleSort("priority")}>
                <div className="flex items-center gap-1.5">
                  Priority <ArrowUpDown className="h-3.5 w-3.5 opacity-70" />
                </div>
              </th>
              <th className="py-3 px-4">Assignee</th>
              <th className="py-3 px-4 cursor-pointer hover:text-text-primary transition-colors" onClick={() => toggleSort("dueDate")}>
                <div className="flex items-center gap-1.5">
                  Due Date <ArrowUpDown className="h-3.5 w-3.5 opacity-70" />
                </div>
              </th>
              <th className="py-3 px-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle font-medium text-text-primary">
            {sortedTasks.map((task) => {
              const isDone = task.status === "DONE";
              const overdue = task.dueDate ? isOverdue(task.dueDate) : false;

              return (
                <tr
                  key={task.id}
                  className="hover:bg-surface-alt/50 transition-colors group cursor-pointer"
                  onClick={() => onTaskClick?.(task)}
                >
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={(e) => {
                        const newStatus = e.target.checked ? "DONE" : "TODO";
                        onStatusChange?.(task.id, newStatus);
                      }}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer transition-colors"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className={cn("font-semibold truncate max-w-xs sm:max-w-md transition-colors", isDone && "line-through text-text-muted")}>
                        {task.title}
                      </span>
                      {task._count?.comments > 0 && (
                        <span className="flex items-center gap-1 text-[11px] text-text-muted bg-surface-alt px-1.5 py-0.5 rounded">
                          <MessageSquare className="h-3 w-3" />
                          {task._count.comments}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="py-3 px-4">
                    <PriorityBadge priority={task.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT"} />
                  </td>
                  <td className="py-3 px-4">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar name={task.assignee.name} src={task.assignee.avatar} size="xs" className="ring-0" />
                        <span className="text-xs truncate max-w-[100px] text-text-secondary">{task.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-text-muted font-normal italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {task.dueDate ? (
                      <span className={cn("flex items-center gap-1.5 text-xs", overdue && !isDone ? "text-danger font-bold bg-danger-subtle px-1.5 py-0.5 rounded inline-flex w-fit" : "text-text-muted")}>
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDueDate(task.dueDate)}
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted font-normal">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-text-primary">
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
