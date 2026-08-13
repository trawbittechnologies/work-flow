"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useChatStore } from "./useChatStore";
import { MessageList } from "./MessageList";
import { MessageComposer } from "./MessageComposer";
import { 
  Users, 
  Hash, 
  Plus, 
  Search, 
  MessageSquarePlus, 
  Phone, 
  Video, 
  Info, 
  X,
  FileText,
  Bell,
} from "lucide-react";
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

function ChatLayoutContent({ currentUserId }: { currentUserId: string }) {
  const searchParams = useSearchParams();
  const urlConvId = searchParams.get("conversationId");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [conversations, setConversations] = useState<any[]>([]);
  const [users, setUsers] = useState<MemberUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDmModalOpen, setIsDmModalOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [startingDm, setStartingDm] = useState<string | null>(null);
  const [showRightDrawer, setShowRightDrawer] = useState(false);

  const { activeConversationId, setActiveConversation } = useChatStore();

  useEffect(() => {
    fetchConversations();
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (urlConvId) {
      setActiveConversation(urlConvId);
    }
  }, [urlConvId, setActiveConversation]);

  async function fetchConversations() {
    try {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      if (Array.isArray(data)) {
        setConversations(data);
        if (data.length > 0 && !activeConversationId && !urlConvId) {
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
            <h2 className="text-base font-black text-[#172018] tracking-tight">Chat & DMs</h2>
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8A918A]" />
            <input
              type="search"
              placeholder="Filter chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs rounded-xl border border-border bg-[#F2F4EA]/60 text-[#172018] placeholder:text-[#8A918A] focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Channels & DMs List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {/* Project Channels */}
          <div>
            <div className="px-3 mb-1.5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#8A918A]">
              <span>Project Channels</span>
              <span className="text-[10px] font-bold bg-[#F2F4EA] border border-border px-1.5 py-0.5 rounded">{projectChannels.length}</span>
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
                      "w-full text-left flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer relative border border-transparent",
                      isActive
                        ? "bg-[#F2F4EA] text-[#172018] font-black border-[#E4E8DD] shadow-2xs"
                        : "hover:bg-[#F2F4EA] text-[#667066] hover:text-[#172018]"
                    )}
                  >
                    {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#C3D946] rounded-r-full glow-lime" />}
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border", isActive ? "bg-white border-[#C3D946] text-[#172018]" : "bg-[#F2F4EA] border-border text-[#8A918A]")}>
                      <Hash className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-bold leading-tight">{title}</p>
                      {lastMsg && (
                        <p className="text-[10px] truncate mt-0.5 text-[#8A918A]">
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
            <div className="px-3 mb-1.5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#8A918A]">
              <span>Direct Messages</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-[#8A918A] hover:text-[#172018] cursor-pointer"
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
                      "w-full text-left flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer relative border border-transparent",
                      isActive
                        ? "bg-[#F2F4EA] text-[#172018] font-black border-[#E4E8DD] shadow-2xs"
                        : "hover:bg-[#F2F4EA] text-[#667066] hover:text-[#172018]"
                    )}
                  >
                    {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#C3D946] rounded-r-full glow-lime" />}
                    <div className="relative flex-shrink-0">
                      <Avatar name={avatar?.name || title} src={avatar?.avatar} size="sm" className="ring-1 ring-border" />
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-[#22A06B] rounded-full ring-2 ring-surface" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-bold leading-tight">{title}</p>
                      {lastMsg ? (
                        <p className="text-[10px] truncate mt-0.5 text-[#8A918A]">
                          {lastMsg.content || "Attachment"}
                        </p>
                      ) : (
                        <p className="text-[10px] text-[#8A918A] italic mt-0.5">Start chatting</p>
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
      <div className="flex-1 flex flex-col relative bg-background min-w-0">
        {activeConversation ? (
          <ChannelProvider channelName={`conversation:${activeConversation.id}`}>
            {/* Active Header Action Bar */}
            <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-surface z-10 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                {activeConversation.type === "DIRECT" ? (
                  <div className="relative flex-shrink-0">
                    <Avatar
                      name={getConversationName(activeConversation)}
                      src={getConversationAvatar(activeConversation)?.avatar}
                      size="sm"
                    />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-[#22A06B] rounded-full ring-2 ring-surface" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-[#F2F4EA] text-[#172018] border border-border flex items-center justify-center font-bold flex-shrink-0">
                    <Hash className="h-4 w-4" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-[#172018] tracking-tight truncate">
                    {getConversationName(activeConversation)}
                  </h3>
                  <p className="text-[10px] font-semibold text-[#8A918A] flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#22A06B]" />
                    <span>{activeConversation.type === "DIRECT" ? "Active Now" : `${activeConversation.members?.length || 2} members`}</span>
                  </p>
                </div>
              </div>

              {/* Call & Info Action Toolbar */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#8A918A] hover:text-[#172018]"
                  title="Audio call"
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#8A918A] hover:text-[#172018]"
                  title="Video call"
                >
                  <Video className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 transition-colors cursor-pointer",
                    showRightDrawer ? "bg-[#F2F4EA] text-[#172018]" : "text-[#8A918A] hover:text-[#172018]"
                  )}
                  onClick={() => setShowRightDrawer((o) => !o)}
                  title="Conversation details"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex flex-col min-w-0">
                <MessageList conversationId={activeConversation.id} currentUserId={currentUserId} />
                <MessageComposer conversationId={activeConversation.id} currentUserId={currentUserId} />
              </div>

              {/* Right Details Panel */}
              {showRightDrawer && (
                <div className="w-72 border-l border-border bg-surface p-4 flex flex-col gap-5 overflow-y-auto hidden lg:flex flex-shrink-0 card-shadow">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h4 className="text-xs font-black text-[#172018] uppercase tracking-wider">Details</h4>
                    <button onClick={() => setShowRightDrawer(false)} className="text-[#8A918A] hover:text-[#172018] p-1 cursor-pointer">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Profile Header */}
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Avatar
                      name={getConversationName(activeConversation)}
                      src={getConversationAvatar(activeConversation)?.avatar}
                      size="lg"
                    />
                    <h5 className="text-sm font-extrabold text-[#172018]">
                      {getConversationName(activeConversation)}
                    </h5>
                    <span className="text-[10px] font-bold text-[#667066] bg-[#F2F4EA] px-2.5 py-0.5 rounded-full border border-border">
                      {activeConversation.type === "DIRECT" ? "Direct Message" : "Project Channel"}
                    </span>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <button className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F2F4EA] text-xs font-bold text-[#667066] cursor-pointer">
                      <span className="flex items-center gap-2.5">
                        <Bell className="h-4 w-4 text-[#8A918A]" />
                        Mute Notifications
                      </span>
                      <span className="text-[10px] text-[#8A918A]">Off</span>
                    </button>
                    <button className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F2F4EA] text-xs font-bold text-[#667066] cursor-pointer">
                      <span className="flex items-center gap-2.5">
                        <FileText className="h-4 w-4 text-[#8A918A]" />
                        Shared Files
                      </span>
                      <span className="text-[10px] font-bold bg-[#F2F4EA] border border-border px-1.5 py-0.5 rounded">
                        {activeConversation.messages?.filter((m: { attachments?: unknown[] }) => m.attachments?.length).length || 0}
                      </span>
                    </button>
                  </div>

                  {/* Members list */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <h6 className="text-[10px] font-black uppercase text-[#8A918A] tracking-widest">
                      Members ({activeConversation.members?.length || 2})
                    </h6>
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {activeConversation.members?.map((m: any) => (
                        <div key={m.id || m.userId} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#F2F4EA]">
                          <Avatar name={m.user?.name || "Member"} src={m.user?.avatar} size="xs" />
                          <span className="text-xs font-bold text-[#172018] truncate">{m.user?.name || "Workspace Member"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ChannelProvider>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#8A918A] p-8 text-center">
            <div className="h-16 w-16 bg-[#F2F4EA] border border-border rounded-full flex items-center justify-center mb-3 text-[#8A918A]">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-[#172018] mb-1">Your Messages</h3>
            <p className="text-xs text-[#8A918A] max-w-sm">Select a project channel or start a Direct Message with a team member.</p>
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A918A]" />
            <input
              type="search"
              placeholder="Search member by name or email..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-border bg-surface text-[#172018] placeholder:text-[#8A918A] focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
            {filteredMembers.length === 0 ? (
              <p className="text-center text-xs text-[#8A918A] py-6">No members found.</p>
            ) : (
              filteredMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => startDirectMessage(member.id)}
                  disabled={startingDm === member.id}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F2F4EA] transition-colors group cursor-pointer border border-transparent hover:border-border"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={member.name} src={member.avatar} size="sm" />
                    <div className="text-left min-w-0">
                      <p className="text-xs font-extrabold text-[#172018] truncate group-hover:text-primary transition-colors">
                        {member.name}
                      </p>
                      <p className="text-[10px] text-[#8A918A] truncate">{member.email}</p>
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

export function ChatLayout({ currentUserId }: { currentUserId: string }) {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs text-[#8A918A]">Loading chat...</div>}>
      <ChatLayoutContent currentUserId={currentUserId} />
    </Suspense>
  );
}
