import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ModeType } from '../components/Header';

interface MessageInputProps {
  inputText: string;
  isTyping: boolean;
  onInputChange: (text: string) => void;
  onSendMessage: (options?: { imageFiles?: File[]; audioFile?: File | null }) => Promise<void>;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  selectedMode: ModeType;
}

const MessageInput: React.FC<MessageInputProps> = ({
  inputText,
  isTyping,
  onInputChange,
  onSendMessage,
  onKeyDown,
  selectedMode
}) => {
  const [attachedCount, setAttachedCount] = useState<number>(0);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [showSendAnim, setShowSendAnim] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const inputId = 'aichat-attach-input';

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const list = Array.from(files);
    setAttachedFiles(list);
    setAttachedCount(list.length);
    setProgress(0);
    const step = () => setProgress((p) => (p < 95 ? p + 5 : p));
    const timer = window.setInterval(step, 120);
    window.setTimeout(() => {
      window.clearInterval(timer);
      setProgress(100);
      window.setTimeout(() => setProgress(0), 600);
    }, 1800);
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setAttachedCount(next.length);
      return next;
    });
  };

  const showImageAttach = selectedMode === '通常';
  const showAudioAttach = selectedMode === '議事録作成';

  const isSendEnabled = !isTyping && !!inputText.trim();

  const handleSendClick = async () => {
    if (!isSendEnabled) return;
    setShowSendAnim(true);
    window.setTimeout(() => setShowSendAnim(false), 500);
    const sendOptions = showImageAttach
      ? { imageFiles: attachedFiles }
      : showAudioAttach
      ? { audioFile: attachedFiles[0] ?? null }
      : undefined;
    await onSendMessage(sendOptions);
  };

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col gap-2 p-3 lg:p-4 border-t border-gray-200 bg-white/80 backdrop-blur-md"
    >
      {/* 添付プレビュー */}
      <AnimatePresence>
        {attachedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="max-w-3xl mx-auto w-full flex flex-wrap items-center gap-2 px-1"
          >
            {attachedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center gap-3 pl-3 pr-2 py-2 rounded-2xl bg-white border border-gray-200 shadow-sm text-sm text-gray-700">
                {file.type.startsWith('image/') ? (
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3z" />
                    <path d="M5 11a7 7 0 0 0 14 0" />
                  </svg>
                )}
                <span className="max-w-[260px] truncate">{file.name}</span>
                <button
                  onClick={() => handleRemoveFile(idx)}
                  type="button"
                  className="ml-1 p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  aria-label="添付を削除"
                  title="添付を削除"
                >
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {progress > 0 && (
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-black to-neutral-700 transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative max-w-3xl mx-auto w-full">
        {(showImageAttach || showAudioAttach) && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <label
              htmlFor={inputId}
              className={`cursor-pointer p-2 rounded-xl border border-gray-200 text-gray-700 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all ${isTyping ? 'opacity-50 pointer-events-none' : ''}`}
              title={showImageAttach ? '画像を添付' : '音声ファイルを添付'}
              aria-label={showImageAttach ? '画像を添付' : '音声ファイルを添付'}
            >
              {showImageAttach ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="14" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="9.5" r="1.5"></circle>
                  <path d="M21 17l-5.5-5.5a2 2 0 0 0-2.8 0L7 18"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3z" />
                  <path d="M5 11a7 7 0 0 0 14 0" />
                  <path d="M12 18v3" />
                  <path d="M8 21h8" />
                </svg>
              )}
            </label>
            {attachedCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm">
                {attachedCount}
              </span>
            )}
            <input
              id={inputId}
              type="file"
              className="hidden"
              multiple
              accept={showImageAttach ? 'image/*' : showAudioAttach ? 'audio/*' : undefined}
              onChange={handleFilesSelected}
            />
          </div>
        )}

        <motion.textarea
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="メッセージを入力してください..."
          className={`w-full resize-none rounded-2xl border border-gray-200 p-3 pr-16 ${
            showImageAttach || showAudioAttach ? 'pl-16' : 'pl-3'
          } min-h-[44px] max-h-[140px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-black bg-white/90 shadow-sm hover:border-gray-300`}
          disabled={isTyping}
          rows={1}
        />
        
        <motion.button
          whileHover={{ scale: isSendEnabled ? 1.06 : 1 }}
          whileTap={{ scale: isSendEnabled ? 0.96 : 1 }}
          onClick={handleSendClick}
          disabled={!isSendEnabled}
          type="button"
          className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-2xl transition-all duration-200 flex items-center gap-2 shadow-sm ${
            isSendEnabled
              ? 'bg-black text-white hover:bg-neutral-800 px-3 py-2'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed px-3 py-2'
          }`}
          aria-label="送信"
          title="送信"
        >
          <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12l18-9-9 18-2-7-7-2z" />
          </svg>
          <span className="sr-only">送信</span>
        </motion.button>

        <AnimatePresence>
          {showSendAnim && (
            <motion.div
              initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
              animate={{ opacity: 1, x: 10, y: -16, rotate: -12 }}
              exit={{ opacity: 0, x: 20, y: -28, rotate: -20 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="absolute right-10 top-1/2 -translate-y-1/2"
            >
              <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12l18-9-9 18-2-7-7-2z" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MessageInput;