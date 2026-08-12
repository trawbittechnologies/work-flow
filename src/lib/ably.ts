import Ably from "ably";

// Initialize a singleton REST client for server-side publishing
let ablyRest: Ably.Rest | null = null;

if (process.env.ABLY_API_KEY) {
  ablyRest = new Ably.Rest({ key: process.env.ABLY_API_KEY });
} else {
  console.warn("ABLY_API_KEY is not defined. Real-time events will not be sent.");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function publishEvent(channelName: string, eventName: string, data: any) {
  if (!ablyRest) return;
  
  try {
    const channel = ablyRest.channels.get(channelName);
    await channel.publish(eventName, data);
  } catch (error) {
    console.error(`Ably publish error on channel ${channelName}:`, error);
  }
}
