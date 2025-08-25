'use client';

import { useState } from 'react';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { Message } from '@/types/chat';
import { sendMessageToDify } from '@/lib/dify';

function generateId(): string {
  return Math.random().toString(36).substring(2);
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (text: string) => {
    // ユーザーメッセージを追加
    const userMessage: Message = {
      id: generateId(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // 読み込み状態を設定
    setIsLoading(true);

    try {
      // DiFyにメッセージを送信
      const response = await sendMessageToDify({
        prompt: text,
        mode: '通常'
      });

      // AIの応答を追加
      const aiMessage: Message = {
        id: generateId(),
        text: response.answer,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      // エラーメッセージを表示
      const errorMessage: Message = {
        id: generateId(),
        text: 'エラーが発生しました。もう一度お試しください。',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <MessageList messages={messages} />
      </div>
      <MessageInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
