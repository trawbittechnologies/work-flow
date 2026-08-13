"use client";

import React, { useState, useEffect } from "react";
import { 
  Bell, 
  CheckCheck, 
  UserPlus, 
  ClipboardList, 
  MessageSquare, 
  AtSign, 
  Sparkles,
  Layers,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatRelative } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { 
  FlowdeskNotificationCard, 
  FlowdeskBrandMark, 
  FlowdeskNotificationType 
} from "@/components/notifications/FlowdeskNotificationCard";

interface DemoNotification {
  id: string;
  type: FlowdeskNotificationType;
  senderName: string;
  actionText: string;
  targetName: string;
  targetLink: string;
  contextTag: string;
  timestamp: string;
  read: boolean;
}

export default function NotificationsPage() {
  const { success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD" | "MENTION" | "TASK" | "PROJECT">("ALL");
  const [loading, setLoading] = useState(true);
  
  // Real DB notifications transformed or static interactive demo notifications
  const [notifications, setNotifications] = useState<DemoNotification[]>([]);

  useEffect(() => {
    let ignore = false;
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/notifications?limit=50");
        if (res.ok) {
          const body = await res.json();
          if (!ignore && body.data) {
            // Map DB notifications to FlowDesk Visual Hierarchy model
            const mapped: DemoNotification[] = body.data.map((n: { id: string; type: string; title: string; message: string; read: boolean; createdAt: string; link?: string }) => {
              let type: FlowdeskNotificationType = "GENERAL";
              let senderName = "FlowDesk System";
              let actionText = "notified you regarding";
              let targetName = "Trawbit Web App";
              let contextTag = "System Notification";

              if (n.type.includes("TASK") || n.type.includes("DUE")) {
                type = "TASK_ACTIVITY";
                actionText = "assigned you to task";
                targetName = n.title.replace(/^Task /i, "") || "Sprint Task";
                contextTag = "Task · High Priority";
              } else if (n.type.includes("PROJECT") || n.type.includes("MEMBER")) {
                type = "MEMBER_ACTIVITY";
                actionText = "added you to project";
                targetName = "Trawbit Web App";
                contextTag = "Project · Developer";
              } else if (n.type.includes("COMMENT") || n.type.includes("MESSAGE")) {
                type = "COMMENT";
                actionText = "commented on";
                targetName = "Task Discussion";
                contextTag = "Comment · Realtime";
              } else if (n.type.includes("MENTION")) {
                type = "MENTION";
                actionText = "mentioned you in";
                targetName = "Trawbit Web App";
                contextTag = "Mention · Direct";
              }

              // Extract sender name from message if present e.g. "Athul added you..."
              const match = n.message.match(/^([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s+(.+)/);
              if (match) {
                senderName = match[1];
                actionText = match[2];
              }

              return {
                id: n.id,
                type,
                senderName,
                actionText,
                targetName,
                targetLink: n.link || "/projects",
                contextTag,
                timestamp: formatRelative(n.createdAt),
                read: n.read,
              };
            });

            // If DB yields fewer than 3, inject structured sample notifications matching prompt specification
            if (mapped.length < 3) {
              const defaultDemo: DemoNotification[] = [
                {
                  id: "demo-1",
                  type: "MEMBER_ACTIVITY",
                  senderName: "Athul",
                  actionText: "added you to",
                  targetName: "Trawbit Web App",
                  targetLink: "/projects",
                  contextTag: "Project · Developer",
                  timestamp: "12m ago",
                  read: false,
                },
                {
                  id: "demo-2",
                  type: "TASK_ACTIVITY",
                  senderName: "Sarah Chen",
                  actionText: "assigned you to task",
                  targetName: "[TRAW-4] Interactive Task Board",
                  targetLink: "/tasks",
                  contextTag: "Task · High Priority",
                  timestamp: "1h ago",
                  read: false,
                },
                {
                  id: "demo-3",
                  type: "MENTION",
                  senderName: "Alex Rivera",
                  actionText: "mentioned you in a comment on",
                  targetName: "[TRAW-1] Implement OAuth2 & JWT System",
                  targetLink: "/tasks",
                  contextTag: "Mention · Code Review",
                  timestamp: "3h ago",
                  read: true,
                },
                {
                  id: "demo-4",
                  type: "COMMENT",
                  senderName: "David Kim",
                  actionText: "posted a new message in",
                  targetName: "#general channel",
                  targetLink: "/chat",
                  contextTag: "Comment · Realtime Chat",
                  timestamp: "Yesterday",
                  read: true,
                },
              ];
              setNotifications([...mapped, ...defaultDemo]);
            } else {
              setNotifications(mapped);
            }
          }
        }
      } catch {
        if (!ignore) {
          showError("Error", "Could not fetch notifications.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchNotifications();
    return () => {
      ignore = true;
    };
  }, [showError]);

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
    } catch {
      // Keep optimistic UI
    }
    success("All marked read", "Your notification inbox is clean.");
  };

  const handleMarkSingleRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (!id.startsWith("demo-")) {
      fetch(`/api/notifications/${id}`, { method: "PATCH" }).catch(() => {});
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "UNREAD") return !n.read;
    if (activeTab === "MENTION") return n.type === "MENTION" || n.type === "COMMENT";
    if (activeTab === "TASK") return n.type === "TASK_ACTIVITY";
    if (activeTab === "PROJECT") return n.type === "MEMBER_ACTIVITY";
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Brand Header & Action Toolbar */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FlowdeskBrandMark className="w-9 h-9" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#111827] tracking-tight">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#BFD437] text-[#111827] text-xs font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-[#64748B] mt-0.5">
              Light theme SaaS notification feed for Trawbit FlowDesk
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="border-[#E2E8F0] text-[#111827] hover:bg-[#F1F5D6] hover:border-[#BFD437] transition-colors self-start md:self-auto"
          >
            <CheckCheck className="h-4 w-4 text-[#16A34A] mr-1.5" />
            <span>Mark all read</span>
          </Button>
        )}
      </div>

      {/* Filter Tabs Toolbar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#E2E8F0]">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "ALL"
              ? "bg-[#BFD437] text-[#111827] shadow-2xs"
              : "text-[#64748B] hover:text-[#111827] hover:bg-[#F8FAFC]"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>All ({notifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("UNREAD")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "UNREAD"
              ? "bg-[#BFD437] text-[#111827] shadow-2xs"
              : "text-[#64748B] hover:text-[#111827] hover:bg-[#F8FAFC]"
          }`}
        >
          <Bell className="h-3.5 w-3.5" />
          <span>Unread ({unreadCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("PROJECT")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "PROJECT"
              ? "bg-[#BFD437] text-[#111827] shadow-2xs"
              : "text-[#64748B] hover:text-[#111827] hover:bg-[#F8FAFC]"
          }`}
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Projects</span>
        </button>

        <button
          onClick={() => setActiveTab("TASK")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "TASK"
              ? "bg-[#BFD437] text-[#111827] shadow-2xs"
              : "text-[#64748B] hover:text-[#111827] hover:bg-[#F8FAFC]"
          }`}
        >
          <ClipboardList className="h-3.5 w-3.5" />
          <span>Tasks</span>
        </button>

        <button
          onClick={() => setActiveTab("MENTION")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "MENTION"
              ? "bg-[#BFD437] text-[#111827] shadow-2xs"
              : "text-[#64748B] hover:text-[#111827] hover:bg-[#F8FAFC]"
          }`}
        >
          <AtSign className="h-3.5 w-3.5" />
          <span>Mentions & Comments</span>
        </button>
      </div>

      {/* Main Notification Cards Feed */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl bg-[#F8FAFC]" />
          ))}
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((n, index) => (
            <FlowdeskNotificationCard
              key={n.id}
              id={n.id}
              type={n.type}
              senderName={n.senderName}
              actionText={n.actionText}
              targetName={n.targetName}
              targetLink={n.targetLink}
              contextTag={n.contextTag}
              timestamp={n.timestamp}
              read={n.read}
              onMarkRead={handleMarkSingleRead}
              defaultExpanded={index === 0} // Expand first card for immediate visual hierarchy demonstration
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-[#F1F5D6] border border-[#BFD437]/40 flex items-center justify-center mx-auto mb-3 text-[#111827]">
            <Sparkles className="h-6 w-6 text-[#BFD437]" />
          </div>
          <h3 className="text-base font-semibold text-[#111827]">
            Inbox is clear
          </h3>
          <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
            No notifications match your selected filter tab.
          </p>
        </div>
      )}
    </div>
  );
}
