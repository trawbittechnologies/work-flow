"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils";
import { Send, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import type { MessageWithUser } from "@/types";

export default function ProjectChatPage() {
  const routeParams = useParams();
  const projectId = (routeParams?.projectId as string) || "";
  const { error: showError } = useToast();
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    let isMounted = true;
    const fetchChatMessages = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/messages`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setMessages(data.data || []);
        }
      } catch {
        if (isMounted) showError("Error", "Could not load messages.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchChatMessages();
    const interval = setInterval(fetchChatMessages, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [projectId, showError]);

  useEffect(() => {
    if (!loading) scrollToBottom();
  }, [messages, loading]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSending(true);
    const messageContent = content;
    setContent("");

    try {
      const res = await fetch(`/api/projects/${projectId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageContent }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.data]);
        scrollToBottom();
      } else {
        setContent(messageContent);
        showError("Failed to send message", "Please try again.");
      }
    } catch {
      setContent(messageContent);
      showError("Error", "Connection failure.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[14px] flex flex-col h-[calc(100vh-260px)] min-h-[450px] shadow-xs overflow-hidden">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-3/4 rounded-[10px]" />
            ))}
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg) => {
            const sender = msg.sender || msg.user || { name: "Team Member", avatar: null };
            const senderName = sender.name || "Team Member";
            return (
              <div key={msg.id} className="flex items-start gap-3 group">
                <Avatar name={senderName} src={sender.avatar} size="sm" className="mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">
                      {senderName}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {formatDateTime(msg.createdAt)}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-[var(--text-primary)] bg-[var(--background)] border border-[var(--border-subtle)] p-2.5 rounded-[10px] max-w-xl whitespace-pre-wrap leading-relaxed inline-block">
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-[var(--text-muted)] p-6">
            <MessageSquare className="h-8 w-8 mb-2 stroke-1" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">No messages yet</p>
            <p className="text-xs">Start the project conversation below.</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <form onSubmit={handleSend} className="p-3 border-t border-[var(--border)] bg-[var(--background)] flex gap-2">
        <input
          type="text"
          placeholder="Write a message to the team..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 h-9 px-3 text-xs rounded-[10px] border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text-primary)]"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={sending}
          disabled={!content.trim()}
          leftIcon={<Send className="h-3.5 w-3.5" />}
        >
          Send
        </Button>
      </form>
    </div>
  );
}
