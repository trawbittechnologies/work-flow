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
  Info, 
  X,
  Bell,
  ChevronLeft,
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
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const { activeConversationId, setActiveConversation } = useChatStore();

  async function fetchConversations() {
    try {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      if (Array.isArray(data)) {
        setConversations(data);
        if (data.length > 0 && !activeConversationId && !urlConvId) {
          // On desktop auto-select first conversation, on mobile leave list open
          if (typeof window !== "undefined" && window.innerWidth >= 768) {
            setActiveConversation(data[0].id);
          }
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

  useEffect(() => {
    fetchConversations();
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (urlConvId) {
      setActiveConversation(urlConvId);
      setMobileShowChat(true);
    }
  }, [urlConvId, setActiveConversation]);

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    setMobileShowChat(true);
  };

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
        setMobileShowChat(true);
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
    <div className="flex h-[calc(100vh-var(--header-height)-4.5rem)] md:h-[calc(100vh-var(--header-height)-1.5rem)] overflow-hidden bg-white border border-[#EAEDF2] rounded-2xl shadow-xs">
      {/* Sidebar List (Full-width on mobile if no active chat selected or when toggled) */}
      <div
        className={cn(
          "w-full md:w-80 border-r border-[#EAEDF2] bg-white flex flex-col shrink-0 z-10 transition-all",
          mobileShowChat ? "hidden md:flex" : "flex"
        )}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-[#EAEDF2] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-black text-[#111827] tracking-tight">Chat & DMs</h2>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<MessageSquarePlus className="h-3.5 w-3.5" />}
              onClick={() => setIsDmModalOpen(true)}
              className="text-xs shadow-xs h-8"
            >
              New DM
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]" />
            <input
              type="search"
              placeholder="Filter chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs rounded-xl border border-[#EAEDF2] bg-[#F9FAFB] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#88C315]/30 focus:border-[#88C315]"
            />
          </div>
        </div>

        {/* Channels & DMs List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {/* Project Channels */}
          <div>
            <div className="px-3 mb-1.5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">
              <span>Project Channels</span>
              <span className="text-[10px] font-bold bg-[#F3F4F6] border border-[#E5E7EB] px-1.5 py-0.5 rounded">{projectChannels.length}</span>
            </div>
            <div className="space-y-1">
              {projectChannels.length === 0 ? (
                <p className="px-3 py-2 text-xs text-[#9CA3AF] italic">No project channels</p>
              ) : (
                projectChannels.map((conv) => {
                  const title = getConversationName(conv);
                  const isActive = activeConversationId === conv.id;
                  const lastMsg = conv.messages?.[0];
                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={cn(
                        "w-full text-left flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer relative border border-transparent",
                        isActive
                          ? "bg-[#F3F9DE] text-[#111827] font-bold border-[#88C315]/20 shadow-2xs"
                          : "hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#111827]"
                      )}
                    >
                      {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#88C315] rounded-r-full" />}
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border", isActive ? "bg-white border-[#88C315] text-[#111827]" : "bg-[#F3F4F6] border-[#E5E7EB] text-[#9CA3AF]")}>
                        <Hash className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-bold leading-tight">{title}</p>
                        {lastMsg && (
                          <p className="text-[10px] truncate mt-0.5 text-[#9CA3AF]">
                            {lastMsg.sender?.name}: {lastMsg.content || "Attachment"}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Direct Messages */}
          <div>
            <div className="px-3 mb-1.5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">
              <span>Direct Messages</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-[#9CA3AF] hover:text-[#111827] cursor-pointer"
                onClick={() => setIsDmModalOpen(true)}
                title="Start new DM"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-1">
              {directMessages.length === 0 ? (
                <p className="px-3 py-2 text-xs text-[#9CA3AF] italic">No direct messages yet</p>
              ) : (
                directMessages.map((conv) => {
                  const title = getConversationName(conv);
                  const avatar = getConversationAvatar(conv);
                  const isActive = activeConversationId === conv.id;
                  const lastMsg = conv.messages?.[0];
                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={cn(
                        "w-full text-left flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer relative border border-transparent",
                        isActive
                          ? "bg-[#F3F9DE] text-[#111827] font-bold border-[#88C315]/20 shadow-2xs"
                          : "hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#111827]"
                      )}
                    >
                      {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#88C315] rounded-r-full" />}
                      <div className="relative shrink-0">
                        <Avatar name={avatar?.name || title} src={avatar?.avatar} size="sm" className="ring-1 ring-border" />
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-bold leading-tight">{title}</p>
                        {lastMsg ? (
                          <p className="text-[10px] truncate mt-0.5 text-[#9CA3AF]">
                            {lastMsg.content || "Attachment"}
                          </p>
                        ) : (
                          <p className="text-[10px] text-[#9CA3AF] italic mt-0.5">Start chatting</p>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area (Full width on mobile when conversation selected) */}
      <div
        className={cn(
          "flex-1 flex flex-col relative bg-[#F9FAFB] min-w-0",
          !mobileShowChat ? "hidden md:flex" : "flex"
        )}
      >
        {activeConversation ? (
          <ChannelProvider channelName={`conversation:${activeConversation.id}`}>
            {/* Active Header Action Bar */}
            <div className="h-14 border-b border-[#EAEDF2] flex items-center justify-between px-3 sm:px-6 bg-white z-10 shadow-2xs">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {/* Mobile Back to Conversation List Button */}
                <button
                  onClick={() => setMobileShowChat(false)}
                  className="md:hidden h-8 w-8 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] flex items-center justify-center shrink-0 cursor-pointer"
                  title="Back to conversations"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {activeConversation.type === "DIRECT" ? (
                  <div className="relative shrink-0">
                    <Avatar
                      name={getConversationName(activeConversation)}
                      src={getConversationAvatar(activeConversation)?.avatar}
                      size="sm"
                    />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-[#F3F9DE] text-[#88C315] border border-[#88C315]/20 flex items-center justify-center font-bold shrink-0">
                    <Hash className="h-4 w-4" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#111827] tracking-tight truncate">
                    {getConversationName(activeConversation)}
                  </h3>
                  <p className="text-[10px] font-semibold text-[#9CA3AF] flex items-center gap-1.5 truncate">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>{activeConversation.type === "DIRECT" ? "Active Now" : `${activeConversation.members?.length || 2} members`}</span>
                  </p>
                </div>
              </div>

              {/* Info Action Toolbar */}
              <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 transition-colors cursor-pointer",
                    showRightDrawer ? "bg-[#F3F9DE] text-[#88C315]" : "text-[#9CA3AF] hover:text-[#111827]"
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
                <div className="w-72 border-l border-[#EAEDF2] bg-white p-4 flex flex-col gap-5 overflow-y-auto hidden lg:flex shrink-0 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#EAEDF2] pb-3">
                    <h4 className="text-xs font-black text-[#111827] uppercase tracking-wider">Details</h4>
                    <button onClick={() => setShowRightDrawer(false)} className="text-[#9CA3AF] hover:text-[#111827] p-1 cursor-pointer">
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
                    <h5 className="text-sm font-extrabold text-[#111827]">
                      {getConversationName(activeConversation)}
                    </h5>
                    <span className="text-[10px] font-bold text-[#6B7280] bg-[#F3F4F6] px-2.5 py-0.5 rounded-full border border-[#E5E7EB]">
                      {activeConversation.type === "DIRECT" ? "Direct Message" : "Project Channel"}
                    </span>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 pt-2 border-t border-[#EAEDF2]">
                    <button className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F9FAFB] text-xs font-bold text-[#4B5563] cursor-pointer">
                      <span className="flex items-center gap-2.5">
                        <Bell className="h-4 w-4 text-[#9CA3AF]" />
                        Mute Notifications
                      </span>
                      <span className="text-[10px] text-[#9CA3AF]">Off</span>
                    </button>
                  </div>

                  {/* Members list */}
                  <div className="space-y-2 pt-2 border-t border-[#EAEDF2]">
                    <h6 className="text-[10px] font-black uppercase text-[#9CA3AF] tracking-widest">
                      Members ({activeConversation.members?.length || 2})
                    </h6>
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {activeConversation.members?.map((m: any) => (
                        <div key={m.id || m.userId} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#F9FAFB]">
                          <Avatar name={m.user?.name || "Member"} src={m.user?.avatar} size="xs" />
                          <span className="text-xs font-bold text-[#111827] truncate">{m.user?.name || "Workspace Member"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ChannelProvider>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#9CA3AF] p-6 text-center">
            <div className="h-14 w-14 bg-[#F3F9DE] text-[#88C315] rounded-2xl flex items-center justify-center mb-3">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-[#111827] mb-1">Your Messages</h3>
            <p className="text-xs text-[#6B7280] max-w-sm">Select a project channel or start a Direct Message with a team member.</p>
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
            <input
              type="search"
              placeholder="Search member by name or email..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-[#E5E7EB] bg-white text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#88C315]/30"
            />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
            {filteredMembers.length === 0 ? (
              <p className="text-center text-xs text-[#9CA3AF] py-6">No members found.</p>
            ) : (
              filteredMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => startDirectMessage(member.id)}
                  disabled={startingDm === member.id}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F9FAFB] transition-colors group cursor-pointer border border-transparent hover:border-[#EAEDF2]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={member.name} src={member.avatar} size="sm" />
                    <div className="text-left min-w-0">
                      <p className="text-xs font-extrabold text-[#111827] truncate group-hover:text-[#88C315] transition-colors">
                        {member.name}
                      </p>
                      <p className="text-[10px] text-[#6B7280] truncate">{member.email}</p>
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
    <Suspense fallback={<div className="p-6 text-center text-xs text-[#9CA3AF]">Loading chat...</div>}>
      <ChatLayoutContent currentUserId={currentUserId} />
    </Suspense>
  );
}
