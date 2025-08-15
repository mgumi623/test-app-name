import { useEffect, useRef, useState } from 'react';
import { Send, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AudioUpload from './AudioUpload';
import { ModeType } from './Header';

interface MessageInputProps {
  inputText: string;
  isTyping: boolean;
  selectedMode: ModeType;
  selectedAudioFile: File | null;
  onInputChange: (value: string) => void;
  onSendMessage: (audioFile?: File) => Promise<void>;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => Promise<void>;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
}

export default function MessageInput({
  inputText,
  isTyping,
  selectedMode,
  selectedAudioFile,
  onInputChange,
  onSendMessage,
  onKeyDown,
  onFileSelect,
  onFileRemove,
}: MessageInputProps) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [showAudioUpload, setShowAudioUpload] = useState(false);

  const isMinutesMode = selectedMode === '議事録作成';

  useEffect(() => {
    if (!inputRef.current) return;
    const el = inputRef.current;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [inputText]);

  const handleSendWithAudio = async () => {
    await onSendMessage(selectedAudioFile || undefined);
  };

  const handleFileSelectWrapper = (file: File) => {
    onFileSelect(file);
    setShowAudioUpload(false);
  };

  return (
    <div className="bg-transparent p-1.5 sm:p-2 w-full relative">
      <div className="max-w-4xl mx-auto">
        {/* メッセージ入力エリア */}
        <div className="flex items-end space-x-3 bg-white/70 border border-input rounded-2xl p-2 shadow-sm focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/20 transition">
          {/* 音声ファイル添付ボタン（議事録作成モードの場合のみ表示） */}
          {isMinutesMode && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowAudioUpload(!showAudioUpload)}
              className="rounded-xl touch-manipulation"
              style={{ 
                minHeight: '44px', 
                minWidth: '44px',
                WebkitTapHighlightColor: 'transparent'
              }}
              disabled={isTyping}
            >
              <Mic className="w-5 h-5" />
            </Button>
          )}
          
          <Textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              isMinutesMode 
                ? "音声ファイルをアップロードするか、メッセージを入力してください..." 
                : "メッセージを入力してください..."
            }
            className="flex-1 resize-none min-h-[44px] max-h-32 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            onClick={handleSendWithAudio}
            disabled={
              isTyping || 
              (isMinutesMode ? !selectedAudioFile : !inputText.trim())
            }
            size="icon"
            className="rounded-xl touch-manipulation"
            style={{ 
              minHeight: '44px', 
              minWidth: '44px',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>

        {/* 選択された音声ファイル表示 */}
        {isMinutesMode && selectedAudioFile && (
          <div className="mt-1 px-2">
            <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-blue-50 border border-blue-200 rounded text-xs">
              <Mic className="w-2.5 h-2.5 text-blue-600 flex-shrink-0" />
              <span className="text-blue-800 truncate flex-1 text-xs">{selectedAudioFile.name}</span>
              <button
                type="button"
                onClick={onFileRemove}
                className="w-3 h-3 flex items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                disabled={isTyping}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* 音声アップロードポップアップ */}
        {isMinutesMode && showAudioUpload && (
          <div className="absolute bottom-full left-0 right-0 mb-2 z-10">
            <div className="max-w-4xl mx-auto px-2">
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                <AudioUpload
                  onFileSelect={handleFileSelectWrapper}
                  onFileRemove={onFileRemove}
                  selectedFile={selectedAudioFile}
                  disabled={isTyping}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}