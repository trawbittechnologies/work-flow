"use client";

import React, { useState, useEffect } from "react";
import { 
  Bell, 
  CheckCheck, 
  UserPlus, 
  ClipboardList, 
  AtSign, 
  Sparkles,
  Layers,
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
              let senderName = "Flowdesk System";
              let actionText = "notified you regarding";
              let targetName = "Workspace";
              let contextTag = "System Notification";

              if (n.type.includes("TASK") || n.type.includes("DUE")) {
                type = "TASK_ACTIVITY";
                actionText = "assigned you to task";
                targetName = n.title.replace(/^Task /i, "") || "Sprint Task";
                contextTag = "Task · High Priority";
              } else if (n.type.includes("PROJECT") || n.type.includes("MEMBER")) {
                type = "MEMBER_ACTIVITY";
                actionText = "added you to project";
                targetName = "Workspace Project";
                contextTag = "Project · Collaboration";
              } else if (n.type.includes("COMMENT") || n.type.includes("MESSAGE")) {
                type = "COMMENT";
                actionText = "posted a message in";
                targetName = "Chat Discussion";
                contextTag = "Chat · Realtime";
              } else if (n.type.includes("MENTION")) {
                type = "MENTION";
                actionText = "mentioned you in";
                targetName = "Discussion";
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

            if (mapped.length < 3) {
              const defaultDemo: DemoNotification[] = [
                {
                  id: "demo-1",
                  type: "MEMBER_ACTIVITY",
                  senderName: "Athul Krishna",
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
                  targetName: "[FD-42] Interactive Jira Kanban Board",
                  targetLink: "/tasks",
                  contextTag: "Task · Urgent Priority",
                  timestamp: "1h ago",
                  read: false,
                },
                {
                  id: "demo-3",
                  type: "MENTION",
                  senderName: "Alex Rivera",
                  actionText: "mentioned you in a comment on",
                  targetName: "[FD-12] Real-time Push Notifications",
                  targetLink: "/tasks",
                  contextTag: "Mention · Code Review",
                  timestamp: "3h ago",
                  read: true,
                },
                {
                  id: "demo-4",
                  type: "COMMENT",
                  senderName: "David Kim",
                  actionText: "sent a direct message in",
                  targetName: "Direct Messages",
                  targetLink: "/chat",
                  contextTag: "Direct Message · Realtime",
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
    <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6 pb-12">
      {/* Brand Header & Action Toolbar */}
      <div className="bg-white border border-[#EAEDF2] rounded-2xl p-4 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-3.5">
          <FlowdeskBrandMark className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-[#111827] tracking-tight truncate">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#88C315] text-white text-[11px] sm:text-xs font-black shadow-2xs">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs font-medium text-[#6B7280] mt-0.5 truncate">
              Real-time activity stream & updates for Flowdesk Workspace
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleMarkAllRead}
            className="self-start md:self-auto shadow-2xs text-xs"
          >
            <CheckCheck className="h-4 w-4 mr-1.5" />
            <span>Mark all read</span>
          </Button>
        )}
      </div>

      {/* Filter Tabs Toolbar */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-thin border-b border-[#EAEDF2]">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
            activeTab === "ALL"
              ? "bg-[#111827] text-white shadow-2xs"
              : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>All ({notifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("UNREAD")}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
            activeTab === "UNREAD"
              ? "bg-[#111827] text-white shadow-2xs"
              : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
          }`}
        >
          <Bell className="h-3.5 w-3.5" />
          <span>Unread ({unreadCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("PROJECT")}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
            activeTab === "PROJECT"
              ? "bg-[#111827] text-white shadow-2xs"
              : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
          }`}
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Projects</span>
        </button>

        <button
          onClick={() => setActiveTab("TASK")}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
            activeTab === "TASK"
              ? "bg-[#111827] text-white shadow-2xs"
              : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
          }`}
        >
          <ClipboardList className="h-3.5 w-3.5" />
          <span>Tasks</span>
        </button>

        <button
          onClick={() => setActiveTab("MENTION")}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
            activeTab === "MENTION"
              ? "bg-[#111827] text-white shadow-2xs"
              : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
          }`}
        >
          <AtSign className="h-3.5 w-3.5" />
          <span>Mentions & Chat</span>
        </button>
      </div>

      {/* Main Notification Cards Feed */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
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
              defaultExpanded={index === 0}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#EAEDF2] rounded-2xl p-8 sm:p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-[#F3F9DE] text-[#88C315] flex items-center justify-center mx-auto mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-base font-extrabold text-[#111827]">
            Inbox is clean
          </h3>
          <p className="text-xs font-medium text-[#9CA3AF] mt-1 max-w-sm mx-auto">
            No notifications match your selected filter tab.
          </p>
        </div>
      )}
    </div>
  );
}
