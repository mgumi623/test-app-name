import { useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useClickTracking } from '../../../hooks/useAnalytics';

interface MessageInputProps {
  inputText: string;
  isTyping: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => Promise<void>;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => Promise<void>;
}

export default function MessageInput({
  inputText,
  isTyping,
  onInputChange,
  onSendMessage,
  onKeyDown,
}: MessageInputProps) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const { handleTrackedClick } = useClickTracking();

  useEffect(() => {
    if (!inputRef.current) return;
    const el = inputRef.current;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [inputText]);

  return (
    <div className="bg-transparent border-t border-gray-200 p-4 sm:p-6 w-full">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end space-x-3 bg-white/70 border border-input rounded-2xl p-2 shadow-sm focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/20 transition">
          <Textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="メッセージを入力してください..."
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