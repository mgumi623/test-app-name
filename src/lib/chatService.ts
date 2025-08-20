import { supabase } from './supabase';
import { ChatSession, ChatMessage, DatabaseChatSession, DatabaseChatMessage } from '../app/AIchat/types';
import { handleSupabaseError } from './utils';

interface DBChatSession extends Omit<DatabaseChatSession, 'chat_messages'> {
  chat_messages?: DatabaseChatMessage[];
}

// 入力検証関数
const validateMessageInput = (content: string, sender: string): { isValid: boolean; error?: string } => {
  if (!content || typeof content !== 'string') {
    return { isValid: false, error: 'メッセージ内容が無効です' };
  }
  
  if (content.trim().length === 0) {
    return { isValid: false, error: 'メッセージ内容が空です' };
  }
  
  if (content.length > 50000) {
    return { isValid: false, error: 'メッセージが長すぎます（最大50000文字）' };
  }
  
  if (!['user', 'ai', 'system', 'assistant'].includes(sender)) {
    return { isValid: false, error: '無効な送信者です' };
  }
  
  return { isValid: true };
};

export class ChatService {
  private supabase = supabase;

  // チャットセッション一覧の取得
  async getChatSessions(userId: string): Promise<ChatSession[]> {
    try {
      console.log('[ChatService] Fetching chat sessions for user:', userId);
      
      const { data: sessions, error } = await this.supabase
        .from('chat_sessions')
        .select(`
          id,
          title,
          user_id,
          created_at,
          updated_at,
          chat_messages (
            id,
            content,
            sender,
            created_at
          )
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('[ChatService] Failed to fetch chat sessions:', handleSupabaseError(error));
        return [];
      }

      if (!sessions || sessions.length === 0) {
        console.log('[ChatService] No chat sessions found for user');
        return [];
      }

      const mappedSessions = sessions.map((session) => ({
        id: session.id,
        title: session.title,
        messages: (session.chat_messages || []).map((msg) => ({
          id: msg.id,
          text: msg.content,
          sender: msg.sender === 'assistant' ? 'ai' : msg.sender,
          timestamp: new Date(msg.created_at),
        })) as ChatMessage[],
        lastMessage: new Date(session.updated_at),
        user_id: session.user_id,
        metadata: {
          createdAt: new Date(session.created_at),
          updatedAt: new Date(session.updated_at),
          currentMode: '',
          messageCount: session.chat_messages?.length || 0,
          hasUnread: false,
          isTemporary: false,
        },
      }));

      console.log('[ChatService] Successfully fetched', mappedSessions.length, 'chat sessions');
      return mappedSessions;
    } catch (error) {
      console.error('[ChatService] Failed to fetch chat sessions:', handleSupabaseError(error));
      return [];
    }
  }

  // 特定セッションの取得
  async getChatSession(sessionId: string): Promise<ChatSession | null> {
    try {
      console.log('[ChatService] Fetching chat session:', sessionId);
      
      const { data: session, error } = await this.supabase
        .from('chat_sessions')
        .select(`
          id,
          title,
          user_id,
          created_at,
          updated_at,
          chat_messages (
            id,
            content,
            sender,
            created_at
          )
        `)
        .eq('id', sessionId)
        .single();

      if (error || !session) {
        console.log('[ChatService] Session not found or error:', error);
        return null;
      }

      const mappedSession = {
        id: session.id,
        title: session.title,
        messages: (session.chat_messages || []).map((msg) => ({
          id: msg.id,
          text: msg.content,
          sender: msg.sender === 'assistant' ? 'ai' : msg.sender,
          timestamp: new Date(msg.created_at),
        })),
        lastMessage: new Date(session.updated_at),
        user_id: session.user_id,
        metadata: {
          createdAt: new Date(session.created_at),
          updatedAt: new Date(session.updated_at),
          currentMode: '',
          messageCount: session.chat_messages?.length || 0,
          hasUnread: false,
          isTemporary: false,
        },
      };

      console.log('[ChatService] Successfully fetched chat session with', mappedSession.messages.length, 'messages');
      return mappedSession;
    } catch (error) {
      console.error('[ChatService] Failed to fetch chat session:', error);
      return null;
    }
  }

  // 特定セッションのメッセージ取得
  async getChatMessages(sessionId: string, opts?: { limit?: number, signal?: AbortSignal }): Promise<ChatMessage[]> {
    try {
      let query = this.supabase
        .from('chat_messages')
        .select('id, content, sender, created_at') // ← type を削除
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (opts?.limit) {
        query = query.limit(opts.limit);
      }

      const { data: messages, error } = await query;

      if (error || !messages) return [];

      return messages.map((msg) => ({
        id: msg.id,
        text: msg.content,
        sender: msg.sender === 'assistant' ? 'ai' : msg.sender,
        timestamp: new Date(msg.created_at),
      }));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      return [];
    }
  }

  // 新しいチャットセッション作成
  async createChatSession(userId: string, title: string = '新しいチャット'): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('chat_sessions')
        .insert([{ user_id: userId, title }])
        .select()
        .single();

      if (error) {
        console.error('Failed to create chat session:', error.message);
        return null;
      }

      return data.id as string;
    } catch (error) {
      console.error('Error creating chat session:', error);
      return null;
    }
  }

  // チャットセッション削除
  async deleteChatSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting chat session:', error);
      return false;
    }
  }

  // メッセージ保存
  async saveMessage(sessionId: string, content: string, sender: string): Promise<string | null> {
    try {
      console.log('[ChatService] Saving message:', { sessionId, content: content.substring(0, 50), sender });
      
      // 入力検証
      const validation = validateMessageInput(content, sender);
      if (!validation.isValid) {
        console.error('[ChatService] Invalid message input:', validation.error);
        throw new Error(validation.error);
      }
      
      // 送信者を正規化（'system' → 'ai', 'assistant' → 'ai'）
      let normalizedSender = sender;
      if (sender === 'system' || sender === 'assistant') {
        normalizedSender = 'ai';
      }

      const message = {
        session_id: sessionId,
        content: content.trim(), // 前後の空白を除去
        sender: normalizedSender,
      };

      const { data, error } = await this.supabase
        .from('chat_messages')
        .insert([message])
        .select('id')
        .single();

      if (error) {
        console.error('[ChatService] Failed to save message:', error.message);
        return null;
      }

      // セッションの更新日時も更新
      await this.updateSessionTimestamp(sessionId);

      console.log('[ChatService] Message saved successfully with sender:', normalizedSender);
      return data.id;
    } catch (error) {
      console.error('[ChatService] Error saving message:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  // セッションタイトル更新
  async updateSessionTitle(sessionId: string, title: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('chat_sessions')
        .update({
          title,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating session title:', error);
      return false;
    }
  }

  // セッションの更新日時を更新
  private async updateSessionTimestamp(sessionId: string): Promise<void> {
    try {
      await this.supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Error updating session timestamp:', error);
    }
  }

  // Realtime購読の設定
  subscribeToMessageInserts(
    options: { table: string; sessionId: string },
    callback: (payload: { new: { id: string; session_id: string; content: string; sender: 'user' | 'ai'; created_at: string; } }) => void
  ) {
    return this.supabase
      .channel(`chat_messages:${options.sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: options.table,
          filter: `session_id=eq.${options.sessionId}`,
        },
        callback
      )
      .subscribe();
  }
}

export const chatService = new ChatService();
