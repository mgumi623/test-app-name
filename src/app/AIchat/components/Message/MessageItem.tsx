import { memo } from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';
import { ChatMessage } from '../../types/chat';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface MessageItemProps {
  message: ChatMessage;
  index: number;
  copiedMessageId: string | null;
  onCopyMessage: (text: string, messageId: string) => void;
}

// メッセージアバター
const MessageAvatar = memo(function MessageAvatar({ sender }: { sender: 'user' | 'ai' | 'system' }) {
  return (
    <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
      <AvatarFallback
        className={`${sender === 'user' ? 'bg-primary' : 'bg-secondary'} text-white`}
      >
        {sender === 'user' ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </AvatarFallback>
    </Avatar>
  );
});

// コピーボタン
const CopyButton = memo(function CopyButton({ 
  messageId, 
  text, 
  copiedMessageId,
  onCopyMessage 
}: {
  messageId: string;
  text: string;
  copiedMessageId: string | null;
  onCopyMessage: (text: string, messageId: string) => void;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onCopyMessage(text, messageId)}
      className="ml-2 opacity-0 group-hover:opacity-100 w-7 h-7 transition-opacity"
      title="メッセージをコピー"
    >
      {copiedMessageId === messageId ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </Button>
  );
});

// システムメッセージ
const SystemMessage = memo(function SystemMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-center px-4">
      <div className="bg-gray-100 rounded-full px-4 py-2 text-xs text-gray-500 text-center">
        {text}
      </div>
    </div>
  );
});

// メインのメッセージコンポーネント
export const MessageItem = memo(function MessageItem({
  message,
  index,
  copiedMessageId,
  onCopyMessage
}: MessageItemProps) {
  // システムメッセージの場合は表示しない
  if (message.type === 'mode_change') {
    return null;
  }

  // 通常のメッセージ
  return (
    <div
      className="animate-fade-in-up mb-6"
      style={{ animationDelay: `${Math.min(index * 0.1, 1)}s` }}
    >
      <div
        className={`flex items-start space-x-3 w-full max-w-6xl mx-auto px-4 ${
          message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
        }`}
      >
        <MessageAvatar sender={message.sender} />

        <div
          className={`relative group rounded-2xl p-3 sm:p-4 transition hover:shadow-md max-w-[85%] shadow-sm bg-card border border-border text-card-foreground ${
            message.sender === 'user' ? 'ml-auto' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="text-sm sm:text-base whitespace-pre-wrap text-card-foreground">
              {message.text}
            </div>
            <CopyButton
              messageId={message.id}
              text={message.text}
              copiedMessageId={copiedMessageId}
              onCopyMessage={onCopyMessage}
            />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString('ja-JP', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // カスタム比較関数で不要な再レンダリングを防ぐ
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.copiedMessageId === nextProps.copiedMessageId
  );
});
