import { create } from 'zustand';

interface ChatStore {
  activeConversationId: string | null;
  setActiveConversation: (id: string | null) => void;
  typingUsers: Record<string, string[]>; // conversationId -> array of user names
  setTyping: (conversationId: string, userName: string, isTyping: boolean) => void;
  replyingTo: any | null;
  setReplyingTo: (msg: any | null) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  activeConversationId: null,
  setActiveConversation: (id) => set({ activeConversationId: id }),
  typingUsers: {},
  setTyping: (conversationId, userName, isTyping) => set((state) => {
    const current = state.typingUsers[conversationId] || [];
    if (isTyping && !current.includes(userName)) {
      return { typingUsers: { ...state.typingUsers, [conversationId]: [...current, userName] } };
    }
    if (!isTyping && current.includes(userName)) {
      return { typingUsers: { ...state.typingUsers, [conversationId]: current.filter(n => n !== userName) } };
    }
    return state;
  }),
  replyingTo: null,
  setReplyingTo: (msg) => set({ replyingTo: msg }),
}));
