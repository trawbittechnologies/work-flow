"use client";
import { format } from "date-fns";
import { MessageCircle, CheckCheck, Trash2 } from "lucide-react";
import { useChatStore } from "./useChatStore";
import { useState } from "react";
import { useChannel } from "ably/react";

export function MessageItem({ message, isOwn, currentUserId }: { message: any, isOwn: boolean, currentUserId: string }) {
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
        <div className="px-4 py-2 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 italic text-sm border border-gray-200 dark:border-gray-700 shadow-sm">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col mb-4 group ${isOwn ? "items-end" : "items-start"}`}>
      {!isOwn && (
        <span className="text-xs text-gray-500 ml-1 mb-1 font-medium">{message.sender?.name}</span>
      )}
      
      <div className={`relative flex items-center gap-2 max-w-[80%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
        <div className={`
          flex flex-col px-4 py-2 rounded-2xl shadow-sm
          ${isOwn 
            ? "bg-indigo-600 text-white rounded-br-sm" 
            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-100 dark:border-gray-700"
          }
        `}>
          {message.replyTo && (
             <div className="bg-black/10 dark:bg-white/10 p-2 rounded-lg mb-2 text-xs border-l-2 border-indigo-400">
                <p className="font-semibold">{message.replyTo.sender?.name}</p>
                <p className="opacity-80 truncate">{message.replyTo.content || "Attachment"}</p>
             </div>
          )}
          
          {content && <p className="whitespace-pre-wrap leading-relaxed text-sm">{content}</p>}
          
          {message.attachments?.map((att: any) => (
             <div key={att.id} className="mt-2">
               {att.mimeType?.startsWith("image/") ? (
                 <img src={att.url} alt={att.filename} className="rounded-lg max-w-full h-auto object-cover max-h-64 border border-black/10" loading="lazy" />
               ) : (
                 <a href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-black/10 dark:bg-white/10 p-3 rounded-lg hover:bg-black/20 transition-colors">
                   <div className="bg-white/20 p-2 rounded-md">📄</div>
                   <div className="flex flex-col text-sm truncate max-w-[150px]">
                     <span className="font-medium truncate">{att.filename}</span>
                     <span className="opacity-80 text-xs">{(att.size / 1024 / 1024).toFixed(2)} MB</span>
                   </div>
                 </a>
               )}
             </div>
          ))}
          
          <div className="flex items-center justify-end gap-1 mt-1 opacity-70">
            <span className="text-[10px]">{format(new Date(message.createdAt), "h:mm a")}</span>
            {message.editedAt && <span className="text-[10px] italic">Edited</span>}
            {isOwn && <CheckCheck size={12} />}
          </div>
        </div>

        <div className={`opacity-0 group-hover:opacity-100 flex items-center transition-opacity ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <button onClick={() => setReplyingTo(message)} className="p-1.5 text-gray-400 hover:text-indigo-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <MessageCircle size={16} />
          </button>
          {isOwn && (
             <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
               <Trash2 size={16} />
             </button>
          )}
        </div>
      </div>
    </div>
  );
}
