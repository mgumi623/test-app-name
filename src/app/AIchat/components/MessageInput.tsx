import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useClickTracking } from '../../../hooks/useAnalytics';
import AudioUpload from './AudioUpload';
import { ModeType } from './Header';

interface MessageInputProps {
  inputText: string;
  isTyping: boolean;
  selectedMode: ModeType;
  onInputChange: (value: string) => void;
  onSendMessage: () => Promise<void>;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => Promise<void>;
}

export default function MessageInput({
  inputText,
  isTyping,
  selectedMode,
  onInputChange,
  onSendMessage,
  onKeyDown,
}: MessageInputProps) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const { handleTrackedClick } = useClickTracking();
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);

  const isMinutesMode = selectedMode === '議事録作成';

  // モード変更時に音声ファイルをクリア
  useEffect(() => {
    if (!isMinutesMode) {
      setSelectedAudioFile(null);
    }
  }, [isMinutesMode]);

  useEffect(() => {
    if (!inputRef.current) return;
    const el = inputRef.current;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [inputText]);

  const handleFileSelect = (file: File) => {
    setSelectedAudioFile(file);
    // 音声ファイルが選択されたことをテキストエリアに反映
    if (!inputText.trim()) {
      onInputChange(`音声ファイル「${file.name}」を分析してください。`);
    }
  };

  const handleFileRemove = () => {
    setSelectedAudioFile(null);
    // テキストもクリア（必要に応じて）
    if (inputText.includes('音声ファイル「') && inputText.includes('」を分析してください。')) {
      onInputChange('');
    }
  };

  return (
    <div className="bg-transparent border-t border-gray-200 p-4 sm:p-6 w-full">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* 音声アップロード（議事録作成モードの場合のみ表示） */}
        {isMinutesMode && (
          <AudioUpload
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            selectedFile={selectedAudioFile}
            disabled={isTyping}
          />
        )}

        {/* メッセージ入力エリア */}
        <div className="flex items-end space-x-3 bg-white/70 border border-input rounded-2xl p-2 shadow-sm focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/20 transition">
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
            onClick={handleTrackedClick('send-message-btn', 'button', onSendMessage)}
            disabled={!inputText.trim() || isTyping}
            size="icon"
            className="rounded-xl"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}