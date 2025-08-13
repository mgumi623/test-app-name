'use client';

import React, { useState } from 'react';
import { useChatSessions } from './hooks/useChatSessions';
import { useClipboard } from './hooks/useClipboard';
import { usePageTracking, useAnalytics } from '../../hooks/useAnalytics';
import Sidebar from './components/Sidebar';
import Header, { ModeType } from './components/Header';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import { globalStyles } from './utils/styles';

const AIChatApp: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selectedMode, setSelectedMode] = useState<ModeType>('通常');

  const {
    chatSessions,
    currentChatId,
    messages,
    isTyping,
    isLoading,
    selectChat,
    createNewChat,
    deleteChat,
    sendMessage,
  } = useChatSessions(selectedMode);

  const { copiedMessageId, copyToClipboard } = useClipboard();
  const { trackFeatureUse } = useAnalytics();

  // ページビュー追跡
  usePageTracking();


  const handleSelectChat = (id: string) => {
    selectChat(id);
    setIsSidebarOpen(false);
    trackFeatureUse('chat_select');
  };

  const handleCreateNewChat = () => {
    createNewChat();
    setIsSidebarOpen(false);
    trackFeatureUse('create_new_chat');
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const messageText = inputText.trim();
    setInputText(''); // 先にクリアする
    await sendMessage(messageText);
  };

  const handleKeyDown = async (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <>
        <style>{globalStyles}</style>
        <div className="flex min-h-screen bg-gray-50 items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">チャット履歴を読み込み中...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{globalStyles}</style>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          isOpen={isSidebarOpen}
          chatSessions={chatSessions}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onCreateNewChat={handleCreateNewChat}
          onDeleteChat={deleteChat}
          onCloseSidebar={() => setIsSidebarOpen(false)}
        />

        <div
          className={`flex flex-col flex-1 h-screen overflow-hidden transition-all duration-300 ${
            isSidebarOpen ? 'ml-80' : ''
          }`}
        >
          <Header
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            selectedMode={selectedMode}
            onModeChange={setSelectedMode}
          />

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
              selectedMode={selectedMode}
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
