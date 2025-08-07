'use client';

import React, { useEffect, useRef, useState } from 'react';
import { sendMessageToDify } from '../../lib/dify';
import {
  Send,
  Bot,
  User,
  Sparkles,
  MessageSquare,
  Plus,
  Menu,
  X,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';

/***
 * 型定義
 */
interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatSession {
  id: number;
  title: string;
  messages: ChatMessage[];
  lastMessage: Date;
}

/***
 * メインコンポーネント
 */
const AIChatApp: React.FC = () => {
  /* --------------------------------------------------
   * state & refs
   * -------------------------------------------------- */
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
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  /* --------------------------------------------------
   * convenience getters
   * -------------------------------------------------- */
  const currentChat = chatSessions.find((c) => c.id === currentChatId);
  const messages = currentChat?.messages ?? [];

  /* --------------------------------------------------
   * utils
   * -------------------------------------------------- */
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  /** クリップボードコピー */
  const copyToClipboard = async (text: string, messageId: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch {
      /* noop */
    }
  };

  /** チャットタイトルを最初の発言に合わせて更新 */
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

  /* --------------------------------------------------
   * side-effects
   * -------------------------------------------------- */
  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (!inputRef.current) return;
    const el = inputRef.current;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [inputText]);

  /* --------------------------------------------------
   * event handlers
   * -------------------------------------------------- */
  const selectChat = (id: number) => {
    setCurrentChatId(id);
    setIsSidebarOpen(false);
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
    setIsSidebarOpen(false);
  };

  const deleteChat = (
    chatId: number,
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation();
    if (chatSessions.length === 1) return; // 最後の1件は削除不可
    setChatSessions((prev) => {
      const updated = prev.filter((c) => c.id !== chatId);
      if (currentChatId === chatId) setCurrentChatId(updated[0].id);
      return updated;
    });
  };

  /** メッセージ送信 */
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    // ユーザー発言をローカルに追加
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

    // 表示更新用
    updateChatTitle(currentChatId, userMessage.text);
    setInputText('');
    setIsTyping(true);

    try {
      /** Dify へ問い合わせ */
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
      // 必要に応じてユーザーにエラーを表示
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = async (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleSendMessage();
    }
  };

  /* --------------------------------------------------
   * markup
   * -------------------------------------------------- */
  return (
    <>
      {/* --- 省略可: グローバルCSS アニメーション & スクロールバー --- */}
      <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        .animate-fade-in { animation: fade-in 0.5s ease-out }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards }
        .animate-slow { animation-duration: 3s }
        .animate-delay-100 { animation-delay: 0.1s }
        .animate-delay-200 { animation-delay: 0.2s }
        ::-webkit-scrollbar { width: 6px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25) }
      `}</style>

      <div className="flex min-h-screen bg-black">
        {/* --------------------------------------------------
         * Sidebar
         * -------------------------------------------------- */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-80 bg-black transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-screen">
            {/* header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">チャット履歴</h2>
              <div className="flex gap-2">
                <button
                  onClick={createNewChat}
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-transform hover:scale-105"
                >
                  <Plus className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-transform hover:scale-105"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* chat list */}
            <div className="flex-1 overflow-y-auto p-2">
              {chatSessions.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => selectChat(chat.id)}
                  className={`group flex items-center justify-between p-3 mb-2 rounded-lg cursor-pointer hover:bg-white/10 transition ${
                    chat.id === currentChatId ? 'bg-white/15 border border-white/20' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{chat.title}</p>
                      <p className="text-xs text-gray-400">
                        {chat.lastMessage.toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                  {chatSessions.length > 1 && (
                    <button
                      onClick={(e) => deleteChat(chat.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-400 hover:bg-red-500/20 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* --------------------------------------------------
         * Main content area
         * -------------------------------------------------- */}
        <div
          className={`flex flex-col flex-1 h-screen overflow-hidden transition-all duration-300 ${
            isSidebarOpen ? 'ml-80' : ''
          }`}
        >
          {/* header */}
          <div className="z-10 w-full backdrop-blur-xl bg-white/10 border-b border-white/20 p-4 sm:p-6">
            <div className="relative flex items-center justify-between animate-fade-in">
              {/* sidebar toggle */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
                aria-label="Toggle Sidebar"
              >
                {isSidebarOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </button>

              {/* logo */}
              <div className="absolute inset-x-0 flex items-center justify-center pointer-events-none">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 shadow-lg">
                    <Sparkles className="w-6 h-6 text-white animate-spin animate-slow" />
                  </div>
                  <div className="text-center">
                    <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                      AI Assistant
                    </h1>
                    <p className="text-sm text-gray-300">いつでもお手伝いします</p>
                  </div>
                </div>
              </div>

              {/* placeholder to keep center aligned */}
              <div className="w-10 h-10" />
            </div>
          </div>

          {/* messages + input */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth w-full">
              {messages.map((message, idx) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  } animate-fade-in-up`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div
                    className={`flex items-start space-x-3 w-full px-4 ${
                      message.sender === 'user'
                        ? 'flex-row-reverse space-x-reverse'
                        : ''
                    }`}
                  >
                    {/* avatar */}
                    <div
                      className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-lg flex-shrink-0 transition-transform hover:scale-110 ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-green-400 to-blue-500'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500'
                      }`}
                    >
                      {message.sender === 'user' ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </div>

                    {/* bubble */}
                    <div
                      className={`relative group backdrop-blur-xl border border-white/20 rounded-2xl p-3 sm:p-4 shadow-lg transition hover:shadow-xl ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 max-w-[85%]'
                          : 'bg-white/10 max-w-[95%]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm sm:text-base text-white whitespace-pre-wrap">
                          {message.text}
                        </p>
                        <button
                          onClick={() => copyToClipboard(message.text, message.id)}
                          className="ml-2 opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition"
                          title="メッセージをコピー"
                        >
                          {copiedMessageId === message.id ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-white" />
                          )}
                        </button>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        {message.timestamp.toLocaleTimeString('ja-JP', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* typing indicator */}
              {isTyping && (
                <div className="flex justify-start w-full px-4 animate-fade-in">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg" />
                    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-3 sm:p-4 shadow-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce animate-delay-100" />
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce animate-delay-200" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* input */}
            <div className="backdrop-blur-xl bg-white/10 border-t border-white/20 p-4 sm:p-6 w-full">
              <div className="flex items-end space-x-3 w-full px-4">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="メッセージを入力してください..."
                  className="w-full resize-none min-h-[50px] max-h-32 rounded-xl border border-white/20 bg-white/10 p-3 sm:p-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isTyping}
                  className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg transition hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChatApp;
