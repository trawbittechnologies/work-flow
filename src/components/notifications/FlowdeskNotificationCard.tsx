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
  | "MEMBER_ACTIVITY"  // 👤 Project/member activity
  | "TASK_ACTIVITY"    // 📋 Task activity
  | "COMMENT"          // 💬 Comment / Chat
  | "MENTION"          // @ Mention
  | "GENERAL";         // 🔔 General notification

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
        "w-8 h-8 rounded-xl bg-[#0A1237] text-[#C3D946] flex items-center justify-center shadow-xs flex-shrink-0 border border border-[#0A1237]",
        className
      )}
    >
      <LayoutGrid className="h-4 w-4" />
    </div>
  );
}

/**
 * Contextual Badge Icon (👤, 📋, 💬, @, 🔔)
 * Accent: Electric Lime (#C3D946) & Midnight Navy (#0A1237)
 */
function ContextualIcon({ type }: { type: FlowdeskNotificationType }) {
  const iconProps = { className: "h-3.5 w-3.5 text-[#0A1237] dark:text-[#C3D946]" };

  return (
    <div className="w-6 h-6 rounded-lg bg-[#C3D946]/20 border border-[#C3D946]/50 flex items-center justify-center flex-shrink-0">
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
        "group relative bg-surface border border-border rounded-2xl p-4 card-shadow transition-all duration-200 hover:border-[#C3D946]",
        !read && "bg-surface border-l-4 border-l-[#C3D946]"
      )}
    >
      {/* Top Identity & Timestamp Bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FlowdeskBrandMark className="w-7 h-7 rounded-lg" />
          <span className="text-xs font-black text-[#0A1237] dark:text-white tracking-tight">
            Flowdesk
          </span>
          <ContextualIcon type={type} />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-text-muted">
            {timestamp}
          </span>
          {!read && (
            <button
              onClick={() => onMarkRead?.(id)}
              title="Mark as read"
              className="text-text-muted hover:text-emerald-600 transition-colors p-1 cursor-pointer"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[#C3D946] block glow-lime animate-pulse" />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-text-muted hover:text-[#0A1237] dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-surface-alt cursor-pointer"
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
      <div className="text-xs md:text-sm leading-relaxed text-text-primary pl-0.5">
        <strong className="font-extrabold text-[#0A1237] dark:text-white">{senderName}</strong>{" "}
        <span className="text-text-secondary font-medium">{actionText}</span>{" "}
        <strong className="font-extrabold text-[#0A1237] dark:text-white">{targetName}</strong>
      </div>

      {/* Expanded Hierarchy View */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-border-subtle space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Context Tag Pill */}
          {contextTag && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-alt border border-border text-[10px] font-extrabold text-text-secondary">
              <span>{contextTag}</span>
            </div>
          )}

          {/* Expanded Action Buttons */}
          <div className="flex items-center justify-between pt-1">
            <Link
              href={targetLink}
              onClick={() => onMarkRead?.(id)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#C3D946] hover:bg-[#A8BD2F] text-[#0A1237] text-xs font-black rounded-xl shadow-xs transition-transform active:scale-98"
            >
              <span>Open {targetName.includes("App") ? "Project" : "Item"}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            {!read && (
              <button
                onClick={() => onMarkRead?.(id)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-emerald-600 transition-colors cursor-pointer"
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
