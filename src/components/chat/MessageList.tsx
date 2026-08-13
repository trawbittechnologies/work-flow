"use client";
import { useEffect, useState, useRef } from "react";
import { MessageItem } from "./MessageItem";
import { TypingIndicator } from "./TypingIndicator";
import { useChannel } from "ably/react";

export function MessageList({ conversationId, currentUserId }: { conversationId: string, currentUserId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/conversations/${conversationId}/messages`);
        const data = await res.json();
        if (isMounted && data.messages) {
          setMessages(data.messages);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) {
          setLoading(false);
          setTimeout(() => {
            if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }, 100);
        }
      }
    };

    fetchMessages();
    return () => {
      isMounted = false;
    };
  }, [conversationId]);

  useChannel(`conversation:${conversationId}`, (msg) => {
    if (msg.name === "message.created") {
      setMessages((prev) => {
        if (prev.find(m => m.id === msg.data.id)) return prev;
        return [...prev, msg.data];
      });
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    }
  });

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-xs font-bold text-text-muted">Loading conversation...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-background" ref={scrollRef}>
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-text-muted">
          <p className="text-sm font-bold text-[#0A1237] dark:text-white mb-1">No messages yet</p>
          <p className="text-xs text-text-muted">Send a message to start the conversation!</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {messages.map((msg) => (
            <MessageItem key={msg.id} message={msg} isOwn={msg.senderId === currentUserId} />
          ))}
        </div>
      )}
      <TypingIndicator conversationId={conversationId} />
    </div>
  );
}
