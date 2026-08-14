"use client";

import { useState, useEffect } from "react";
import { useChatStore } from "./useChatStore";
import { useChannel } from "ably/react";
import { Send, X } from "lucide-react";

export function MessageComposer({ conversationId, currentUserId }: { conversationId: string; currentUserId: string }) {
  const [text, setText] = useState("");
  const { replyingTo, setReplyingTo } = useChatStore();

  const { channel } = useChannel(`conversation:${conversationId}`, () => {
    // channel for typing events
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (text.trim().length > 0) {
        channel.publish("typing.started", { userId: currentUserId });
      } else {
        channel.publish("typing.stopped", { userId: currentUserId });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [text, channel, currentUserId]);

  const handleSend = async () => {
    if (!text.trim()) return;

    const content = text;
    setText("");
    channel.publish("typing.stopped", { userId: currentUserId });

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          replyToId: replyingTo?.id || null,
          type: "TEXT",
        }),
      });
      if (res.ok) {
        setReplyingTo(null);
      }
    } catch (error) {
      console.error("Failed to send", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 md:p-4 border-t border-border bg-surface flex flex-col gap-2 shadow-sm relative">
      {replyingTo && (
        <div className="flex items-center justify-between text-xs bg-surface-alt p-2 rounded-xl border border-border">
          <span className="text-text-secondary font-bold">Replying to {replyingTo.sender?.name}</span>
          <button onClick={() => setReplyingTo(null)} className="text-text-muted hover:text-text-primary p-0.5 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-end px-1 mb-1">
        <span className="text-[10px] font-bold text-text-muted hidden sm:inline">
          Enter to send · Shift+Enter for line break
        </span>
      </div>

      {/* Input Box & Actions */}
      <div className="flex items-end gap-2">

        <div className="flex-1 bg-surface-alt/70 rounded-2xl border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden flex items-center pr-2 transition-all">
          <textarea
            className="w-full bg-transparent px-3.5 py-2.5 resize-none focus:outline-none text-xs font-medium text-text-primary placeholder:text-text-muted min-h-[40px] max-h-[120px]"
            placeholder="Type a message..."
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button
          onClick={handleSend}
          className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs ${
            text.trim()
              ? "bg-[#C3D946] text-[#0A1237] hover:bg-[#A8BD2F] scale-100"
              : "bg-surface-alt text-text-muted cursor-not-allowed"
          }`}
          disabled={!text.trim()}
          title="Send message"
        >
          <Send className="h-4 w-4 font-black" />
        </button>
      </div>
    </div>
  );
}
