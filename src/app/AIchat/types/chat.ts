import { ID as GenericID, Timestamp as GenericTimestamp } from './common';

export type ID = GenericID;
export type Timestamp = GenericTimestamp;

export interface ChatMessage {
  id: ID;
  text: string;
  sender: 'user' | 'assistant' | 'system' | 'tool';
  timestamp: Timestamp;
  type?: 'mode_change' | 'normal' | 'system';
}

export interface ChatSessionMetadata {
  id: ID;
  title: string;
  lastMessage: Timestamp;
  user_id: ID;
  metadata: ChatMetadata & {
    lastMessagePreview?: string;
  };
}

export interface ChatSession extends ChatSessionMetadata {
  messages: ChatMessage[];
}

export interface ChatMessagesPage {
  messages: ChatMessage[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface ChatMetadata {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  currentMode: string;
  messageCount: number;
  hasUnread: boolean;
  isTemporary: boolean;
}