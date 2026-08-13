"use client";

import { useState, useEffect } from "react";
import { useChatStore } from "./useChatStore";
import { MessageList } from "./MessageList";
import { MessageComposer } from "./MessageComposer";
import { Users, Hash, Plus, Search, MessageSquarePlus, Check } from "lucide-react";
import { ChannelProvider } from "ably/react";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface MemberUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role?: string;
}

export function ChatLayout({ currentUserId }: { currentUserId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [conversations, setConversations] = useState<any[]>([]);
  const [users, setUsers] = useState<MemberUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDmModalOpen, setIsDmModalOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [startingDm, setStartingDm] = useState<string | null>(null);

  const { activeConversationId, setActiveConversation } = useChatStore();

  useEffect(() => {
    fetchConversations();
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchConversations() {
    try {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      if (Array.isArray(data)) {
        setConversations(data);
        if (data.length > 0 && !activeConversationId) {
          setActiveConversation(data[0].id);
        }
      }
    } catch (e) {
      console.error("Error fetching conversations:", e);
    }
  }

  async function fetchUsers() {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data.filter((u: MemberUser) => u.id !== currentUserId));
      }
    } catch (e) {
      console.error("Error fetching users:", e);
    }
  }

  async function startDirectMessage(targetUserId: string) {
    setStartingDm(targetUserId);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "DIRECT",
          memberIds: [targetUserId],
        }),
      });

      if (res.ok) {
        const conv = await res.json();
        setConversations((prev) => {
          if (prev.some((c) => c.id === conv.id)) return prev;
          return [conv, ...prev];
        });
        setActiveConversation(conv.id);
        setIsDmModalOpen(false);
      }
    } catch (e) {
      console.error("Error starting DM:", e);
    } finally {
      setStartingDm(null);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getConversationName(conv: any) {
    if (!conv) return "Conversation";
    if (conv.name) return conv.name;
    if (conv.project?.name) return conv.project.name;
    if (conv.type === "DIRECT" && Array.isArray(conv.members)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const otherMember = conv.members.find((m: any) => m.userId !== currentUserId && m.user?.id !== currentUserId);
      if (otherMember?.user?.name) return otherMember.user.name;
    }
    return "Direct Message";
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getConversationAvatar(conv: any) {
    if (conv.type === "DIRECT" && Array.isArray(conv.members)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const other = conv.members.find((m: any) => m.userId !== currentUserId && m.user?.id !== currentUserId);
      return { name: other?.user?.name || "User", avatar: other?.user?.avatar };
    }
    return null;
  }

  const activeConversation = Array.isArray(conversations) ? conversations.find(c => c?.id === activeConversationId) : null;

  const projectChannels = conversations.filter((c) => c.type === "PROJECT" && getConversationName(c).toLowerCase().includes(searchQuery.toLowerCase()));
  const directMessages = conversations.filter((c) => c.type === "DIRECT" && getConversationName(c).toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredMembers = users.filter((u) => u.name.toLowerCase().includes(memberSearch.toLowerCase()) || u.email.toLowerCase().includes(memberSearch.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-var(--header-height))] overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-surface flex flex-col flex-shrink-0 card-shadow z-10">
        {/* Header */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[#0A1237] dark:text-white tracking-tight">Chat & DMs</h2>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<MessageSquarePlus className="h-3.5 w-3.5" />}
              onClick={() => setIsDmModalOpen(true)}
              className="text-xs shadow-xs"
            >
              New DM
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
            <input
              type="search"
              placeholder="Filter chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs rounded-xl border border-border bg-surface-alt/60 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Channels & DMs List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {/* Project Channels */}
          <div>
            <div className="px-3 mb-1.5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-text-muted">
              <span>Project Channels</span>
              <span className="text-[10px] font-bold bg-surface-alt border border-border px-1.5 py-0.5 rounded">{projectChannels.length}</span>
            </div>
            <div className="space-y-1">
              {projectChannels.map((conv) => {
                const title = getConversationName(conv);
                const isActive = activeConversationId === conv.id;
                const lastMsg = conv.messages?.[0];
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv.id)}
                    className={cn(
                      "w-full text-left flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer relative",
                      isActive
                        ? "bg-[#0A1237] text-[#C3D946] font-extrabold shadow-sm"
                        : "hover:bg-surface-alt text-text-secondary hover:text-text-primary"
                    )}
                  >
                    {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#C3D946] rounded-r-full glow-lime" />}
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border", isActive ? "bg-[#142054] border-[#C3D946]/40 text-[#C3D946]" : "bg-surface-alt border-border text-text-muted")}>
                      <Hash className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-bold leading-tight">{title}</p>
                      {lastMsg && (
                        <p className={cn("text-[10px] truncate mt-0.5", isActive ? "text-[#828EA8]" : "text-text-muted")}>
                          {lastMsg.sender?.name}: {lastMsg.content || "Attachment"}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Messages */}
          <div>
            <div className="px-3 mb-1.5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-text-muted">
              <span>Direct Messages</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-text-muted hover:text-text-primary"
                onClick={() => setIsDmModalOpen(true)}
                title="Start new DM"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-1">
              {directMessages.map((conv) => {
                const title = getConversationName(conv);
                const avatar = getConversationAvatar(conv);
                const isActive = activeConversationId === conv.id;
                const lastMsg = conv.messages?.[0];
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv.id)}
                    className={cn(
                      "w-full text-left flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer relative",
                      isActive
                        ? "bg-[#0A1237] text-[#C3D946] font-extrabold shadow-sm"
                        : "hover:bg-surface-alt text-text-secondary hover:text-text-primary"
                    )}
                  >
                    {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#C3D946] rounded-r-full glow-lime" />}
                    <div className="relative flex-shrink-0">
                      <Avatar name={avatar?.name || title} src={avatar?.avatar} size="sm" className="ring-1 ring-border" />
                      <span className="absolute bottom-0 right-0 h-2 w-2 bg-emerald-500 rounded-full ring-2 ring-surface" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-bold leading-tight">{title}</p>
                      {lastMsg ? (
                        <p className={cn("text-[10px] truncate mt-0.5", isActive ? "text-[#828EA8]" : "text-text-muted")}>
                          {lastMsg.content || "Attachment"}
                        </p>
                      ) : (
                        <p className="text-[10px] text-text-muted italic mt-0.5">Start chatting</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-background">
        {activeConversation ? (
          <ChannelProvider channelName={`conversation:${activeConversation.id}`}>
            {/* Active Header */}
            <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-surface z-10 shadow-xs">
              <div className="flex items-center gap-3">
                {activeConversation.type === "DIRECT" ? (
                  <div className="relative">
                    <Avatar
                      name={getConversationName(activeConversation)}
                      src={getConversationAvatar(activeConversation)?.avatar}
                      size="sm"
                    />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 rounded-full ring-2 ring-surface" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-[#0A1237] text-[#C3D946] flex items-center justify-center font-bold">
                    <Hash className="h-4 w-4" />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-extrabold text-[#0A1237] dark:text-white tracking-tight">
                    {getConversationName(activeConversation)}
                  </h3>
                  <p className="text-[10px] font-semibold text-text-muted">
                    {activeConversation.type === "DIRECT" ? "Direct Message" : "Project Channel"}
                  </p>
                </div>
              </div>
            </div>

            <MessageList conversationId={activeConversation.id} currentUserId={currentUserId} />
            <MessageComposer conversationId={activeConversation.id} currentUserId={currentUserId} />
          </ChannelProvider>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-8 text-center">
            <div className="h-16 w-16 bg-surface-alt border border-border rounded-full flex items-center justify-center mb-3 text-text-muted">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-[#0A1237] dark:text-white mb-1">Your Messages</h3>
            <p className="text-xs text-text-muted max-w-sm">Select a project channel or start a Direct Message with a team member.</p>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<MessageSquarePlus className="h-4 w-4" />}
              onClick={() => setIsDmModalOpen(true)}
              className="mt-4"
            >
              Start New DM
            </Button>
          </div>
        )}
      </div>

      {/* Member Picker Modal for New DM */}
      <Modal
        isOpen={isDmModalOpen}
        onClose={() => setIsDmModalOpen(false)}
        title="Start a Direct Message"
        description="Select a workspace member to begin a 1-on-1 private conversation."
        size="md"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="search"
              placeholder="Search member by name or email..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
            {filteredMembers.length === 0 ? (
              <p className="text-center text-xs text-text-muted py-6">No members found.</p>
            ) : (
              filteredMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => startDirectMessage(member.id)}
                  disabled={startingDm === member.id}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-alt transition-colors group cursor-pointer border border-transparent hover:border-border-subtle"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={member.name} src={member.avatar} size="sm" />
                    <div className="text-left min-w-0">
                      <p className="text-xs font-extrabold text-[#0A1237] dark:text-white truncate group-hover:text-primary transition-colors">
                        {member.name}
                      </p>
                      <p className="text-[10px] text-text-muted truncate">{member.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={startingDm === member.id}
                    className="text-[11px] px-2.5 h-7"
                  >
                    Chat
                  </Button>
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
