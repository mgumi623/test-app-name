import { ID as GenericID, Timestamp as GenericTimestamp } from './common';

export type ID = GenericID;
export type Timestamp = GenericTimestamp;

export interface ChatMessage {
  id: ID;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Timestamp;
  type?: 'mode_change' | 'normal' | 'system';
}

export interface ChatSession {
  id: ID;
  title: string;
  messages: ChatMessage[];
  lastMessage: Timestamp;
  user_id: ID;
  metadata: ChatMetadata;
}

export interface ChatMetadata {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  currentMode: string;
  messageCount: number;
  hasUnread: boolean;
  isTemporary: boolean;
}