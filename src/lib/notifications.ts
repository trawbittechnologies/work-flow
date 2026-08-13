import { prisma } from "@/lib/prisma";
import { webpush } from "./web-push";
import { NotificationType } from "@prisma/client";
import Ably from "ably";
import nodemailer from "nodemailer";

const ably = process.env.ABLY_API_KEY ? new Ably.Rest({ key: process.env.ABLY_API_KEY }) : null;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  projectId?: string;
  taskId?: string;
  sendEmail?: boolean;
  senderAvatar?: string;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
  projectId,
  taskId,
  sendEmail = false,
  senderAvatar,
}: CreateNotificationInput) {
  // 1. Save to database
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link,
      projectId,
      taskId,
    },
  });

  // 2. Real-time update via Ably (if configured)
  if (ably) {
    try {
      const channel = ably.channels.get(`user:${userId}`);
      await channel.publish("notification.created", notification);
    } catch (error) {
      console.error("[notifications] Failed to publish Ably event:", error);
    }
  }

  // 3. Custom Web Push Notification for recipient devices
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length > 0) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://work-flow-three-xi.vercel.app";

      // Contextual Icon Prefix for Push Body
      let prefix = "🔔";
      const typeStr = String(type);
      if (typeStr.includes("PROJECT") || typeStr.includes("MEMBER") || typeStr.includes("INVITE")) {
        prefix = "👤";
      } else if (typeStr.includes("TASK")) {
        prefix = "📋";
      } else if (typeStr.includes("COMMENT") || typeStr.includes("MESSAGE")) {
        prefix = "💬";
      } else if (typeStr.includes("MENTION")) {
        prefix = "@";
      }

      const formattedBody = message.startsWith("👤") || message.startsWith("📋") || message.startsWith("💬") || message.startsWith("@")
        ? message
        : `${prefix} ${message}`;

      const iconUrl = senderAvatar && senderAvatar.startsWith("http")
        ? senderAvatar
        : `${baseUrl}/icon-192.png`;

      const payload = JSON.stringify({
        title,
        body: formattedBody,
        icon: iconUrl,
        badge: `${baseUrl}/badge-72.png`,
        url: link || "/chat",
        notificationId: notification.id,
        tag: `flowdesk-${typeStr.toLowerCase()}`,
        actions: [
          { action: "open", title: "Open Flowdesk" },
          { action: "dismiss", title: "Dismiss" },
        ],
      });

      const pushPromises = subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payload
          );
        } catch (error: unknown) {
          const pushError = error as { statusCode?: number };
          if (pushError.statusCode === 404 || pushError.statusCode === 410) {
            console.log("[notifications] Subscription expired, deleting:", sub.id);
            await prisma.pushSubscription.delete({ where: { id: sub.id } });
          } else {
            console.error("[notifications] Error sending web push:", error);
          }
        }
      });

      await Promise.allSettled(pushPromises);
    }
  } catch (error) {
    console.error("[notifications] Error sending push notifications:", error);
  }

  // 4. Optional Email Fallback
  if (sendEmail && process.env.SMTP_USER) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.email) {
        await transporter.sendMail({
          from: `"${process.env.SMTP_FROM_NAME || "Flowdesk"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
          to: user.email,
          subject: title,
          text: message,
          html: `<p>${message}</p>${link ? `<p><a href="${process.env.NEXT_PUBLIC_APP_URL}${link}">View details</a></p>` : ""}`,
        });
      }
    } catch (error) {
      console.error("[notifications] Error sending email notification:", error);
    }
  }

  return notification;
}

export async function createNotificationsForProjectMembers(
  projectId: string,
  excludeUserId: string,
  input: Omit<CreateNotificationInput, "userId" | "projectId">
) {
  try {
    const members = await prisma.projectMember.findMany({
      where: { projectId, userId: { not: excludeUserId } },
      select: { userId: true },
    });

    const promises = members.map((m) =>
      createNotification({
        ...input,
        userId: m.userId,
        projectId,
      })
    );

    await Promise.allSettled(promises);
  } catch (error) {
    console.error("[notifications] Failed to create bulk notifications:", error);
  }
}
