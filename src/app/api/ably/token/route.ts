import { auth } from "@/lib/auth";
import Ably from "ably";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ABLY_API_KEY) {
    return NextResponse.json({ disabled: true, message: "Ably API key not configured" });
  }

  try {
    const client = new Ably.Rest(process.env.ABLY_API_KEY);
    const tokenRequestData = await client.auth.createTokenRequest({
      clientId: session.user.id,
    });
    return NextResponse.json(tokenRequestData);
  } catch (error) {
    console.error("Ably auth error:", error);
    return NextResponse.json({ disabled: true, error: "Failed to generate token" }, { status: 200 });
  }
}
