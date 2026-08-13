"use client";

import { useState } from "react";
import { format } from "date-fns";
import { MessageCircle, CheckCheck, Trash2, FileText, Smile } from "lucide-react";
import { useChatStore } from "./useChatStore";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MessageItem({ message, isOwn }: { message: any; isOwn: boolean }) {
  const { setReplyingTo } = useChatStore();
  const [isDeleted, setIsDeleted] = useState(!!message.deletedAt);
  const [content] = useState(message.content);
  const [reactions, setReactions] = useState<{ [emoji: string]: number }>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/messages/${message.id}`, { method: "DELETE" });
      if (res.ok) {
        setIsDeleted(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleReaction = (emoji: string) => {
    setReactions((prev) => {
      const count = prev[emoji] || 0;
      if (count > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [emoji]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [emoji]: 1 };
    });
    setShowEmojiPicker(false);
  };

  if (isDeleted) {
    return (
      <div className={cn("flex flex-col mb-4", isOwn ? "items-end" : "items-start")}>
        <div className="px-4 py-2 rounded-2xl bg-[#F2F4EA] text-[#8A918A] italic text-xs border border-[#E4E8DD] shadow-xs">
          This message was deleted
        </div>
      </div>
    );
  }

  const quickEmojis = ["👍", "❤️", "🔥", "🎉", "😂"];

  return (
    <div className={cn("flex flex-col mb-4 group relative", isOwn ? "items-end" : "items-start")}>
      {!isOwn && (
        <div className="flex items-center gap-1.5 ml-1 mb-1">
          <Avatar name={message.sender?.name || "Member"} src={message.sender?.avatar} size="xs" />
          <span className="text-[11px] font-bold text-[#172018]">{message.sender?.name}</span>
        </div>
      )}

      <div className={cn("relative flex items-center gap-2 max-w-[85%] md:max-w-[75%]", isOwn ? "flex-row-reverse" : "flex-row")}>
        <div
          className={cn(
            "flex flex-col px-4 py-2.5 rounded-2xl shadow-xs border transition-all",
            isOwn
              ? "bg-[#172018] text-white rounded-br-xs border-transparent"
              : "bg-surface text-[#172018] rounded-bl-xs border-[#E4E8DD]"
          )}
        >
          {/* Reply Context Bar */}
          {message.replyTo && (
            <div className={cn("p-2 rounded-xl mb-2 text-xs border-l-2", isOwn ? "bg-white/10 border-[#C3D946]" : "bg-[#F2F4EA] border-[#172018]")}>
              <p className="font-bold">{message.replyTo.sender?.name}</p>
              <p className="opacity-80 truncate">{message.replyTo.content || "Attachment"}</p>
            </div>
          )}

          {/* Text Content */}
          {content && <p className="whitespace-pre-wrap leading-relaxed text-xs font-medium">{content}</p>}

          {/* Attachments */}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {message.attachments?.map((att: any) => (
            <div key={att.id} className="mt-2">
              {att.mimeType?.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={att.url}
                  alt={att.filename}
                  className="rounded-xl max-w-full h-auto object-cover max-h-64 border border-border shadow-xs"
                  loading="lazy"
                />
              ) : (
                <a
                  href={att.url}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "flex items-center gap-2.5 p-2.5 rounded-xl transition-colors border",
                    isOwn ? "bg-white/10 hover:bg-white/20 border-white/10" : "bg-[#F2F4EA] hover:bg-[#F2F4EA]/80 border-[#E4E8DD]"
                  )}
                >
                  <FileText className={cn("h-5 w-5", isOwn ? "text-[#C3D946]" : "text-[#172018]")} />
                  <div className="flex flex-col text-xs truncate max-w-[160px]">
                    <span className="font-bold truncate">{att.filename}</span>
                    <span className="opacity-70 text-[10px]">{(att.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </a>
              )}
            </div>
          ))}

          {/* Emoji Reactions display */}
          {Object.keys(reactions).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 pt-1 border-t border-border-subtle/40">
              {Object.entries(reactions).map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={() => handleToggleReaction(emoji)}
                  className="px-2 py-0.5 rounded-full bg-[#F2F4EA] border border-border text-[11px] font-bold flex items-center gap-1 hover:scale-105 transition-transform"
                >
                  <span>{emoji}</span>
                  <span className="text-[10px] text-[#8A918A]">{count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Timestamp & WhatsApp Double Checkmark */}
          <div className={cn("flex items-center justify-end gap-1 mt-1 text-[10px] font-bold", isOwn ? "text-[#C3D946]" : "text-[#8A918A]")}>
            <span>{format(new Date(message.createdAt || Date.now()), "h:mm a")}</span>
            {message.editedAt && <span className="italic">Edited</span>}
            {isOwn && (
              <span title="Delivered & Read">
                <CheckCheck className="h-3.5 w-3.5 text-[#C3D946]" />
              </span>
            )}
          </div>
        </div>

        {/* Hover Action Bar */}
        <div
          className={cn(
            "opacity-0 group-hover:opacity-100 flex items-center gap-0.5 bg-surface border border-border rounded-xl shadow-md px-1.5 py-1 transition-all z-10",
            isOwn ? "flex-row-reverse" : "flex-row"
          )}
        >
          {/* Quick Reaction Emojis */}
          {quickEmojis.slice(0, 3).map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleToggleReaction(emoji)}
              className="p-1 hover:bg-[#F2F4EA] rounded-lg text-xs transition-transform active:scale-125 cursor-pointer"
            >
              {emoji}
            </button>
          ))}

          <button
            onClick={() => setShowEmojiPicker((o) => !o)}
            className="p-1 text-[#8A918A] hover:text-[#172018] rounded-lg hover:bg-[#F2F4EA] transition-colors cursor-pointer"
            title="Add reaction"
          >
            <Smile className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => setReplyingTo(message)}
            className="p-1 text-[#8A918A] hover:text-[#172018] rounded-lg hover:bg-[#F2F4EA] transition-colors cursor-pointer"
            title="Reply in thread"
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </button>

          {isOwn && (
            <button
              onClick={handleDelete}
              className="p-1 text-[#8A918A] hover:text-[#D64545] rounded-lg hover:bg-[#FCEBEB] transition-colors cursor-pointer"
              title="Delete message"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Quick Emoji Picker Drawer */}
          {showEmojiPicker && (
            <div className="absolute top-full mt-1 bg-surface border border-border rounded-xl p-2 shadow-xl flex gap-1.5 z-30">
              {quickEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleToggleReaction(emoji)}
                  className="p-1.5 hover:bg-[#F2F4EA] rounded-lg text-sm hover:scale-125 transition-transform cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
