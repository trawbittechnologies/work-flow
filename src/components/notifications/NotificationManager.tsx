"use client";

import { useEffect, useState } from "react";
import { useAbly } from "ably/react";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";

interface NotificationManagerProps {
  userId: string;
  vapidPublicKey: string;
}

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

  // Subscribe to realtime Ably channel
  const client = useAbly();
  useEffect(() => {
    if (!client || !client.channels) return;
    const channel = client.channels.get(`user:${userId}`);
    channel.subscribe("notification.created", (message) => {
      const data = message.data;
      info(data.title, data.message);
    });
    return () => {
      channel.unsubscribe();
    };
  }, [client, userId, info]);

  // Handle Web Push Service Worker
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      return; // Not supported
    }

    navigator.serviceWorker.register("/sw.js").then((registration) => {
      registration.pushManager.getSubscription().then((subscription) => {
        if (!subscription && Notification.permission === "default") {
          // Ask user to enable notifications after they login
          setShowPrompt(true);
        } else if (subscription) {
          // Keep it updated in DB
          sendSubscriptionToServer(subscription);
        }
      });
    }).catch(err => {
      console.error("Service Worker registration failed:", err);
    });
  }, []);

  async function sendSubscriptionToServer(subscription: PushSubscription) {
    try {
      await fetch("/api/notifications/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription }),
      });
    } catch (error) {
      console.error("Failed to sync push subscription", error);
    }
  }

  async function handleEnablePush() {
    setShowPrompt(false);
    if (!("serviceWorker" in navigator) || !vapidPublicKey) return;
    
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
        await sendSubscriptionToServer(subscription);
        success("Notifications enabled", "You'll now receive alerts when you're away.");
      }
    } catch (error) {
      console.error("Failed to enable push notifications", error);
    }
  }

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[12px] shadow-lg max-w-sm">
      <h3 className="font-semibold text-[var(--text-primary)]">Enable notifications</h3>
      <p className="text-sm text-[var(--text-secondary)] mt-1 mb-3">
        Get chat, mention, and task notifications even when Flowdesk is closed.
      </p>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleEnablePush}>Enable notifications</Button>
        <Button size="sm" variant="ghost" onClick={() => setShowPrompt(false)}>Not now</Button>
      </div>
    </div>
  );
}
