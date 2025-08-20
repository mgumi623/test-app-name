'use client';

import React, { useState, useEffect } from 'react';
import { useChatSessions } from './hooks/useChatSessions';
import { useClipboard } from './hooks/useClipboard';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Header, { ModeType } from './components/Header';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import { globalStyles } from './utils/styles';
import { AnimatePresence, motion } from 'framer-motion';

const AIChatApp: React.FC = () => {
  const { user } = useAuth();
  const [inputText, setInputText] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selectedMode, setSelectedMode] = useState<ModeType>('通常');
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const {
    currentSession,
    sessions,
    messages,
    isTyping,
    isLoading,
    selectChat,
    createNewChat,
    deleteChat,
    deleteAllChats,
    sendMessage,            // hook の実送信関数
    setCurrentMode,
    loadCurrentSession
  } = useChatSessions({
    initialMode: selectedMode,
    batchSize: 10,
    batchDelay: 100,
    cacheTTL: 5 * 60 * 1000
  });

  const { copiedMessageId, copyToClipboard } = useClipboard();

  const handleSelectChat = (id: string) => {
    selectChat(id);
    setIsSidebarOpen(false);
  };

  const [showModeNotification, setShowModeNotification] = useState(false);
  const [notificationMode, setNotificationMode] = useState<ModeType>('通常');

  const handleModeChange = (newMode: ModeType) => {
    setSelectedMode(newMode);
    if (setCurrentMode) setCurrentMode(newMode);
    setNotificationMode(newMode);
    setShowModeNotification(true);
    setTimeout(() => setShowModeNotification(false), 2000);
  };

  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const handleCreateNewChat = async () => {
    // 重複実行を防ぐ
    if (isCreatingChat || isLoading) {
      console.log('[AIChat] Already creating chat or loading, skipping...');
      return;
    }

    try {
      console.log('[AIChat] Creating new chat...');
      setIsCreatingChat(true);
      
      await createNewChat();
      
      // セッション一覧を強制的に更新
      setTimeout(() => {
        console.log('[AIChat] Refreshing sessions after new chat creation');
        // セッション一覧を再読み込み
        window.location.reload();
      }, 500);
      
      setIsSidebarOpen(false);
    } catch (error) {
      console.error('[AIChat] Error creating new chat:', error);
    } finally {
      setIsCreatingChat(false);
    }
  };

  /**
   * 送信ラッパー
   * - 引数未指定なら state の選択ファイルを使用（★送信経路を単一化）
   * - 送信成功後に UI をクリア（★失敗時の取りこぼし防止）
   */
  const handleSendMessage = async (audioFile?: File, imageFile?: File) => {
    const messageText = inputText.trim();

    // ★ 引数がなければ state を採用
    const audioToSend = audioFile ?? selectedAudioFile ?? null;
    const imageToSend = imageFile ?? selectedImageFile ?? null;

    console.log('[AIChat] handleSendMessage:', {
      hasText: !!messageText,
      hasAudioFile: !!audioToSend,
      hasImageFile: !!imageToSend,
      audioFileName: audioToSend?.name,
      imageFileName: imageToSend?.name,
      selectedImageFileState: selectedImageFile?.name,
      selectedAudioFileState: selectedAudioFile?.name,
      mode: selectedMode,
    });

    if (!messageText && !audioToSend && !imageToSend) return;

    try {
      // ★ まず送る（hook 側で FormData を構築）
      await sendMessage(messageText, audioToSend ?? undefined, imageToSend ?? undefined);

      // ★ 成功後にクリア（失敗時は保持）
      setInputText('');
      if (audioToSend) setSelectedAudioFile(null);
      if (imageToSend) setSelectedImageFile(null);
    } catch (error) {
      console.error('Error sending message:', error);
      // エラー時は状態を保持して再送信可能にする
    }
  };

  const handleAudioFileSelect = (file: File) => {
    setSelectedAudioFile(file);
    if (!inputText.trim()) setInputText(`音声ファイル「${file.name}」を分析してください。`);
  };

  const handleAudioFileRemove = () => {
    setSelectedAudioFile(null);
    if (inputText.includes('音声ファイル「') && inputText.includes('」を分析してください。')) {
      setInputText('');
    }
  };

  const handleImageFileSelect = (file: File) => {
    setSelectedImageFile(file);
    if (!inputText.trim()) setInputText(`画像ファイル「${file.name}」を分析してください。`);
  };

  const handleImageFileRemove = () => {
    setSelectedImageFile(null);
    if (inputText.includes('画像ファイル「') && inputText.includes('」を分析してください。')) {
      setInputText('');
    }
  };

  // モード切替時の整合性（必要に応じて調整）
  useEffect(() => {
    if (selectedMode !== '議事録作成') setSelectedAudioFile(null);
    // 画像を全モードで許容するなら下行は削除
    if (selectedMode !== '通常') setSelectedImageFile(null);
  }, [selectedMode]);

  const didInitRef = React.useRef(false);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const initializeSession = async () => {
      try {
        console.log('[AIChat] Initializing session...');
        await loadCurrentSession();
        console.log('[AIChat] Session initialized successfully');
      } catch (error) {
        console.error('[AIChat] Failed to initialize session:', error);
      }
    };

    // ユーザーが認証されている場合のみ初期化
    if (user?.id) {
      initializeSession();
    } else {
      console.log('[AIChat] No user ID, skipping initialization');
    }

    // 安全装置：20秒で強制解除
    const safetyTimeout = setTimeout(() => {
      console.warn('[AIChat] Safety timeout: forcing loading to false');
      if (isLoading) {
        console.warn('[AIChat] Reloading page due to timeout');
        window.location.reload();
      }
    }, 20000);

    return () => clearTimeout(safetyTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ★ Enter送信でも state のファイルを確実に拾う
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleSendMessage(selectedAudioFile ?? undefined, selectedImageFile ?? undefined);
    }
  };

  if (isLoading) {
    return (
      <>
        <style>{globalStyles}</style>
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
                  {user?.id ? 'チャット履歴を読み込み中...' : '認証状態を確認中...'}
                </p>
                <p className="text-sm text-muted-foreground absolute inset-0 fade-message" style={{ animationDelay: '3s' }}>
                  もう少々お待ちください...
                </p>
                <p className="text-sm text-muted-foreground absolute inset-0 fade-message" style={{ animationDelay: '6s' }}>
                  データを取得しています...
                </p>
                <p className="text-sm text-muted-foreground absolute inset-0 fade-message" style={{ animationDelay: '9s' }}>
                  接続を確認中...
                </p>
              </div>
            </div>
            {/* デバッグ情報 */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 text-xs text-gray-400">
                <p>User ID: {user?.id || 'Not authenticated'}</p>
                <p>Loading: {isLoading ? 'true' : 'false'}</p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{globalStyles}</style>
      <div className="flex min-h-screen bg-white relative">
        <AnimatePresence>
          {showModeNotification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50"
            >
              {notificationMode}モードに切り替えました
            </motion.div>
          )}
        </AnimatePresence>

        <Sidebar
          isOpen={isSidebarOpen}
          currentSession={currentSession}
          sessions={sessions}
          currentChatId={currentSession?.id || ''}
          onSelectChat={handleSelectChat}
          onCreateNewChat={handleCreateNewChat}
          onDeleteChat={(chatId: string) => { deleteChat(chatId); }}
          onDeleteAllChats={deleteAllChats}
          onCloseSidebar={() => setIsSidebarOpen(false)}
          isLoading={isLoading || isCreatingChat}
        />

        <div
          className={`flex flex-col flex-1 h-screen overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'ml-80' : ''}`}
        >
          <Header
            selectedMode={selectedMode}
            onModeChange={handleModeChange}
            currentChatId={currentSession?.id}
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
              selectedImageFile={selectedImageFile}
              onInputChange={setInputText}
              onSendMessage={handleSendMessage}  // ★ 入力欄の送信も同じラッパー
              onKeyDown={handleKeyDown}
              onAudioFileSelect={handleAudioFileSelect}
              onAudioFileRemove={handleAudioFileRemove}
              onImageFileSelect={handleImageFileSelect}
              onImageFileRemove={handleImageFileRemove}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChatApp;
