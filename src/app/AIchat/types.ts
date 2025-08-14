export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
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
  };
}

export interface DatabaseChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseChatMessage {
  id: string;
  session_id: string;
  content: string;
  sender: 'user' | 'ai';
  created_at: string;
}