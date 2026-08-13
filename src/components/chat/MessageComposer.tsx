"use client";

import { useState, useRef, useEffect } from "react";
import { useChatStore } from "./useChatStore";
import { useChannel } from "ably/react";
import { Paperclip, Send, X, Bold, Italic, Code, Link as LinkIcon, Smile } from "lucide-react";

export function MessageComposer({ conversationId, currentUserId }: { conversationId: string; currentUserId: string }) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const { replyingTo, setReplyingTo } = useChatStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const applyFormat = (syntax: string) => {
    setText((prev) => `${prev}${syntax}`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = await res.json();

      if (data.url) {
        await fetch(`/api/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: "",
            type: file.type.startsWith("image/") ? "IMAGE" : "FILE",
            attachments: [{ url: data.url, filename: data.filename, size: data.size, mimeType: data.type }],
          }),
        });
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const emojisList = ["👍", "❤️", "🔥", "🎉", "😊", "🚀", "🙌", "✅"];

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

      {/* Formatting Toolbar */}
      <div className="flex items-center justify-between px-1 text-text-muted">
        <div className="flex items-center gap-1">
          <button
            onClick={() => applyFormat("**bold text**")}
            className="p-1.5 hover:bg-surface-alt rounded-lg text-text-muted hover:text-[#0A1237] dark:hover:text-white transition-colors cursor-pointer"
            title="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => applyFormat("*italic text*")}
            className="p-1.5 hover:bg-surface-alt rounded-lg text-text-muted hover:text-[#0A1237] dark:hover:text-white transition-colors cursor-pointer"
            title="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => applyFormat("`code`")}
            className="p-1.5 hover:bg-surface-alt rounded-lg text-text-muted hover:text-[#0A1237] dark:hover:text-white transition-colors cursor-pointer"
            title="Inline Code"
          >
            <Code className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => applyFormat("[Link](url)")}
            className="p-1.5 hover:bg-surface-alt rounded-lg text-text-muted hover:text-[#0A1237] dark:hover:text-white transition-colors cursor-pointer"
            title="Add Link"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setShowEmojis((o) => !o)}
            className="p-1.5 hover:bg-surface-alt rounded-lg text-text-muted hover:text-[#0A1237] dark:hover:text-[#C3D946] transition-colors cursor-pointer"
            title="Insert Emoji"
          >
            <Smile className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className="text-[10px] font-bold text-text-muted hidden sm:inline">
          Enter to send · Shift+Enter for line break
        </span>
      </div>

      {/* Emoji Quick Bar Drawer */}
      {showEmojis && (
        <div className="flex items-center gap-2 p-2 bg-surface-alt rounded-xl border border-border">
          {emojisList.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setText((t) => t + emoji);
                setShowEmojis(false);
              }}
              className="p-1 hover:scale-125 transition-transform text-sm cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input Box & Actions */}
      <div className="flex items-end gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 text-text-muted hover:text-[#0A1237] dark:hover:text-[#C3D946] hover:bg-surface-alt rounded-xl transition-colors cursor-pointer"
          disabled={uploading}
          title="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

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
          disabled={!text.trim() || uploading}
          title="Send message"
        >
          <Send className="h-4 w-4 font-black" />
        </button>
      </div>

      {uploading && <div className="text-[11px] font-bold text-[#0A1237] dark:text-[#C3D946] px-12">Uploading attachment...</div>}
    </div>
  );
}
