'use client';

import React, { useState } from 'react';
import { useChatSessions } from './hooks/useChatSessions';
import { useClipboard } from './hooks/useClipboard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import { globalStyles } from './utils/styles';

const AIChatApp: React.FC = () => {
  const {
    chatSessions,
    currentChatId,
    messages,
    isTyping,
    selectChat,
    createNewChat,
    deleteChat,
    sendMessage,
  } = useChatSessions();

  const { copiedMessageId, copyToClipboard } = useClipboard();
  
  const [inputText, setInputText] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);


  const handleSelectChat = (id: number) => {
    selectChat(id);
    setIsSidebarOpen(false);
  };

  const handleCreateNewChat = () => {
    createNewChat();
    setIsSidebarOpen(false);
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
