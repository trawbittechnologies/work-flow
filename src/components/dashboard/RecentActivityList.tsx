"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";

const activities = [
  {
    id: "act-1",
    user: {
      name: "Jishnu TV",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    actionText: "completed the task",
    targetText: '"Homepage UI Design"',
    time: "2 mins ago",
  },
  {
    id: "act-2",
    user: {
      name: "Meera Joseph",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
    actionText: "added a new task",
    targetText: '"User Research"',
    time: "1 hour ago",
  },
  {
    id: "act-3",
    user: {
      name: "Jibin Raj",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
    actionText: "updated the project",
    targetText: '"Mobile App Development"',
    time: "3 hours ago",
  },
  {
    id: "act-4",
    user: {
      name: "Sneha Mohan",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    actionText: "commented on task",
    targetText: '"API Integration"',
    time: "5 hours ago",
  },
  {
    id: "act-5",
    user: {
      name: "Athul Krishna",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    },
    actionText: "created a new project",
    targetText: '"Internal Tool"',
    time: "1 day ago",
  },
];

export function RecentActivityList() {
  return (
    <div className="bg-white border border-[#EAEDF2] rounded-2xl p-6 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[15px] font-bold text-[#111827]">
          Recent Activity
        </h3>
        <Link
          href="/dashboard"
          className="text-xs font-bold text-[#88C315] hover:text-[#74A710] transition-colors"
        >
          View all
        </Link>
      </div>

      {/* Activity Items */}
      <div className="space-y-4">
        {activities.map((act) => (
          <div key={act.id} className="flex items-start gap-3.5 py-1">
            <Avatar
              name={act.user.name}
              src={act.user.avatar}
              size="sm"
              className="h-9 w-9 rounded-full ring-1 ring-border flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-[#4B5563] leading-snug">
                <span className="font-bold text-[#111827]">
                  {act.user.name}
                </span>{" "}
                {act.actionText}{" "}
                <span className="font-semibold text-[#111827]">
                  {act.targetText}
                </span>
              </p>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">{act.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
