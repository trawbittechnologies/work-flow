"use client";
import { useState, useEffect } from "react";
import { useChatStore } from "./useChatStore";
import { MessageList } from "./MessageList";
import { MessageComposer } from "./MessageComposer";
import { AblyProvider } from "./AblyProvider";
import { Users, Hash } from "lucide-react";

export function ChatLayout({ currentUserId }: { currentUserId: string }) {
  const [conversations, setConversations] = useState<any[]>([]);
  const { activeConversationId, setActiveConversation } = useChatStore();

  useEffect(() => {
    fetch("/api/conversations")
      .then(r => r.json())
      .then(data => {
        setConversations(data);
        if (data.length > 0 && !activeConversationId) {
          setActiveConversation(data[0].id);
        }
      })
      .catch(e => console.error(e));
  }, []);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <AblyProvider>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv.id)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  activeConversationId === conv.id ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-medium" : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                  {conv.type === "PROJECT" ? <Hash size={18} /> : <Users size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{conv.name || (conv.project?.name || "Direct Message")}</p>
                  {conv.messages?.[0] && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {conv.messages[0].sender?.name}: {conv.messages[0].content || "Attachment"}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative bg-gray-50 dark:bg-gray-900">
          {activeConversation ? (
            <>
              <div className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center px-6 bg-white dark:bg-gray-950 z-10 shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {activeConversation.name || (activeConversation.project?.name || "Direct Message")}
                </h3>
              </div>
              <MessageList conversationId={activeConversation.id} currentUserId={currentUserId} />
              <MessageComposer conversationId={activeConversation.id} currentUserId={currentUserId} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </AblyProvider>
  );
}
