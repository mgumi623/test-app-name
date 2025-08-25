import { useState, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex space-x-2 p-4 border-t">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="メッセージを入力..."
        className="flex-1 p-2 border rounded-lg resize-none"
        rows={1}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
      >
        送信
      </button>
    </div>
  );
}