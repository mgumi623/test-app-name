import { useState, useEffect } from 'react';

const CONVERSATION_STORAGE_KEY = 'dify_conversation_id';

export interface ConversationState {
  conversationId: string | null;
  setConversationId: (id: string) => void;
  clearConversation: () => void;
}

export function useConversation(): ConversationState {
  const [conversationId, setConversationIdState] = useState<string | null>(null);

  // Load conversation ID from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CONVERSATION_STORAGE_KEY);
      if (stored) {
        setConversationIdState(stored);
      }
    }
  }, []);

  const setConversationId = (id: string) => {
    setConversationIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CONVERSATION_STORAGE_KEY, id);
    }
  };

  const clearConversation = () => {
    setConversationIdState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CONVERSATION_STORAGE_KEY);
    }
  };

  return {
    conversationId,
    setConversationId,
    clearConversation,
  };
}
