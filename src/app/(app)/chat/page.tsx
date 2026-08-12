import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChatLayout } from "@/components/chat/ChatLayout";

export const metadata = {
  title: "Chat - Flowdesk",
  description: "Real-time communication",
};

export default async function ChatPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return <ChatLayout currentUserId={session.user.id} />;
}
