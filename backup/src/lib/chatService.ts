import { ChatMessage, ChatSession } from '@/app/AIchat/types/chat';
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export class ChatService {
  private messages: Map<string, ChatMessage[]> = new Map();
  private sessions: Map<string, ChatSession> = new Map();
  private currentSessionId: string | null = null;

  private generateId(): string {
    return generateUUID();
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
  // チャットセッションの作成
  createChatSession = async (userId: string): Promise<string> => {
    const sessionId = this.generateId();
    const session: ChatSession = {
      id: sessionId,
      title: '新しいチャット',
      messages: [],
      lastMessage: new Date(),
      user_id: userId,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        currentMode: '通常',
        messageCount: 0,
        hasUnread: false,
        isTemporary: false
      }
    };
    this.sessions.set(sessionId, session);
    return sessionId;
  }

  // チャットセッションの取得
  getChatSession = async (sessionId: string): Promise<ChatSession | null> => {
    return this.sessions.get(sessionId) || null;
  }

  // チャットセッション一覧の取得
  getChatSessions = async (userId: string): Promise<ChatSession[]> => {
    return Array.from(this.sessions.values())
      .filter(session => session.user_id === userId)
      .sort((a, b) => b.lastMessage.getTime() - a.lastMessage.getTime());
  }

  // チャットセッションの削除
  deleteChatSession = async (sessionId: string): Promise<void> => {
    this.sessions.delete(sessionId);
    this.messages.delete(sessionId);
  }

  // メッセージの保存
  saveMessage = async (sessionId: string, text: string, sender: 'user' | 'assistant' | 'system', userId?: string): Promise<void> => {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const message: ChatMessage = {
      id: this.generateId(),
      text,
      sender,
      timestamp: new Date(),
      type: 'normal'
    };

    const messages = this.messages.get(sessionId) || [];
    messages.push(message);
    this.messages.set(sessionId, messages);

    session.messages = messages;
    session.lastMessage = new Date();
    session.metadata.messageCount = messages.length;
    session.metadata.updatedAt = new Date();
    this.sessions.set(sessionId, session);
  }

}

export const chatService = new ChatService();