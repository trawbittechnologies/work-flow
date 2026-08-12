"use client";
import { useChatStore } from "./useChatStore";
import { useChannel } from "ably/react";

export function TypingIndicator({ conversationId }: { conversationId: string }) {
  const { typingUsers, setTyping } = useChatStore();

  useChannel(`conversation:${conversationId}`, (message) => {
    if (message.name === "typing.started") {
      setTyping(conversationId, message.data.userId, true);
    } else if (message.name === "typing.stopped") {
      setTyping(conversationId, message.data.userId, false);
    }
  });

  const currentlyTyping = typingUsers[conversationId] || [];

  if (currentlyTyping.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500 italic mb-2">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
      </div>
      <span>Someone is typing...</span>
    </div>
  );
}
