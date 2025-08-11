export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface ChatSession {
  id: number;
  title: string;
  messages: ChatMessage[];
  lastMessage: Date;
}