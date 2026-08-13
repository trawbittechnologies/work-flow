"use client";

import React, { useState } from "react";
import { 
  UserPlus, 
  ClipboardList, 
  MessageSquare, 
  AtSign, 
  Bell, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

export type FlowdeskNotificationType = 
  | "MEMBER_ACTIVITY"  // 👤 Project/member activity
  | "TASK_ACTIVITY"    // 📋 Task activity
  | "COMMENT"          // 💬 Comment
  | "MENTION"          // @ Mention
  | "GENERAL";         // 🔔 General notification

export interface FlowdeskNotificationProps {
  id: string;
  type: FlowdeskNotificationType;
  senderName: string;
  actionText: string;
  targetName: string;
  targetLink?: string;
  contextTag?: string; // e.g., "Project · Developer" or "Task · High Priority"
  timestamp: string;
  read?: boolean;
  onMarkRead?: (id: string) => void;
  defaultExpanded?: boolean;
}

/**
 * Minimal Geometric FlowDesk Brand Mark
 * White symbol on #BFD437 rounded-square icon container
 */
export function FlowdeskBrandMark({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "w-7 h-7 rounded-lg bg-[#BFD437] flex items-center justify-center shadow-xs flex-shrink-0",
        className
      )}
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Geometric interlocking FlowDesk marks */}
        <rect x="4" y="4" width="7" height="7" rx="1.5" fill="#FFFFFF" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" fill="#FFFFFF" fillOpacity="0.85" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" fill="#FFFFFF" fillOpacity="0.85" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

/**
 * Contextual Badge Icon (👤, 📋, 💬, @, 🔔)
 * Background: #F1F5D6
 */
function ContextualIcon({ type }: { type: FlowdeskNotificationType }) {
  const iconProps = { className: "h-3.5 w-3.5 text-[#111827]" };

  return (
    <div className="w-6 h-6 rounded-md bg-[#F1F5D6] border border-[#BFD437]/40 flex items-center justify-center flex-shrink-0">
      {type === "MEMBER_ACTIVITY" && <UserPlus {...iconProps} />}
      {type === "TASK_ACTIVITY" && <ClipboardList {...iconProps} />}
      {type === "COMMENT" && <MessageSquare {...iconProps} />}
      {type === "MENTION" && <AtSign {...iconProps} />}
      {type === "GENERAL" && <Bell {...iconProps} />}
    </div>
  );
}

export function FlowdeskNotificationCard({
  id,
  type,
  senderName,
  actionText,
  targetName,
  targetLink = "#",
  contextTag,
  timestamp,
  read = false,
  onMarkRead,
  defaultExpanded = false,
}: FlowdeskNotificationProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      className={cn(
        "group relative bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4 shadow-xs transition-all duration-200 hover:shadow-md hover:border-[#BFD437]/60",
        !read && "bg-[#F8FAFC] border-l-4 border-l-[#BFD437]"
      )}
    >
      {/* Top Identity & Timestamp Bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* FlowDesk App Identity Icon */}
          <FlowdeskBrandMark />
          <span className="text-xs font-semibold text-[#64748B] tracking-tight">
            Trawbit FlowDesk
          </span>
          <ContextualIcon type={type} />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-[#94A3B8]">
            {timestamp}
          </span>
          {!read && (
            <button
              onClick={() => onMarkRead?.(id)}
              title="Mark as read"
              className="text-[#94A3B8] hover:text-[#16A34A] transition-colors p-1"
            >
              <span className="h-2 w-2 rounded-full bg-[#BFD437] block" />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[#94A3B8] hover:text-[#111827] transition-colors p-1 rounded-md hover:bg-[#F8FAFC]"
            aria-label={isExpanded ? "Collapse notification" : "Expand notification"}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Primary Notification Message: Sender -> Action -> Target */}
      <div className="text-sm leading-snug text-[#111827]">
        <strong className="font-semibold text-[#111827]">{senderName}</strong>{" "}
        <span className="text-[#64748B]">{actionText}</span>{" "}
        <strong className="font-semibold text-[#111827]">{targetName}</strong>
      </div>

      {/* Expanded Hierarchy View */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-[#E2E8F0] space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Context Tag Pill */}
          {contextTag && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] font-medium text-[#64748B]">
              <span>{contextTag}</span>
            </div>
          )}

          {/* Expanded Action Button */}
          <div className="flex items-center justify-between pt-1">
            <a
              href={targetLink}
              onClick={() => onMarkRead?.(id)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#BFD437] hover:bg-[#AFC62F] text-[#111827] text-xs font-semibold rounded-lg shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-[#BFD437]/50"
            >
              <span>Open {targetName.includes("App") ? "Project" : "Item"}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            {!read && (
              <button
                onClick={() => onMarkRead?.(id)}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#64748B] hover:text-[#16A34A] transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Mark read</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
