'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ImagePreview from '@/components/ImagePreview';
import { useConversation } from '@/hooks/useConversation';
import { useStreamingChat, ChatMessage } from '@/hooks/useStreamingChat';
import { Loading } from '@/components/ui/loading';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ChatPage() {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { conversationId, setConversationId, clearConversation } = useConversation();
  const { messages, isLoading, error, sendMessage, clearMessages } = useStreamingChat(
    conversationId,
    setConversationId
  );

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('サポートされている形式: JPG, PNG, WebP');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert('ファイルサイズは5MB以下にしてください');
      return;
    }

    setSelectedImage(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!inputText.trim() && !selectedImage) return;

    const text = inputText.trim();
    const image = selectedImage;

    // Clear input
    setInputText('');
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    await sendMessage(text, image || undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClearChat = () => {
    clearMessages();
    clearConversation();
  };

  const renderMessage = (message: ChatMessage) => (
    <div
      key={message.id}
      className={`mb-4 ${message.isUser ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'}`}
    >
      <div
        className={`p-3 rounded-lg ${
          message.isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {message.imageUrl && (
          <div className="mb-2">
            <img
              src={message.imageUrl}
              alt="Uploaded"
              className="max-w-full h-auto rounded border"
            />
          </div>
        )}
        <p className="whitespace-pre-wrap">{message.content}</p>
        <div className={`text-xs mt-1 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">AI Chat with Image Support</h1>
        <Button
          variant="outline"
          onClick={handleClearChat}
          className="flex items-center space-x-1"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Chat</span>
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p>メッセージを入力するか、画像をアップロードしてチャットを開始してください。</p>
          </div>
        )}
        
        {messages.map(renderMessage)}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">
            エラー: {error}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        {selectedImage && (
          <div className="mb-3">
            <ImagePreview file={selectedImage} onRemove={handleRemoveImage} />
          </div>
        )}

        <div className="flex items-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex-shrink-0"
          >
            <Image className="w-4 h-4" />
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleImageSelect}
            className="hidden"
          />

          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            className="flex-1 min-h-[44px] max-h-32 resize-none"
            disabled={isLoading}
          />

          <Button
            onClick={handleSubmit}
            disabled={isLoading || (!inputText.trim() && !selectedImage)}
            className="flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {isLoading && (
          <div className="text-center text-gray-500 mt-2">
            <div className="inline-flex items-center gap-2">
              <Loading size="sm" variant="fast" />
              送信中...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
