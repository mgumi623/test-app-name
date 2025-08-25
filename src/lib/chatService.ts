import { ChatMessage } from '../app/AIchat/types';
import crypto from 'crypto';

export class ChatService {
  private messages: Map<string, ChatMessage[]> = new Map();
  private currentSessionId: string | null = null;

  private generateId(): string {
    return crypto.randomUUID();
  }

  // メッセージの送信
  async sendMessage(text: string, isUser: boolean = true): Promise<ChatMessage> {
    if (!this.currentSessionId) {
      this.currentSessionId = this.generateId();
      this.messages.set(this.currentSessionId, []);
    }

    const message: ChatMessage = {
      id: this.generateId(),
      text,
      sender: isUser ? 'user' : 'assistant',
      timestamp: new Date(),
      type: 'normal'
    };

    const sessionMessages = this.messages.get(this.currentSessionId) || [];
    sessionMessages.push(message);
    this.messages.set(this.currentSessionId, sessionMessages);

    return message;
  }

  // メッセージ履歴の取得
  async getMessages(): Promise<ChatMessage[]> {
    if (!this.currentSessionId) {
      return [];
    }
    return this.messages.get(this.currentSessionId) || [];
  }

  // セッションのクリア
  async clearSession(): Promise<void> {
    if (this.currentSessionId) {
      this.messages.delete(this.currentSessionId);
    }
    this.currentSessionId = null;
  }
}

export const chatService = new ChatService();