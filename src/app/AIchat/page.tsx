'use client';

import React, { useState, useEffect } from 'react';
import { useChatSessions } from './hooks/useChatSessions';
import { useClipboard } from './hooks/useClipboard';
import { usePageTracking, useAnalytics } from '../../hooks/useAnalytics';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Header, { ModeType } from './components/Header';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import { globalStyles } from './utils/styles';

const AIChatApp: React.FC = () => {
  const { user } = useAuth();
  const [inputText, setInputText] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selectedMode, setSelectedMode] = useState<ModeType>('通常');
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);

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
    setCurrentMode
  } = useChatSessions({
    initialMode: selectedMode,
    batchSize: 10,
    batchDelay: 100,
    cacheTTL: 5 * 60 * 1000
  });

  const { copiedMessageId, copyToClipboard } = useClipboard();
  const { trackFeatureUse } = useAnalytics();

  // ページビュー追跡
  usePageTracking();


  const handleSelectChat = (id: string) => {
    selectChat(id);
    setIsSidebarOpen(false);
    trackFeatureUse('chat_select');
  };

  const handleModeChange = (newMode: ModeType) => {
    setSelectedMode(newMode);
    if (setCurrentMode) {
      setCurrentMode(newMode);
    }
  };

  const handleCreateNewChat = () => {
    createNewChat();
    setIsSidebarOpen(false);
    trackFeatureUse('create_new_chat');
  };

  const handleSendMessage = async (audioFile?: File) => {
    if (!inputText.trim() && !audioFile) return;
    const messageText = inputText.trim();
    setInputText(''); // 先にクリアする
    if (audioFile) {
      setSelectedAudioFile(null); // 音声ファイルもクリア
    }
    await sendMessage(messageText, audioFile);
  };

  const handleFileSelect = (file: File) => {
    setSelectedAudioFile(file);
    // 音声ファイルが選択されたことをテキストエリアに反映
    if (!inputText.trim()) {
      setInputText(`音声ファイル「${file.name}」を分析してください。`);
    }
  };

  const handleFileRemove = () => {
    setSelectedAudioFile(null);
    // テキストもクリア（必要に応じて）
    if (inputText.includes('音声ファイル「') && inputText.includes('」を分析してください。')) {
      setInputText('');
    }
  };

  // モード変更時に音声ファイルをクリア
  useEffect(() => {
    if (selectedMode !== '議事録作成') {
      setSelectedAudioFile(null);
    }
  }, [selectedMode]);

  const handleKeyDown = async (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleSendMessage();
    }
  };

  console.log('Render state:', { isLoading, user: !!user });
  
  if (isLoading) {
    return (
      <>
        <style>{globalStyles}</style>
        <div className="flex min-h-screen bg-gray-50 items-center justify-center">
          <div className="text-center">
            <style>{`
              @keyframes smooth-spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes fade {
                0%, 100% { opacity: 0; }
                20%, 80% { opacity: 1; }
              }
              .smooth-spin {
                animation: smooth-spin 3s ease-in-out infinite;
              }
              .fade-message {
                animation: fade 3s infinite;
              }
            `}</style>
            <div className="flex flex-col items-center gap-4">
              <img 
                src="/image/clover.svg" 
                alt="Loading" 
                className="w-16 h-16 smooth-spin"
              />
              <div className="relative h-5 overflow-hidden">
                <p className="text-sm text-muted-foreground absolute inset-0 fade-message" style={{ animationDelay: '0s' }}>
                  チャット履歴を読み込み中...
                </p>
                <p className="text-sm text-muted-foreground absolute inset-0 fade-message" style={{ animationDelay: '3s' }}>
                  もう少々お待ちください...
                </p>
                <p className="text-sm text-muted-foreground absolute inset-0 fade-message" style={{ animationDelay: '6s' }}>
                  データを取得しています...
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{globalStyles}</style>
      <div className="flex min-h-screen bg-white">
        <Sidebar
          isOpen={isSidebarOpen}
          chatSessions={chatSessions}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onCreateNewChat={handleCreateNewChat}
          onDeleteChat={(chatId: string) => {
            deleteChat(chatId);
          }}
          onCloseSidebar={() => setIsSidebarOpen(false)}
        />

        <div
          className={`flex flex-col flex-1 h-screen overflow-hidden transition-all duration-300 ${
            isSidebarOpen ? 'ml-80' : ''
          }`}
        >
          <Header
            selectedMode={selectedMode}
            onModeChange={handleModeChange}
            currentChatId={currentChatId}
            onSendMessage={sendMessage}
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
              selectedMode={selectedMode}
              selectedAudioFile={selectedAudioFile}
              onInputChange={setInputText}
              onSendMessage={handleSendMessage}
              onKeyDown={handleKeyDown}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChatApp;
