"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatRelative } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import type { NotificationWithProject } from "@/types";

export default function NotificationsPage() {
  const { success, error: showError } = useToast();
  const [notifications, setNotifications] = useState<NotificationWithProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/notifications?limit=50");
        if (res.ok) {
          const body = await res.json();
          if (!ignore) {
            setNotifications(body.data || []);
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

  async function handleMarkAllRead() {
    try {
      const res = await fetch("/api/notifications/read-all", { method: "POST" });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        success("All marked read", "Your notification inbox is clean.");
      }
    } catch {
      showError("Error", "Failed to update notifications.");
    }
  }

  async function handleMarkSingleRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Notifications</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "You're all caught up!"}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<CheckCheck className="h-3.5 w-3.5" />}
            onClick={handleMarkAllRead}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-[12px]" />
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[14px] divide-y divide-[var(--border-subtle)] overflow-hidden shadow-xs">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && handleMarkSingleRead(n.id)}
              className={`p-4 flex items-start gap-3.5 transition-colors cursor-pointer ${
                !n.read ? "bg-[var(--primary-subtle)]/20" : "hover:bg-[var(--background)]"
              }`}
            >
              <div className="h-8 w-8 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bell className="h-4 w-4 text-[var(--primary)]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className={`text-xs font-semibold ${!n.read ? "text-[var(--primary)]" : "text-[var(--text-primary)]"}`}>
                    {n.title}
                  </h3>
                  <span className="text-[10px] text-[var(--text-muted)] flex-shrink-0">
                    {formatRelative(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{n.message}</p>
              </div>

              {!n.read && (
                <span className="h-2 w-2 rounded-full bg-[var(--primary)] flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="You're all caught up"
          description="No new notifications at this time."
        />
      )}
    </div>
  );
}
