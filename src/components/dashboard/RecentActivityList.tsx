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
    <div className="bg-white border border-[#DDE2D8] rounded-[2px] p-4 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h3 className="text-sm sm:text-[15px] font-bold uppercase font-display text-[#071A49]">Recent Activity</h3>
        <Link
          href="/notifications"
          className="text-xs font-mono font-bold text-[#071A49] hover:text-[#041030] transition-colors"
        >
          VIEW ALL →
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-10 bg-tech-grid rounded-[2px] border border-[#DDE2D8]">
          <Activity className="h-9 w-9 text-[#8E99A8] mb-3 stroke-[1.5]" />
          <p className="text-sm font-bold uppercase font-display text-[#071A49]">No activity yet</p>
          <p className="text-xs text-[#586274] mt-1">Team actions will show up here</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-3.5">
          {activities.map((act) => (
            <div key={act.id} className="flex items-start gap-3 sm:gap-3.5 py-1.5 px-2 rounded-[2px] hover:bg-[#F8F9F6] transition-colors">
              <Avatar
                name={act.userName}
                src={act.userAvatar}
                size="sm"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-[2px] ring-1 ring-[#DDE2D8] flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-[13px] text-[#586274] leading-snug break-words">
                  <span className="font-bold text-[#071A49]">{act.userName}</span>{" "}
                  {formatActivityText(act.type, act.metadata)}
                </p>
                <p className="text-[10px] font-mono text-[#8E99A8] mt-0.5">
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
