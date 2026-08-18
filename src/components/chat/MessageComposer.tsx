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
    <div className="p-3 md:p-4 border-t border-[#DDE2D8] bg-white flex flex-col gap-2 shadow-xs relative">
      {replyingTo && (
        <div className="flex items-center justify-between text-xs bg-[#F0F2EC] p-2 rounded-[2px] border border-[#DDE2D8]">
          <span className="text-[#071A49] font-bold">Replying to {replyingTo.sender?.name}</span>
          <button onClick={() => setReplyingTo(null)} className="text-[#8E99A8] hover:text-[#071A49] p-0.5 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-end px-1 mb-1">
        <span className="text-[10px] font-mono font-bold text-[#586274] hidden sm:inline uppercase">
          Enter to send · Shift+Enter for line break
        </span>
      </div>

      {/* Input Box & Actions */}
      <div className="flex items-end gap-2">

        <div className="flex-1 bg-[#F8F9F6] rounded-[2px] border border-[#DDE2D8] focus-within:border-[#071A49] focus-within:ring-1 focus-within:ring-[#071A49] overflow-hidden flex items-center pr-2 transition-all">
          <textarea
            className="w-full bg-transparent px-3.5 py-2.5 resize-none focus:outline-none text-xs font-medium text-[#071A49] placeholder:text-[#8E99A8] min-h-[40px] max-h-[120px]"
            placeholder="Type a message..."
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button
          onClick={handleSend}
          className={`h-10 w-10 rounded-[2px] flex items-center justify-center transition-all cursor-pointer shadow-xs ${
            text.trim()
              ? "bg-[#071A49] text-[#B7D600] hover:bg-[#041030] scale-100"
              : "bg-[#F0F2EC] text-[#8E99A8] cursor-not-allowed"
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
