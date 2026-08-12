"use client";
import { useState, useRef, useEffect } from "react";
import { useChatStore } from "./useChatStore";
import { useChannel } from "ably/react";
import { Paperclip, Send, X } from "lucide-react";

export function MessageComposer({ conversationId, currentUserId }: { conversationId: string, currentUserId: string }) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const { replyingTo, setReplyingTo } = useChatStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { channel } = useChannel(`conversation:${conversationId}`, (message) => {
    // we use the channel to publish typing events here
  });

  // Debounce typing event
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
          type: "TEXT"
        })
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
        // Send file message immediately
        await fetch(`/api/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: "",
            type: file.type.startsWith("image/") ? "IMAGE" : "FILE",
            attachments: [{ url: data.url, filename: data.filename, size: data.size, mimeType: data.type }]
          })
        });
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col gap-2">
      {replyingTo && (
        <div className="flex items-center justify-between text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
          <span className="text-gray-600 dark:text-gray-300">Replying to {replyingTo.sender?.name}</span>
          <button onClick={() => setReplyingTo(null)} className="text-gray-500 hover:text-gray-700">
            <X size={16} />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          disabled={uploading}
        >
          <Paperclip size={20} />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileUpload} 
        />
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden flex items-center pr-2">
          <textarea
            className="w-full bg-transparent p-3 resize-none focus:outline-none text-gray-900 dark:text-white min-h-[44px] max-h-[120px]"
            placeholder="Message..."
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button 
          onClick={handleSend}
          className={`p-3 rounded-full flex items-center justify-center transition-colors ${
            text.trim() ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-400"
          }`}
          disabled={!text.trim() || uploading}
        >
          <Send size={18} />
        </button>
      </div>
      {uploading && <div className="text-xs text-indigo-600 px-12">Uploading...</div>}
    </div>
  );
}
