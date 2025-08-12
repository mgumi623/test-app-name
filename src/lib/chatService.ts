import { supabase } from './supabase';
import { ChatSession, ChatMessage, DatabaseChatSession, DatabaseChatMessage } from '../app/AIchat/types';

export class ChatService {
  private supabase = supabase;

  // データベース接続とテーブル存在確認
  async checkDatabaseConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Checking database connection...');
      
      // Supabase URL と Key の確認
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      console.log('Supabase URL:', supabaseUrl);
      console.log('Supabase URL valid:', !!(supabaseUrl && supabaseUrl.includes('supabase')));
      console.log('Supabase Anon Key exists:', !!supabaseKey);
      console.log('Supabase Anon Key length:', supabaseKey?.length || 0);
      
      if (!supabaseUrl || !supabaseKey) {
        return { 
          success: false, 
          error: `Missing environment variables: URL=${!!supabaseUrl}, KEY=${!!supabaseKey}` 
        };
      }
      
      // 認証状態の確認
      const { data: { user }, error: authError } = await this.supabase.auth.getUser();
      console.log('Current user:', user);
      console.log('Auth error:', authError);
      
      if (authError) {
        console.error('Authentication error:', authError);
        return { success: false, error: `Authentication error: ${authError.message}` };
      }
      
      if (!user) {
        console.error('No authenticated user');
        return { success: false, error: 'No authenticated user' };
      }
      
      // テーブルの存在確認
      const { data, error } = await this.supabase
        .from('chat_sessions')
        .select('count', { count: 'exact', head: true });

      if (error) {
        console.error('=== DATABASE CONNECTION ERROR ===');
        console.error('Error type:', typeof error);
        console.error('Error constructor:', error?.constructor?.name);
        
        // 可能な全てのプロパティをチェック
        const errorProps = ['message', 'details', 'hint', 'code', 'status', 'statusCode', 'statusText'];
        errorProps.forEach(prop => {
          if (prop in error) {
            console.error(`Error ${prop}:`, (error as any)[prop]);
          }
        });
        
        // エラーを文字列化して確認
        const errorString = error.toString();
        console.error('Error toString():', errorString);
        
        // 実際のエラーメッセージを抽出
        let actualMessage = 'Unknown database error';
        if (error.message) {
          actualMessage = error.message;
        } else if (errorString && errorString !== '[object Object]') {
          actualMessage = errorString;
        } else if (error.code) {
          actualMessage = `Database error code: ${error.code}`;
        }
        
        console.error('=== END DATABASE CONNECTION ERROR ===');
        return { success: false, error: actualMessage };
      }

      console.log('Database connection successful, count data:', data);
      return { success: true };
    } catch (error) {
      console.error('Database connection check error:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      return { success: false, error: String(error) };
    }
  }

  // チャットセッション一覧の取得
  async getChatSessions(userId: string): Promise<ChatSession[]> {
    try {
      console.log('Fetching chat sessions for user:', userId);
      
      const { data: sessions, error } = await this.supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('=== SUPABASE ERROR ANALYSIS ===');
        console.error('Error type:', typeof error);
        console.error('Error constructor:', error?.constructor?.name);
        console.error('Error object keys:', Object.keys(error));
        console.error('Error object values:', Object.values(error));
        console.error('Error toString:', error.toString());
        console.error('Error stack:', error.stack);
        
        // 全プロパティを列挙
        for (const key in error) {
          console.error(`Error.${key}:`, (error as any)[key]);
        }
        
        console.error('Error instanceof Error:', error instanceof Error);
        console.error('Error instanceof PostgrestError:', error.constructor.name);
        console.error('=== END ERROR ANALYSIS ===');
        throw error;
      }

      console.log('Retrieved sessions:', sessions);

      if (!sessions || sessions.length === 0) {
        console.log('No sessions found for user');
        return [];
      }

      const sessionsWithMessages = await Promise.all(
        (sessions as DatabaseChatSession[]).map(async (session) => {
          const messages = await this.getChatMessages(session.id);
          return {
            id: session.id,
            title: session.title,
            messages,
            lastMessage: new Date(session.updated_at),
            user_id: session.user_id,
          };
        })
      );

      return sessionsWithMessages;
    } catch (error) {
      console.error('=== CATCH BLOCK ERROR IN getChatSessions ===');
      console.error('Caught error type:', typeof error);
      console.error('Caught error constructor:', error?.constructor?.name);
      console.error('Caught error:', error);
      console.error('Caught error JSON:', JSON.stringify(error, null, 2));
      console.error('=== END CATCH BLOCK ERROR ===');
      return [];
    }
  }

  // 特定セッションのメッセージ取得
  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const { data: messages, error } = await this.supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (messages as DatabaseChatMessage[]).map(msg => ({
        id: msg.id,
        text: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.created_at),
      }));
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
  }

  // 新しいチャットセッション作成
  async createChatSession(userId: string, title: string = '新しいチャット'): Promise<string | null> {
    try {
      console.log('Creating chat session for user:', userId, 'with title:', title);
      
      const { data, error } = await this.supabase
        .from('chat_sessions')
        .insert([{
          user_id: userId,
          title,
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error in createChatSession:');
        console.error('Error object:', error);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        console.error('Error code:', error.code);
        console.error('Full error JSON:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('Created session:', data);
      return data.id;
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
  async saveMessage(sessionId: string, content: string, sender: 'user' | 'ai'): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
          content,
          sender,
        }])
        .select()
        .single();

      if (error) throw error;

      // セッションの更新日時も更新
      await this.updateSessionTimestamp(sessionId);

      return data.id;
    } catch (error) {
      console.error('Error saving message:', error);
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
          updated_at: new Date().toISOString()
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

  // デバッグ用の簡単なテスト
  async debugTest(): Promise<void> {
    try {
      console.log('=== DEBUG TEST START ===');
      
      // 0. PostgreSQLクライアント情報
      console.log('Supabase client:', this.supabase);
      
      // 1. 最もシンプルなクエリ（テーブル一覧）
      console.log('Testing table existence...');
      try {
        const { data: tableData, error: tableError } = await this.supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .eq('table_name', 'chat_sessions');
        
        console.log('Table existence check:', { data: tableData, error: tableError });
      } catch (e) {
        console.log('Table check failed (expected):', e);
      }
      
      // 2. 認証状態の詳細確認
      const { data: authData, error: authError } = await this.supabase.auth.getSession();
      console.log('Auth session:', { 
        session: authData?.session ? 'EXISTS' : 'NULL', 
        user: authData?.session?.user?.id || 'NO_USER',
        error: authError 
      });
      
      // 3. より詳細な認証確認
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      console.log('User check:', { 
        user: user ? { id: user.id, email: user.email } : 'NULL', 
        error: userError 
      });
      
      // 4. 基本的なクエリテスト（chat_sessionsテーブル）
      console.log('Testing basic query on chat_sessions...');
      const { data: testData, error: testError } = await this.supabase
        .from('chat_sessions')
        .select('*')
        .limit(1);
      
      if (testError) {
        console.error('Basic query failed with detailed error analysis:');
        console.error('Error type:', typeof testError);
        console.error('Error keys:', Object.keys(testError));
        for (const key in testError) {
          console.error(`testError.${key}:`, (testError as any)[key]);
        }
      } else {
        console.log('Basic query succeeded:', testData);
      }
      
      console.log('=== DEBUG TEST END ===');
    } catch (error) {
      console.error('Debug test failed:', error);
    }
  }
}

export const chatService = new ChatService();