'use client';

import React, { useState, useEffect } from 'react';
import { useChatSessions } from './hooks/useChatSessions';
import { useClipboard } from './hooks/useClipboard';
import Sidebar from './components/Sidebar';
import Header, { ModeType } from './components/Header';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import { globalStyles } from './utils/styles';
import { AnimatePresence, motion } from 'framer-motion';

const LoadingUI = () => (
  <div className="flex min-h-screen bg-gray-50 items-center justify-center">
    <div className="text-center">
      <style>{`
        @keyframes fade { 0%,100% { opacity: 0;} 20%,80% { opacity: 1;} }
        .fade-message { animation: fade 3s infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .smooth-spin { animation: spin 2s linear infinite; }
      `}</style>
      <div className="flex flex-col items-center gap-4">
        <img src="/image/clover.svg" alt="Loading" className="w-16 h-16 smooth-spin" />
        <div className="relative h-5 overflow-hidden">
          <p className="text-sm text-muted-foreground absolute inset-0 fade-message" style={{ animationDelay: '0s' }}>
            AIチャットを準備中...
          </p>
          <p className="text-sm text-muted-foreground absolute inset-0 fade-message" style={{ animationDelay: '3s' }}>
            もう少々お待ちください...
          </p>
        </div>
      </div>
    </div>
  </div>
);

const AIChatApp: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selectedMode, setSelectedMode] = useState<ModeType>('通常');

  const {
    messages,
    isTyping,
    isLoading,
    error,
    currentMode,
    setCurrentMode,
    sendMessage,
    loadCurrentSession,
    deleteAllChats
  } = useChatSessions({
    initialMode: selectedMode
  });

  const { copiedMessageId, copyToClipboard } = useClipboard();

  const handleModeChange = (newMode: ModeType) => {
    setSelectedMode(newMode);
    setCurrentMode(newMode);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    await sendMessage(inputText);
    setInputText('');
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleSendMessage();
    }
  };

  useEffect(() => {
    loadCurrentSession();
  }, [loadMessages]);

  if (isLoading) {
    return <LoadingUI />;
  }

  return (
    <>
      <style>{globalStyles}</style>
      <div className="flex min-h-screen bg-white relative">
        <Sidebar
          isOpen={isSidebarOpen}
          onCloseSidebar={() => setIsSidebarOpen(false)}
          onClearChat={clearChat}
        />

        <div className={`flex flex-col flex-1 h-screen overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'ml-80' : ''}`}>
          <Header
            selectedMode={selectedMode}
            onModeChange={handleModeChange}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex flex-col flex-1 overflow-hidden">
            <MessageList
              messages={messages}
              isTyping={isTyping}
              copiedMessageId={copiedMessageId}
              onCopyMessage={copyToClipboard}
            />

            <MessageInput
              inputText={inputText}
              isTyping={isTyping}
              onInputChange={setInputText}
              onSendMessage={handleSendMessage}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChatApp;