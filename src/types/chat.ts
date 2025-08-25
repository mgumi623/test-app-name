export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}