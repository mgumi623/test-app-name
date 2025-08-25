import { useState, useCallback } from 'react';

import { ChatMessage as Message, ChatSession, ChatMetadata } from '../types/chat';
import { sendMessageToDify, sendMessageToDifyStream, type ModeType as DifyModeType } from '@/lib/dify';

interface UseChatSessionsProps {
  initialMode: string;
}

export const useChatSessions = ({ initialMode }: UseChatSessionsProps) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [mode, setMode] = useState(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getWelcomeMessage = useCallback((currentMode: string) => {
    const welcomeMessages = {
      '通常': 'こんにちは！通常モードのAIアシスタントです。何でもお気軽にお聞きください。',
      '脳血管': '脳血管モードのAIアシスタントです。脳血管疾患に関する質問や相談を承ります。',
      '感染マニュアル': '感染マニュアルモードのAIアシスタントです。感染症に関する情報やマニュアルについてお手伝いします。',
      '議事録作成': '議事録作成モードのAIアシスタントです。会議の議事録作成をお手伝いします。',
      '文献検索': '文献検索モードのAIアシスタントです。学術文献の検索や分析をお手伝いします。'
    };
    return welcomeMessages[currentMode as keyof typeof welcomeMessages] || welcomeMessages['通常'];
  }, []);

  const createSession = useCallback(() => {
    const now = new Date();
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      lastMessage: now,
      user_id: crypto.randomUUID(),
      metadata: {
        createdAt: now,
        updatedAt: now,
        currentMode: mode,
        messageCount: 0,
        hasUnread: false,
        isTemporary: false,
        lastMessagePreview: ''
      }
    };
    
    // 新規セッションにウェルカムメッセージを追加
    const welcomeMessage: Message = {
      id: crypto.randomUUID(),
      text: getWelcomeMessage(mode),
      sender: 'assistant',
      timestamp: now,
      type: 'system'
    };
    
    newSession.messages = [welcomeMessage];
    
    setSessions((prev) => [...prev, newSession]);
    setCurrentSession(newSession);
    return newSession;
  }, [mode, getWelcomeMessage]);

  const addMessage = useCallback((sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    setSessions((prev) => {
      return prev.map((session) => {
        if (session.id === sessionId) {
          return {
            ...session,
            messages: [...session.messages, newMessage],
          };
        }
        return session;
      });
    });

    if (currentSession?.id === sessionId) {
      setCurrentSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, newMessage],
        };
      });
    }
  }, [currentSession]);

  const switchSession = useCallback((sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
    }
  }, [sessions]);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
    }
  }, [currentSession]);

  return {
    sessions,
    currentSession,
    createSession,
    addMessage,
    switchSession,
    deleteSession,
    // Add additional return values that match the interface used in page.tsx
    messages: currentSession?.messages || [],
    isTyping,
    isLoading,
    error,
    currentMode: mode,
    setCurrentMode: (newMode: string) => {
      setMode(newMode);
      // 以前はここでチャットにモード変更の案内を追加していたが、
      // ポップアップ表示に切り替えるためメッセージ追加は行わない
    },
    getWelcomeMessage,
    sendMessage: async (text: string) => {
      if (!text.trim()) return;

      const activeSession = currentSession ?? createSession();

      await addMessage(activeSession.id, {
        text,
        sender: 'user',
        type: 'normal'
      });

      try {
        setIsLoading(true);
        setIsTyping(true);
        setError(null);

        // 画像/音声が関与しない通常モードはストリーミングで体感速度を改善
        if (mode !== '議事録作成') {
          // プレースホルダーメッセージは追加せず、
          // 最初のトークン受信時に初めてアシスタント枠を作成する。
          let accumulated = '';
          let started = false;
          await sendMessageToDifyStream({
            prompt: text,
            mode: (mode as DifyModeType) || '通常',
            onToken: (delta: string) => {
              if (!started) {
                started = true;
                setIsTyping(false);
                accumulated += delta;
                // 最初のトークンでメッセージ枠を作成
                addMessage(activeSession.id, {
                  text: accumulated,
                  sender: 'assistant',
                  type: 'normal'
                });
                return;
              }
              accumulated += delta;
              // 直近メッセージを書き換え
              setSessions((prev) => prev.map(s => {
                if (s.id !== activeSession.id) return s;
                const msgs = s.messages.slice();
                const last = msgs[msgs.length - 1];
                msgs[msgs.length - 1] = { ...last, text: accumulated } as Message;
                return { ...s, messages: msgs };
              }));
              if (currentSession?.id === activeSession.id) {
                setCurrentSession((p) => {
                  if (!p) return p;
                  const msgs = p.messages.slice();
                  const last = msgs[msgs.length - 1];
                  msgs[msgs.length - 1] = { ...last, text: accumulated } as Message;
                  return { ...p, messages: msgs };
                });
              }
            }
          });
        } else {
          // 議事録などの特殊ケースは従来の blocking を利用
          const res = await sendMessageToDify({
            prompt: text,
            mode: (mode as DifyModeType) || '通常'
          });

          const answer: string =
            res?.answer ??
            res?.data?.answer ??
            (typeof res === 'string' ? res : JSON.stringify(res));

          await addMessage(activeSession.id, {
            text: answer || '(回答が空でした)',
            sender: 'assistant',
            type: 'normal'
          });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        await addMessage(activeSession.id, {
          text: `エラーが発生しました: ${msg}`,
          sender: 'system',
          type: 'system'
        });
      } finally {
        setIsTyping(false);
        setIsLoading(false);
      }
    },
    loadCurrentSession: async () => {
      if (!currentSession) {
        const newSession = createSession();
        // 新規セッションは既にウェルカムメッセージが含まれているため、
        // switchSessionは不要（createSessionで既にcurrentSessionが設定される）
      }
    },
    deleteAllChats: async () => {
      sessions.forEach(session => deleteSession(session.id));
    }
  };
};

export type { Message, ChatSession };