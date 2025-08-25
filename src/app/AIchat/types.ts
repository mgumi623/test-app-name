export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant' | 'system' | 'tool';
  timestamp: Date;
  type?: 'mode_change' | 'normal' | 'system';
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastMessage: Date;
  user_id: string;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    currentMode: string;
    messageCount: number;
    hasUnread: boolean;
    isTemporary: boolean;
  };
}

export interface DatabaseChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  hospital_id?: string | null;
}

export interface DatabaseChatMessage {
  id: string;
  session_id: string;
  content: string;
  sender_kind: 'user' | 'assistant' | 'system' | 'tool';
  sender_user_id?: string | null;
  created_at: string;
}