import { useState } from 'react';
import { ChatSession, ChatMessage } from '../types';
import { sendMessageToDify } from '../../../lib/dify';

export const useChatSessions = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: 1,
      title: '新しいチャット',
      messages: [
        {
          id: 1,
          text: 'こんにちは！私はAIアシスタントです。何かお手伝いできることはありますか？',
          sender: 'ai',
          timestamp: new Date(),
        },
      ],
      lastMessage: new Date(),
    },
  ]);
  const [currentChatId, setCurrentChatId] = useState<number>(1);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const currentChat = chatSessions.find((c) => c.id === currentChatId);
  const messages = currentChat?.messages ?? [];

  const updateChatTitle = (chatId: number, firstMessage: string) => {
    setChatSessions((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title:
                firstMessage.length > 30
                  ? `${firstMessage.substring(0, 30)}…`
                  : firstMessage,
            }
          : chat,
      ),
    );
  };

  const selectChat = (id: number) => {
    setCurrentChatId(id);
  };

  const createNewChat = () => {
    const now = Date.now();
    const newChat: ChatSession = {
      id: now,
      title: '新しいチャット',
      messages: [
        {
          id: now + 1,
          text: 'こんにちは！私はAIアシスタントです。何かお手伝いできることはありますか？',
          sender: 'ai',
          timestamp: new Date(),
        },
      ],
      lastMessage: new Date(),
    };
    setChatSessions((prev) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
  };

  const deleteChat = (
    chatId: number,
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation();
    if (chatSessions.length === 1) return;
    setChatSessions((prev) => {
      const updated = prev.filter((c) => c.id !== chatId);
      if (currentChatId === chatId) setCurrentChatId(updated[0].id);
      return updated;
    });
  };

  const sendMessage = async (inputText: string) => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

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

    updateChatTitle(currentChatId, userMessage.text);
    setIsTyping(true);

    try {
      const difyRes = await sendMessageToDify(userMessage.text);

      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        text: difyRes.answer ?? '（回答が空でした）',
        sender: 'ai',
        timestamp: new Date(),
      };

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
    } catch (err) {
      console.error('Dify API error', err);
    } finally {
      setIsTyping(false);
    }
  };

  return {
    chatSessions,
    currentChatId,
    messages,
    isTyping,
    selectChat,
    createNewChat,
    deleteChat,
    sendMessage,
  };
};