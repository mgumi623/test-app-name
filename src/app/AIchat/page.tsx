'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChatSessions } from './hooks/useChatSessions';
import { useClipboard } from './hooks/useClipboard';
import { ModeType } from './components/Header';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true); // PCではデフォルトで開く
  const [selectedMode, setSelectedMode] = useState<ModeType>('通常');
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState<boolean>(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState<boolean>(true);
  const [modeBanner, setModeBanner] = useState<{ text: string; visible: boolean }>({ text: '', visible: false });
  const bannerTimerRef = useRef<number | null>(null);

  const {
    messages,
    isTyping,
    isLoading,
    error,
    currentMode,
    setCurrentMode,
    sendMessage,
    loadCurrentSession,
    deleteAllChats,
    createSession
  } = useChatSessions({
    initialMode: selectedMode
  });

  const { copiedMessageId, copyToClipboard } = useClipboard();

  const handleModeChange = (newMode: ModeType) => {
    setSelectedMode(newMode);
    setCurrentMode(newMode);
    // モード変更ポップアップを表示
    if (bannerTimerRef.current) {
      window.clearTimeout(bannerTimerRef.current);
      bannerTimerRef.current = null;
    }
    setModeBanner({ text: `${newMode}モードに切り替えました`, visible: true });
    bannerTimerRef.current = window.setTimeout(() => {
      setModeBanner({ text: '', visible: false });
      bannerTimerRef.current = null;
    }, 2200);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    await sendMessage(inputText);
    setInputText('');
  };

  // ヒーローUIの提案チップ用：テキストを即送信
  const handleSendQuick = async (text: string) => {
    if (!text.trim()) return;
    await sendMessage(text);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 日本語入力中(IME構成中)はEnterで送信しない
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isComposing = (e.nativeEvent as any)?.isComposing || e.key === 'Process';
    if (isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      await handleSendMessage();
    }
  };

  // 開始時のヒーロー入力用（input）
  const handleHeroKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 日本語入力中(IME構成中)はEnterで送信しない
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isComposing = (e.nativeEvent as any)?.isComposing || e.key === 'Process';
    if (isComposing) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      await handleSendMessage();
    }
  };

  const handleNewChat = () => {
    createSession();
  };

  // レスポンシブ対応：PCでは開く、スマホでは閉じる
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // 初期設定
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // スクロールに応じてヘッダーの表示/非表示を制御
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsHeaderVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    loadCurrentSession();
  }, [loadCurrentSession]);

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.mode-dropdown')) {
        setIsModeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 以前は isLoading 中に全画面の LoadingUI を返していたが、
  // 送信後もチャット画面を維持したいため早期 return はしない。

  return (
    <>
      <style>{globalStyles}</style>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Mobile Overlay (Selectページと同じ挙動) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        {/* サイドバー - Selectページと同じ配色 */}
        <motion.div 
          initial={{ x: -320 }}
          animate={{ x: isSidebarOpen ? 0 : -320 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`w-64 lg:w-72 bg-[#e8f5e8] border-r border-green-200 fixed inset-y-0 left-0 z-50 lg:fixed shadow-xl`}
        >
          <div className="flex items-center justify-between p-4 border-b border-green-200 bg-[#e8f5e8]">
            <div className="flex items-center gap-3">
              <motion.img 
                src="/image/clover.svg" 
                alt="Clover" 
                className="w-8 h-8"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <h2 className="text-xl font-semibold text-gray-800">AI Assistant</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-full hover:bg-green-50 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>
          
          {/* 新規チャットボタン */}
          <div className="p-4 border-b border-green-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNewChat}
              className="group w-full px-4 py-2 text-left rounded-lg border border-green-200 bg-white shadow-sm hover:shadow-md hover:bg-green-50 transition-all duration-200 flex items-center gap-3"
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-green-50 text-green-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </span>
              <span className="font-medium text-gray-700">新規チャット</span>
            </motion.button>
          </div>

          {/* チャット管理セクション */}
          <div className="flex-1 p-4">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 px-2 border-b border-gray-200 pb-2">
                チャット管理
              </h3>
              {/* チャット履歴の表示エリア（将来的に実装） */}
              <div className="text-sm text-gray-600">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center py-8 text-gray-500"
                >
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  チャット履歴がここに表示されます
                </motion.div>
              </div>
            </div>
          </div>

          {/* チャット履歴クリアボタン - サイドバーの下に配置 */}
          <div className="p-4 border-t border-green-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={deleteAllChats}
              className="group w-full px-4 py-2 text-left rounded-lg border border-red-200 bg-white shadow-sm hover:shadow-md hover:bg-red-50 transition-all duration-200 flex items-center gap-3 text-red-600"
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-red-50 text-red-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </span>
              <span className="font-medium">チャット履歴をクリア</span>
            </motion.button>
          </div>
        </motion.div>

        {/* メインコンテンツエリア */}
        <div className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
          {/* サイドバーが閉じている時の開くアイコン */}
          {!isSidebarOpen && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSidebarOpen(true)}
              className="fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 lg:hidden"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>
          )}

          {/* ヘッダー - 上部固定表示 */}
          <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 lg:hidden"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </motion.button>
                {/* デスクトップ用ハンバーガー - サイドバーが閉じている時のみ表示 */}
                {!isSidebarOpen && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsSidebarOpen(true)}
                    className="hidden lg:flex p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </motion.button>
                )}
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2">
                    <motion.img 
                      src="/image/clover.svg" 
                      alt="Clover" 
                      className="w-8 h-8"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="relative mode-dropdown">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                        className="flex items-center gap-2 text-lg font-semibold text-gray-800 hover:text-gray-600 transition-all duration-200"
                      >
                        <span>{selectedMode}モード</span>
                        <motion.svg 
                          className="w-4 h-4" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          animate={{ rotate: isModeDropdownOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      </motion.button>
                      
                      {/* モード選択ドロップダウン */}
                      <AnimatePresence>
                        {isModeDropdownOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] backdrop-blur-sm"
                          >
                            <div className="py-2">
                              {[
                                { key: '通常', label: '通常モード' },
                                { key: '脳血管', label: '脳血管モード' },
                                { key: '感染マニュアル', label: '感染マニュアルモード' },
                                { key: '議事録作成', label: '議事録作成モード' },
                                { key: '文献検索', label: '文献検索モード' }
                              ].map((mode) => (
                                <motion.button
                                  key={mode.key}
                                  whileHover={{ backgroundColor: '#f0f9ff' }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => {
                                    handleModeChange(mode.key as ModeType);
                                    setIsModeDropdownOpen(false);
                                  }}
                                  className={`w-full px-4 py-3 text-left transition-all duration-200 ${
                                    selectedMode === mode.key ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {mode.label}
                                </motion.button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  {/* モード表示は上のボタンに統合 */}
                </div>
              </div>
            </div>
          </div>

          {/* モード変更ポップアップバナー */}
          <AnimatePresence>
            {modeBanner.visible && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="px-4 mt-3 z-40"
              >
                {(() => {
                  const accent = {
                    '通常': { bar: 'from-emerald-400 to-teal-400', ring: 'ring-emerald-500/20', icon: 'text-emerald-600' },
                    '脳血管': { bar: 'from-violet-400 to-fuchsia-400', ring: 'ring-violet-500/20', icon: 'text-violet-600' },
                    '感染マニュアル': { bar: 'from-amber-400 to-orange-400', ring: 'ring-amber-500/20', icon: 'text-amber-600' },
                    '議事録作成': { bar: 'from-sky-400 to-cyan-400', ring: 'ring-sky-500/20', icon: 'text-sky-600' },
                    '文献検索': { bar: 'from-indigo-400 to-blue-400', ring: 'ring-indigo-500/20', icon: 'text-indigo-600' },
                  }[selectedMode] || { bar: 'from-emerald-400 to-teal-400', ring: 'ring-emerald-500/20', icon: 'text-emerald-600' };
                  return (
                    <div className={`relative max-w-3xl mx-auto flex items-center justify-between px-5 py-3.5 bg-white/90 backdrop-blur border border-gray-200 rounded-2xl shadow-md ring-1 ${accent.ring}`}>
                      <div className="absolute -top-[2px] left-3 right-3 h-[2px] rounded-full bg-gradient-to-r ${accent.bar}"></div>
                      <div className="flex items-center gap-2.5 text-gray-800">
                        <svg className={`w-4.5 h-4.5 ${accent.icon}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
                        </svg>
                        <span className="text-sm font-medium tracking-wide">{modeBanner.text}</span>
                      </div>
                      <button
                        onClick={() => setModeBanner({ text: '', visible: false })}
                        className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                        aria-label="閉じる"
                        title="閉じる"
                      >
                        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* エラーメッセージ */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-4 rounded-xl shadow-sm"
              >
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* メッセージエリア or 開始時ヒーローUI */}
          {(() => {
            const showHero = ((messages.length === 0) || messages.every(m => m.type === 'system')) && !isTyping;
            if (showHero) {
              const heroText = '今日は何をしましょう？';

              // 提案チップは廃止

              return (
                <div className="flex-1 relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_50%)]" />
                  <div className="relative h-full flex items-center justify-center">
                    <div className="w-full max-w-3xl px-6 text-center">
                      <h1 className="text-4xl md:text-6xl font-bold mb-20">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">{heroText}</span>
                      </h1>

                      <div className="relative mb-20">
                        <input
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyDown={handleHeroKeyDown}
                          placeholder="例: 週報の文章を整えて"
                          className="w-full h-16 rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm ring-1 ring-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 pl-12 pr-28 text-gray-900"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600/80">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="M21 21l-4.3-4.3"></path>
                          </svg>
                        </span>
                        <button
                          onClick={() => handleSendMessage()}
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-black text-white shadow-sm hover:bg-gray-800 active:bg-gray-900 transition-colors"
                          aria-label="送信"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                          </svg>
                        </button>
                      </div>

                      
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <div className="flex-1 overflow-auto pb-28 pt-12">
                <MessageList
                  messages={messages}
                  isTyping={isTyping}
                  copiedMessageId={copiedMessageId}
                  onCopyMessage={(messageId) => {
                    const message = messages.find(m => m.id === messageId);
                    if (message) {
                      copyToClipboard(message.text, messageId);
                    }
                  }}
                />
              </div>
            );
          })()}

          {/* 入力欄 - 下部固定表示（ヒーローUI時は非表示） */}
          {!(((messages.length === 0) || messages.every(m => m.type === 'system')) && !isTyping) && (
            <div className={`fixed bottom-0 right-0 z-50 w-full lg:w-auto ${isSidebarOpen ? 'lg:left-72' : 'lg:left-0'}`}>
              <MessageInput
                inputText={inputText}
                isTyping={isTyping}
                onInputChange={setInputText}
                onSendMessage={handleSendMessage}
                onKeyDown={handleKeyDown}
                selectedMode={selectedMode}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const AIChatPage = () => {
  return <AIChatApp />;
};

export default AIChatPage;