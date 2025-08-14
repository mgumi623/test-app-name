import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage, ID } from '../types/chat';
import { DataCache, MessageBatcher } from './useDataCache';
import { chatService } from '../../../lib/chatService';

export const useChatOptimized = (sessionId: ID) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messageCache = useRef(new DataCache<ChatMessage[]>({
    ttl: 5 * 60 * 1000,  // 5 minutes
    maxSize: 100
  }));

  const messageBatcher = useRef(new MessageBatcher());

  // メッセージの一括取得
  const fetchMessages = useCallback(async () => {
    const cached = messageCache.current.get(sessionId);
    if (cached) {
      setMessages(cached);
      return;
    }

    setIsLoading(true);
    try {
      const fetchedMessages = await chatService.getChatMessages(sessionId);
      messageCache.current.set(sessionId, fetchedMessages);
      setMessages(fetchedMessages);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // メッセージの追加
  const addMessage = useCallback((message: ChatMessage) => {
    messageBatcher.current.add(message, async (batchedMessages) => {
      // ローカル状態の更新
      setMessages(prev => [...prev, ...batchedMessages]);

      // キャッシュの更新
      const cached = messageCache.current.get(sessionId);
      if (cached) {
        messageCache.current.set(sessionId, [...cached, ...batchedMessages]);
      }

      // データベースの更新
      await Promise.all(
        batchedMessages.map(msg =>
          chatService.saveMessage(sessionId, msg.text, msg.sender)
        )
      );
    });
  }, [sessionId]);

  // 初期メッセージの取得
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    isLoading,
    addMessage,
    refreshMessages: fetchMessages
  };
};
