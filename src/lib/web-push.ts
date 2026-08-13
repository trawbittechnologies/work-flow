import webpush from "web-push";

const publicKey = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BBmlN8JNRmRGplWVsYDDZpMyBtKbGUzSbYw-hXeZohNcnxbhSJbm4scyz7n6vDp89fdT_QaoHOqY4C-f-kwP8aQ";
const privateKey = process.env.VAPID_PRIVATE_KEY || "jzxatmK4qB36Iz8u65owwUtHr1xV8ESESBSg8vft8cM";
const subject = process.env.VAPID_SUBJECT || "mailto:trawbittechnologies@gmail.com";

if (publicKey && privateKey) {
  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
  } catch (e) {
    console.error("[web-push] Failed to set VAPID details:", e);
  }
}

export { webpush };
