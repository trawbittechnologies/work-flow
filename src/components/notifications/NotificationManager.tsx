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
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-[#111827]/40 backdrop-blur-sm" />
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 p-6 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-2xl max-w-sm w-full text-center">
        <div className="h-12 w-12 rounded-full bg-[#F3F9DE] flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-[#88C315]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        </div>
        <h3 className="font-bold text-[#111827] text-lg">Enable Notifications</h3>
        <p className="text-sm text-[#64748B] mt-2 mb-6">
          Receive chat, project, and task notifications even when your browser or tab is closed.
        </p>
        <div className="flex gap-3 justify-center w-full">
          <Button size="sm" variant="ghost" onClick={() => setShowPrompt(false)} className="text-sm text-[#64748B] flex-1">
            Not now
          </Button>
          <Button size="sm" onClick={handleEnablePush} className="bg-[#88C315] text-white hover:bg-[#77AB12] font-bold text-sm flex-1 shadow-md shadow-[#88C315]/20">
            Enable
          </Button>
        </div>
      </div>
    </>
  );
}
