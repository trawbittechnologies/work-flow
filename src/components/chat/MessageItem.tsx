"use client";
import { format } from "date-fns";
import { MessageCircle, CheckCheck, Trash2, FileText } from "lucide-react";
import { useChatStore } from "./useChatStore";
import { useState } from "react";
import { useChannel } from "ably/react";
import { Avatar } from "@/components/ui/Avatar";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MessageItem({ message, isOwn }: { message: any, isOwn: boolean }) {
  const { setReplyingTo } = useChatStore();
  const [isDeleted, setIsDeleted] = useState(!!message.deletedAt);
  const [content, setContent] = useState(message.content);

  useChannel(`conversation:${message.conversationId}`, (msg) => {
    if (msg.name === "message.deleted" && msg.data.id === message.id) {
      setIsDeleted(true);
      setContent("");
    }
    if (msg.name === "message.updated" && msg.data.id === message.id) {
      setContent(msg.data.content);
    }
  });

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

  if (isDeleted) {
    return (
      <div className={`flex flex-col mb-4 ${isOwn ? "items-end" : "items-start"}`}>
        <div className="px-4 py-2 rounded-2xl bg-surface-alt text-text-muted italic text-xs border border-border shadow-xs">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col mb-4 group ${isOwn ? "items-end" : "items-start"}`}>
      {!isOwn && (
        <div className="flex items-center gap-1.5 ml-1 mb-1">
          <Avatar name={message.sender?.name || "Member"} src={message.sender?.avatar} size="xs" />
          <span className="text-[11px] font-bold text-[#0A1237] dark:text-white">{message.sender?.name}</span>
        </div>
      )}
      
      <div className={`relative flex items-center gap-2 max-w-[80%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
        <div className={`
          flex flex-col px-4 py-2.5 rounded-2xl shadow-xs border transition-colors
          ${isOwn 
            ? "bg-[#0A1237] text-white rounded-br-xs border-transparent" 
            : "bg-surface text-[#0A1237] dark:text-white rounded-bl-xs border-border"
          }
        `}>
          {message.replyTo && (
            <div className={`p-2 rounded-xl mb-2 text-xs border-l-2 ${isOwn ? "bg-white/10 border-[#C3D946]" : "bg-surface-alt border-[#0A1237]"}`}>
              <p className="font-bold">{message.replyTo.sender?.name}</p>
              <p className="opacity-80 truncate">{message.replyTo.content || "Attachment"}</p>
            </div>
          )}
          
          {content && <p className="whitespace-pre-wrap leading-relaxed text-xs font-medium">{content}</p>}
          
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {message.attachments?.map((att: any) => (
            <div key={att.id} className="mt-2">
              {att.mimeType?.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={att.url} alt={att.filename} className="rounded-xl max-w-full h-auto object-cover max-h-64 border border-border" loading="lazy" />
              ) : (
                <a href={att.url} target="_blank" rel="noreferrer" className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-colors border ${isOwn ? "bg-white/10 hover:bg-white/20 border-white/10" : "bg-surface-alt hover:bg-surface-alt/80 border-border"}`}>
                  <FileText className={`h-5 w-5 ${isOwn ? "text-[#C3D946]" : "text-[#0A1237]"}`} />
                  <div className="flex flex-col text-xs truncate max-w-[160px]">
                    <span className="font-bold truncate">{att.filename}</span>
                    <span className="opacity-70 text-[10px]">{(att.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </a>
              )}
            </div>
          ))}
          
          <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] font-bold ${isOwn ? "text-[#C3D946]" : "text-text-muted"}`}>
            <span>{format(new Date(message.createdAt), "h:mm a")}</span>
            {message.editedAt && <span className="italic">Edited</span>}
            {isOwn && <CheckCheck className="h-3 w-3 text-[#C3D946]" />}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`opacity-0 group-hover:opacity-100 flex items-center transition-opacity ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <button onClick={() => setReplyingTo(message)} className="p-1.5 text-text-muted hover:text-[#0A1237] dark:hover:text-[#C3D946] rounded-full hover:bg-surface-alt transition-colors" title="Reply">
            <MessageCircle className="h-4 w-4" />
          </button>
          {isOwn && (
            <button onClick={handleDelete} className="p-1.5 text-text-muted hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors" title="Delete message">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
