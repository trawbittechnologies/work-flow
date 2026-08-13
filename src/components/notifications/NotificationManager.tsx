"use client";

import { useEffect, useState } from "react";
import { useAbly } from "ably/react";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";

interface NotificationManagerProps {
  userId: string;
  vapidPublicKey: string;
}

const DEFAULT_VAPID_PUBLIC_KEY = "BBmlN8JNRmRGplWVsYDDZpMyBtKbGUzSbYw-hXeZohNcnxbhSJbm4scyz7n6vDp89fdT_QaoHOqY4C-f-kwP8aQ";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function NotificationManager({ userId, vapidPublicKey }: NotificationManagerProps) {
  const { success, info } = useToast();
  const [showPrompt, setShowPrompt] = useState(false);

  const activeVapidKey = vapidPublicKey || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY;

  // Subscribe to realtime Ably channel for foreground in-app toasts
  const client = useAbly();
  useEffect(() => {
    if (!client || !client.channels) return;
    const channel = client.channels.get(`user:${userId}`);
    channel.subscribe("notification.created", (message) => {
      const data = message.data;
      info(data.title || "Trawbit FlowDesk", data.message);
    });
    return () => {
      channel.unsubscribe();
    };
  }, [client, userId, info]);

  // Register Service Worker & Handle Web Push for background OS notifications when site is closed
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }

    navigator.serviceWorker.register("/sw.js").then(async (registration) => {
      try {
        const subscription = await registration.pushManager.getSubscription();
        if (!subscription && Notification.permission === "default") {
          setShowPrompt(true);
        } else if (subscription) {
          await sendSubscriptionToServer(subscription);
        } else if (!subscription && Notification.permission === "granted") {
          // Re-subscribe automatically if permission was granted previously
          const newSub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(activeVapidKey),
          });
          await sendSubscriptionToServer(newSub);
        }
      } catch (e) {
        console.error("[NotificationManager] Push subscription error:", e);
      }
    }).catch(err => {
      console.error("[NotificationManager] Service Worker registration failed:", err);
    });
  }, [activeVapidKey]);

  async function sendSubscriptionToServer(subscription: PushSubscription) {
    try {
      await fetch("/api/notifications/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription }),
      });
    } catch (error) {
      console.error("[NotificationManager] Failed to sync push subscription:", error);
    }
  }

  async function handleEnablePush() {
    setShowPrompt(false);
    if (!("serviceWorker" in navigator)) return;

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(activeVapidKey),
          });
        }
        await sendSubscriptionToServer(subscription);
        success("Notifications enabled", "You'll now receive alerts even when Flowdesk is closed.");
      }
    } catch (error) {
      console.error("[NotificationManager] Failed to enable push notifications:", error);
    }
  }

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 p-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-lg max-w-sm">
      <h3 className="font-semibold text-[#111827] text-sm">Enable background notifications</h3>
      <p className="text-xs text-[#64748B] mt-1 mb-3">
        Receive chat, project, and task notifications even when your browser or tab is closed.
      </p>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleEnablePush} className="bg-[#BFD437] text-[#111827] hover:bg-[#AFC62F] font-semibold text-xs">
          Enable notifications
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowPrompt(false)} className="text-xs text-[#64748B]">
          Not now
        </Button>
      </div>
    </div>
  );
}
