"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Activity } from "lucide-react";
import Link from "next/link";

interface ActivityItem {
  id: string;
  userName: string;
  userAvatar?: string | null;
  type: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface RecentActivityListProps {
  activities: ActivityItem[];
}

function formatActivityText(type: string, metadata: Record<string, unknown>): string {
  switch (type) {
    case "PROJECT_CREATED": return `created project "${metadata.name || ""}"`;
    case "PROJECT_EDITED": return `updated project "${metadata.name || ""}"`;
    case "PROJECT_STATUS_CHANGED": return `changed project status to ${metadata.status || ""}`;
    case "TASK_CREATED": return `created task "${metadata.title || ""}"`;
    case "TASK_ASSIGNED": return `was assigned task "${metadata.title || ""}"`;
    case "TASK_STATUS_CHANGED": return `moved task to ${metadata.status || ""}`;
    case "TASK_COMPLETED": return `completed task "${metadata.title || ""}"`;
    case "MEMBER_ADDED": return `added a new member`;
    case "MEMBER_REMOVED": return `removed a member`;
    case "COMMENT_ADDED": return `commented on a task`;
    case "FILE_UPLOADED": return `uploaded a file`;
    case "ANNOUNCEMENT_POSTED": return `posted an announcement`;
    default: return "performed an action";
  }
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  return (
    <div className="bg-white border border-[#EAEDF2] rounded-2xl p-4 sm:p-6 shadow-2xs">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h3 className="text-sm sm:text-[15px] font-bold text-[#111827]">Recent Activity</h3>
        <Link
          href="/notifications"
          className="text-xs font-bold text-[#88C315] hover:text-[#74A710] transition-colors"
        >
          View all
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-10">
          <Activity className="h-9 w-9 text-[#D1D5DB] mb-3 stroke-[1.5]" />
          <p className="text-sm font-semibold text-[#9CA3AF]">No activity yet</p>
          <p className="text-xs text-[#C4C9D4] mt-1">Team actions will show up here</p>
        </div>
      ) : (
        <div className="space-y-3.5 sm:space-y-4">
          {activities.map((act) => (
            <div key={act.id} className="flex items-start gap-3 sm:gap-3.5 py-1">
              <Avatar
                name={act.userName}
                src={act.userAvatar}
                size="sm"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full ring-1 ring-border flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-[13px] text-[#4B5563] leading-snug break-words">
                  <span className="font-bold text-[#111827]">{act.userName}</span>{" "}
                  {formatActivityText(act.type, act.metadata)}
                </p>
                <p className="text-[10px] sm:text-[11px] text-[#9CA3AF] mt-0.5">
                  {formatRelativeTime(act.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
