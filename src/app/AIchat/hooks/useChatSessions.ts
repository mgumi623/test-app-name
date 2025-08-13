import { useState, useEffect } from 'react';
import { ChatSession, ChatMessage } from '../types';
import { sendMessageToDify, ModeType } from '../../../lib/dify';
import { chatService } from '../../../lib/chatService';
import { useAuth } from '../../../contexts/AuthContext';
import { analyticsService } from '../../../lib/analyticsService';

export const useChatSessions = (mode: ModeType = '通常') => {
  const { user } = useAuth();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const currentChat = chatSessions.find((c) => c.id === currentChatId);
  const messages = currentChat?.messages ?? [];

  // 初期データの読み込み
  useEffect(() => {
    const loadChatSessions = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const sessions = await chatService.getChatSessions(user.id);
        setChatSessions(sessions);
        
        if (sessions.length > 0) {
          setCurrentChatId(sessions[0].id);
        } else {
          // セッションがない場合は新しいセッションを作成
          await createNewChat();
        }
      } catch (error) {
        console.error('Error loading chat sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChatSessions();
  }, [user?.id]);

  const updateChatTitle = async (chatId: string, firstMessage: string) => {
    const newTitle = firstMessage.length > 30
      ? `${firstMessage.substring(0, 30)}…`
      : firstMessage;

    // ローカル状態を更新
    setChatSessions((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, title: newTitle }
          : chat,
      ),
    );

    // データベースに保存
    await chatService.updateSessionTitle(chatId, newTitle);
  };

  const selectChat = (id: string) => {
    setCurrentChatId(id);
  };

  const createNewChat = async () => {
    if (!user?.id) return;

    try {
      const sessionId = await chatService.createChatSession(user.id);
      if (!sessionId) return;

      // 初期AIメッセージを保存
      const initialMessage = 'こんにちは！私はAIアシスタントです。何かお手伝いできることはありますか？';
      await chatService.saveMessage(sessionId, initialMessage, 'ai');

      // 新しいセッションをローカル状態に追加
      const newChat: ChatSession = {
        id: sessionId,
        title: '新しいチャット',
        messages: [
          {
            id: crypto.randomUUID(),
            text: initialMessage,
            sender: 'ai',
            timestamp: new Date(),
          },
        ],
        lastMessage: new Date(),
        user_id: user.id,
      };

      setChatSessions((prev) => [newChat, ...prev]);
      setCurrentChatId(sessionId);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const deleteChat = async (
    chatId: string,
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation();
    if (chatSessions.length === 1) return;

    try {
      const success = await chatService.deleteChatSession(chatId);
      if (success) {
        setChatSessions((prev) => {
          const updated = prev.filter((c) => c.id !== chatId);
          if (currentChatId === chatId && updated.length > 0) {
            setCurrentChatId(updated[0].id);
          }
          return updated;
        });
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const sendMessage = async (inputText: string) => {
    if (!inputText.trim() || !currentChatId) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    // ローカル状態を更新
    setChatSessions((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: [...chat.messages, userMessage],
              lastMessage: new Date(),
            }
          : chat,
      ),
    );

    // データベースに保存
    await chatService.saveMessage(currentChatId, userMessage.text, 'user');
    
    // 分析追跡
    analyticsService.trackChatMessage(userMessage.text.length, true);

    // 初回メッセージの場合はタイトルを更新
    const currentSession = chatSessions.find(c => c.id === currentChatId);
    if (currentSession && currentSession.messages.length === 1) {
      await updateChatTitle(currentChatId, userMessage.text);
    }

    setIsTyping(true);

    try {
      console.log('Starting Dify API call for message:', { mode, messageLength: userMessage.text.length });
      const difyRes = await sendMessageToDify(userMessage.text, mode);
      console.log('Dify API call completed successfully');
      const aiMessageText = difyRes.answer ?? '（回答が空でした）';

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        text: aiMessageText,
        sender: 'ai',
        timestamp: new Date(),
      };

      // ローカル状態を更新
      setChatSessions((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [...chat.messages, aiMessage],
                lastMessage: new Date(),
              }
            : chat,
        ),
      );

      // データベースに保存
      await chatService.saveMessage(currentChatId, aiMessageText, 'ai');
      
      // 分析追跡
      analyticsService.trackChatMessage(aiMessageText.length, false);
    } catch (err) {
      console.error('Dify API error details:', {
        error: err,
        errorMessage: err instanceof Error ? err.message : String(err),
        errorType: typeof err,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
        mode
      });
      
      // より詳細なエラーメッセージ
      let errorText = '申し訳ございません。一時的にエラーが発生しました。';
      
      if (err instanceof Error) {
        if (err.name === 'AbortError' || err.message.includes('timeout')) {
          errorText += 'ネットワークの接続が不安定な可能性があります。しばらく待ってから再度お試しください。';
        } else if (err.message.includes('API Key')) {
          errorText += 'システムの設定に問題があります。管理者にお問い合わせください。';
        } else {
          errorText += `詳細: ${err.message.slice(0, 100)}`;
        }
      }
      
      // エラー時のフォールバックメッセージ
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        text: errorText,
        sender: 'ai',
        timestamp: new Date(),
      };

      // ローカル状態を更新
      setChatSessions((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [...chat.messages, errorMessage],
                lastMessage: new Date(),
              }
            : chat,
        ),
      );

      // エラーメッセージもデータベースに保存
      await chatService.saveMessage(currentChatId, errorMessage.text, 'ai');
    } finally {
      setIsTyping(false);
    }
  };

  return {
    chatSessions,
    currentChatId,
    messages,
    isTyping,
    isLoading,
    selectChat,
    createNewChat,
    deleteChat,
    sendMessage,
  };
};