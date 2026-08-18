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
    <div className="-m-3.5 sm:-m-6 lg:-m-8 flex h-[calc(100vh-var(--header-height)-1px)] overflow-hidden bg-white border-t border-[#DDE2D8]">
      {/* Sidebar List (Full-width on mobile if no active chat selected or when toggled) */}
      <div
        className={cn(
          "w-full md:w-80 border-r border-[#DDE2D8] bg-white flex flex-col shrink-0 z-10 transition-all",
          mobileShowChat ? "hidden md:flex" : "flex"
        )}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-[#DDE2D8] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-black font-display uppercase text-[#071A49] tracking-tight">Chat & DMs</h2>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<MessageSquarePlus className="h-3.5 w-3.5" />}
              onClick={() => setIsDmModalOpen(true)}
              className="text-xs shadow-xs h-8 font-mono font-bold uppercase rounded-[2px]"
            >
              New DM
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8E99A8]" />
            <input
              type="search"
              placeholder="Filter chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs rounded-[2px] border border-[#DDE2D8] bg-[#F8F9F6] text-[#071A49] placeholder:text-[#8E99A8] focus:outline-none focus:ring-1 focus:ring-[#071A49]"
            />
          </div>
        </div>

        {/* Channels & DMs List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {/* Project Channels */}
          <div>
            <div className="px-3 mb-1.5 flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-widest text-[#586274]">
              <span>Project Channels</span>
              <span className="text-[10px] font-mono font-bold bg-[#F0F2EC] border border-[#DDE2D8] text-[#071A49] px-1.5 py-0.5 rounded-[2px]">{projectChannels.length}</span>
            </div>
            <div className="space-y-1">
              {projectChannels.length === 0 ? (
                <p className="px-3 py-2 text-xs text-[#8E99A8] italic font-mono">No project channels</p>
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
                        "w-full text-left flex items-center gap-3 p-2.5 rounded-[2px] transition-all cursor-pointer relative border",
                        isActive
                          ? "bg-[#F1F8CE] text-[#071A49] font-bold border-[#B7D600] shadow-2xs"
                          : "border-transparent hover:bg-[#F8F9F6] text-[#586274] hover:text-[#071A49]"
                      )}
                    >
                      {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#071A49] rounded-r-[2px]" />}
                      <div className={cn("w-8 h-8 rounded-[2px] flex items-center justify-center shrink-0 border", isActive ? "bg-white border-[#B7D600] text-[#071A49]" : "bg-[#F0F2EC] border-[#DDE2D8] text-[#8E99A8]")}>
                        <Hash className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-bold leading-tight text-[#071A49]">{title}</p>
                        {lastMsg && (
                          <p className="text-[10px] font-mono truncate mt-0.5 text-[#8E99A8]">
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
            <div className="px-3 mb-1.5 flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-widest text-[#586274]">
              <span>Direct Messages</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-[#8E99A8] hover:text-[#071A49] cursor-pointer rounded-[2px]"
                onClick={() => setIsDmModalOpen(true)}
                title="Start new DM"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-1">
              {directMessages.length === 0 ? (
                <p className="px-3 py-2 text-xs text-[#8E99A8] italic font-mono">No direct messages yet</p>
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
                        "w-full text-left flex items-center gap-3 p-2.5 rounded-[2px] transition-all cursor-pointer relative border",
                        isActive
                          ? "bg-[#F1F8CE] text-[#071A49] font-bold border-[#B7D600] shadow-2xs"
                          : "border-transparent hover:bg-[#F8F9F6] text-[#586274] hover:text-[#071A49]"
                      )}
                    >
                      {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#071A49] rounded-r-[2px]" />}
                      <div className="relative shrink-0">
                        <Avatar name={avatar?.name || title} src={avatar?.avatar} size="sm" className="ring-1 ring-[#DDE2D8] rounded-[2px]" />
                        <span className="absolute bottom-0 right-0 h-2 w-2 bg-emerald-600 rounded-[2px] ring-1 ring-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-bold leading-tight text-[#071A49]">{title}</p>
                        {lastMsg ? (
                          <p className="text-[10px] font-mono truncate mt-0.5 text-[#8E99A8]">
                            {lastMsg.content || "Attachment"}
                          </p>
                        ) : (
                          <p className="text-[10px] font-mono text-[#8E99A8] italic mt-0.5">Start chatting</p>
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
          "flex-1 flex flex-col relative bg-[#F8F9F6] bg-tech-grid min-w-0",
          !mobileShowChat ? "hidden md:flex" : "flex"
        )}
      >
        {activeConversation ? (
          <ChannelProvider channelName={`conversation:${activeConversation.id}`}>
            {/* Active Header Action Bar */}
            <div className="h-14 border-b border-[#DDE2D8] flex items-center justify-between px-3 sm:px-6 bg-white z-10 shadow-2xs">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {/* Mobile Back to Conversation List Button */}
                <button
                  onClick={() => setMobileShowChat(false)}
                  className="md:hidden h-8 w-8 rounded-[2px] text-[#586274] hover:text-[#071A49] hover:bg-[#F0F2EC] flex items-center justify-center shrink-0 cursor-pointer"
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
                      className="rounded-[2px] ring-1 ring-[#DDE2D8]"
                    />
                    <span className="absolute bottom-0 right-0 h-2 w-2 bg-emerald-600 rounded-[2px] ring-1 ring-white" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-[2px] bg-[#071A49] text-[#B7D600] border border-[#071A49] flex items-center justify-center font-bold shrink-0">
                    <Hash className="h-4 w-4" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-[#071A49] tracking-tight truncate font-display uppercase">
                    {getConversationName(activeConversation)}
                  </h3>
                  <p className="text-[10px] font-mono text-[#8E99A8] flex items-center gap-1.5 truncate">
                    <span className="h-1.5 w-1.5 rounded-[2px] bg-emerald-600 shrink-0" />
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
                    "h-8 w-8 transition-colors cursor-pointer rounded-[2px]",
                    showRightDrawer ? "bg-[#F1F8CE] text-[#071A49]" : "text-[#8E99A8] hover:text-[#071A49]"
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
                <div className="w-72 border-l border-[#DDE2D8] bg-white p-4 flex flex-col gap-5 overflow-y-auto hidden lg:flex shrink-0 shadow-xs">
                  <div className="flex items-center justify-between border-b border-[#DDE2D8] pb-3">
                    <h4 className="text-xs font-mono font-bold text-[#071A49] uppercase tracking-wider">Details</h4>
                    <button onClick={() => setShowRightDrawer(false)} className="text-[#8E99A8] hover:text-[#071A49] p-1 cursor-pointer">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Profile Header */}
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Avatar
                      name={getConversationName(activeConversation)}
                      src={getConversationAvatar(activeConversation)?.avatar}
                      size="lg"
                      className="rounded-[2px] ring-1 ring-[#DDE2D8]"
                    />
                    <h5 className="text-sm font-bold text-[#071A49]">
                      {getConversationName(activeConversation)}
                    </h5>
                    <span className="text-[10px] font-mono font-bold text-[#586274] bg-[#F0F2EC] px-2.5 py-0.5 rounded-[2px] border border-[#DDE2D8] uppercase">
                      {activeConversation.type === "DIRECT" ? "Direct Message" : "Project Channel"}
                    </span>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 pt-2 border-t border-[#DDE2D8]">
                    <button className="w-full flex items-center justify-between p-2.5 rounded-[2px] hover:bg-[#F8F9F6] text-xs font-bold text-[#586274] cursor-pointer">
                      <span className="flex items-center gap-2.5">
                        <Bell className="h-4 w-4 text-[#8E99A8]" />
                        Mute Notifications
                      </span>
                      <span className="text-[10px] font-mono text-[#8E99A8]">Off</span>
                    </button>
                  </div>

                  {/* Members list */}
                  <div className="space-y-2 pt-2 border-t border-[#DDE2D8]">
                    <h6 className="text-[10px] font-mono font-bold uppercase text-[#586274] tracking-widest">
                      Members ({activeConversation.members?.length || 2})
                    </h6>
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {activeConversation.members?.map((m: any) => (
                        <div key={m.id || m.userId} className="flex items-center gap-2.5 p-1.5 rounded-[2px] hover:bg-[#F8F9F6]">
                          <Avatar name={m.user?.name || "Member"} src={m.user?.avatar} size="xs" className="rounded-[2px]" />
                          <span className="text-xs font-bold text-[#071A49] truncate">{m.user?.name || "Workspace Member"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ChannelProvider>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#8E99A8] p-6 text-center">
            <div className="h-14 w-14 bg-[#F1F8CE] text-[#071A49] border border-[#B7D600] rounded-[2px] flex items-center justify-center mb-3">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold uppercase font-display text-[#071A49] mb-1">Your Messages</h3>
            <p className="text-xs text-[#586274] max-w-sm">Select a project channel or start a Direct Message with a team member.</p>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<MessageSquarePlus className="h-4 w-4" />}
              onClick={() => setIsDmModalOpen(true)}
              className="mt-4 font-mono uppercase text-xs"
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E99A8]" />
            <input
              type="search"
              placeholder="Search member by name or email..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs rounded-[2px] border border-[#DDE2D8] bg-white text-[#071A49] placeholder:text-[#8E99A8] focus:outline-none focus:ring-1 focus:ring-[#071A49]"
            />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
            {filteredMembers.length === 0 ? (
              <p className="text-center text-xs text-[#8E99A8] py-6 font-mono">No members found.</p>
            ) : (
              filteredMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => startDirectMessage(member.id)}
                  disabled={startingDm === member.id}
                  className="w-full flex items-center justify-between p-2.5 rounded-[2px] hover:bg-[#F8F9F6] transition-colors group cursor-pointer border border-transparent hover:border-[#DDE2D8]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={member.name} src={member.avatar} size="sm" className="rounded-[2px]" />
                    <div className="text-left min-w-0">
                      <p className="text-xs font-bold text-[#071A49] truncate group-hover:text-[#041030] transition-colors">
                        {member.name}
                      </p>
                      <p className="text-[10px] font-mono text-[#586274] truncate">{member.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={startingDm === member.id}
                    className="text-[11px] px-2.5 h-7 font-mono uppercase"
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
