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
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Brand Header & Action Toolbar */}
      <div className="bg-surface border border-border rounded-2xl p-6 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <FlowdeskBrandMark className="w-10 h-10 rounded-2xl" />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-black text-[#0A1237] dark:text-white tracking-tight">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#C3D946] text-[#0A1237] text-xs font-black glow-lime">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-text-muted mt-0.5">
              Real-time activity stream & updates for Flowdesk Workspace
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleMarkAllRead}
            className="self-start md:self-auto shadow-xs"
          >
            <CheckCheck className="h-4 w-4 mr-1.5" />
            <span>Mark all read</span>
          </Button>
        )}
      </div>

      {/* Filter Tabs Toolbar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "ALL"
              ? "bg-[#0A1237] text-[#C3D946] shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>All ({notifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("UNREAD")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "UNREAD"
              ? "bg-[#0A1237] text-[#C3D946] shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Unread ({unreadCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("PROJECT")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "PROJECT"
              ? "bg-[#0A1237] text-[#C3D946] shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
          }`}
        >
          <UserPlus className="h-4 w-4" />
          <span>Projects</span>
        </button>

        <button
          onClick={() => setActiveTab("TASK")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "TASK"
              ? "bg-[#0A1237] text-[#C3D946] shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          <span>Tasks</span>
        </button>

        <button
          onClick={() => setActiveTab("MENTION")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "MENTION"
              ? "bg-[#0A1237] text-[#C3D946] shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
          }`}
        >
          <AtSign className="h-4 w-4" />
          <span>Mentions & Chat</span>
        </button>
      </div>

      {/* Main Notification Cards Feed */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl bg-surface-alt" />
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
        <div className="bg-surface border border-border rounded-2xl p-12 text-center card-shadow">
          <div className="w-12 h-12 rounded-2xl bg-[#0A1237] text-[#C3D946] flex items-center justify-center mx-auto mb-3 shadow-md">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-base font-extrabold text-[#0A1237] dark:text-white">
            Inbox is clean
          </h3>
          <p className="text-xs font-medium text-text-muted mt-1 max-w-sm mx-auto">
            No notifications match your selected filter tab.
          </p>
        </div>
      )}
    </div>
  );
}
