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
  CheckCircle2,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export type FlowdeskNotificationType = 
  | "MEMBER_ACTIVITY"  // Project/member activity
  | "TASK_ACTIVITY"    // Task activity
  | "COMMENT"          // Comment / Chat
  | "MENTION"          // Mention
  | "GENERAL";         // General notification

export interface FlowdeskNotificationProps {
  id: string;
  type: FlowdeskNotificationType;
  senderName: string;
  actionText: string;
  targetName: string;
  targetLink?: string;
  contextTag?: string;
  timestamp: string;
  read?: boolean;
  onMarkRead?: (id: string) => void;
  defaultExpanded?: boolean;
}

/**
 * Modern FlowDesk Brand Mark Header Icon
 * Deep Midnight Navy (#0A1237) container with Electric Lime (#C3D946) logo icon
 */
export function FlowdeskBrandMark({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "w-8 h-8 rounded-[2px] bg-[#071A49] text-[#B7D600] flex items-center justify-center shadow-xs flex-shrink-0 border border-[#071A49]",
        className
      )}
    >
      <LayoutGrid className="h-4 w-4" />
    </div>
  );
}

/**
 * Contextual Badge Icon (Lucide Icons)
 * Accent: Electric Lime (#B7D600) & Deep Anchor Navy (#071A49)
 */
function ContextualIcon({ type }: { type: FlowdeskNotificationType }) {
  const iconProps = { className: "h-3.5 w-3.5 text-[#071A49]" };

  return (
    <div className="w-6 h-6 rounded-[2px] bg-[#F1F8CE] border border-[#B7D600] flex items-center justify-center flex-shrink-0">
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
        "group relative bg-white border border-[#DDE2D8] rounded-[2px] p-4 shadow-xs transition-all duration-200 hover:border-[#071A49]",
        !read && "border-l-4 border-l-[#B7D600]"
      )}
    >
      {/* Top Identity & Timestamp Bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FlowdeskBrandMark className="w-6 h-6 rounded-[2px]" />
          <span className="text-xs font-bold font-display uppercase text-[#071A49] tracking-tight">
            Flowdesk
          </span>
          <ContextualIcon type={type} />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-[#586274]">
            {timestamp}
          </span>
          {!read && (
            <button
              onClick={() => onMarkRead?.(id)}
              title="Mark as read"
              className="text-[#586274] hover:text-emerald-700 transition-colors p-1 cursor-pointer"
            >
              <span className="h-2 w-2 rounded-[2px] bg-[#B7D600] block" />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[#586274] hover:text-[#071A49] transition-colors p-1 rounded-[2px] hover:bg-[#F0F2EC] cursor-pointer"
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
      <div className="text-xs md:text-sm leading-relaxed text-[#071A49] pl-0.5">
        <strong className="font-bold text-[#071A49]">{senderName}</strong>{" "}
        <span className="text-[#586274] font-medium">{actionText}</span>{" "}
        <strong className="font-bold text-[#071A49]">{targetName}</strong>
      </div>

      {/* Expanded Hierarchy View */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-[#DDE2D8] space-y-3 animate-in duration-150">
          {/* Context Tag Pill */}
          {contextTag && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[2px] bg-[#F0F2EC] border border-[#DDE2D8] text-[10px] font-mono font-bold text-[#586274] uppercase">
              <span>{contextTag}</span>
            </div>
          )}

          {/* Expanded Action Buttons */}
          <div className="flex items-center justify-between pt-1">
            <Link
              href={targetLink}
              onClick={() => onMarkRead?.(id)}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 bg-[#071A49] hover:bg-[#041030] text-[#B7D600] text-xs font-mono font-bold uppercase rounded-[2px] shadow-xs transition-transform active:scale-98"
            >
              <span>Open {targetName.includes("App") ? "Project" : "Item"}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            {!read && (
              <button
                onClick={() => onMarkRead?.(id)}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#586274] hover:text-emerald-700 transition-colors cursor-pointer uppercase"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Mark read</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
