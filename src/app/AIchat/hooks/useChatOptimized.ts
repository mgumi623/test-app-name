import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage, ID } from '../types/chat';
import { DataCache } from './useDataCache';
import { chatService } from '../../../lib/chatService';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

// エクスポネンシャルバックオフ (秒)
const BACKOFF_DELAYS = [0.3, 0.6, 1.2];

export const useChatOptimized = (sessionId: ID) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const mountedRef = useRef(false);
  const supabase = useSupabaseClient();

  // ---- メッセージのキャッシュ ----
  const messageCache = useRef(new DataCache<ChatMessage[]>({
    ttl: 5 * 60 * 1000, // 5分
    maxSize: 100
  }));

  // ---- 取得の同時実行ガード & キャンセル制御 ----
  const inflightFetch = useRef<Promise<void> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // StrictModeの二重実行防止用
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false };
  }, []);

  // メッセージの取得
  const fetchMessages = useCallback(async (opts?: { force?: boolean }) => {
    if (!mountedRef.current) return;
    
    // キャッシュチェック
    if (!opts?.force) {
      const cached = messageCache.current.get(sessionId);
      if (cached) {
        setMessages(cached);
        return;
      }
    }

    // 同時実行防止
    if (inflightFetch.current) return inflightFetch.current;

    const run = (async () => {
      setIsLoading(true);
      
      // 既存のリクエストをキャンセル
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      let lastError: any = null;
      
      // バックオフ付きリトライ
      for (let i = 0; i < BACKOFF_DELAYS.length; i++) {
        if (!mountedRef.current) return;
        
        try {
          const messages = await chatService.getChatMessages(sessionId, {
            signal: abortRef.current.signal,
            limit: opts?.force ? undefined : 1  // 初回/強制更新時のみ全件取得
          });

          if (!mountedRef.current) return;
          
          messageCache.current.set(sessionId, messages);
          setMessages(messages);
          lastError = null;
          break;
        } catch (e) {
          lastError = e;
          if ((e as any)?.name === 'AbortError') break;
          await new Promise(r => setTimeout(r, BACKOFF_DELAYS[i] * 1000));
        }
      }

      if (lastError && mountedRef.current) {
        console.warn('Failed to fetch messages:', lastError);
      }

      setIsLoading(false);
      inflightFetch.current = null;
    })();

    inflightFetch.current = run;
    return run;
  }, [sessionId]);

  // Realtime購読の設定
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`chat_messages:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        async (payload) => {
          if (!mountedRef.current) return;

          const newMessage: ChatMessage = {
            id: payload.new.id,
            text: payload.new.content,
            sender: payload.new.sender,
            timestamp: new Date(payload.new.created_at),
            type: 'normal'
          };

          // キャッシュと状態の更新
          setMessages(prev => {
            // 重複排除
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });

          const cached = messageCache.current.get(sessionId);
          if (cached && !cached.some(m => m.id === newMessage.id)) {
            messageCache.current.set(sessionId, [...cached, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [sessionId, supabase]);

  // 初期データ取得
  useEffect(() => {
    if (!sessionId || !mountedRef.current) return;
    
    fetchMessages({ force: true }); // 初回は全件取得

    return () => {
      abortRef.current?.abort(); // アンマウント時にキャンセル
    };
  }, [sessionId, fetchMessages]);

  return { messages, isLoading, refreshMessages: fetchMessages };
};