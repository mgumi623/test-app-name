import { Bot, User, Copy, Check } from 'lucide-react';
import { ChatMessage } from '../../types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FormattedText } from '../../utils/textFormatter';

interface MessageItemProps {
  message: ChatMessage;
  index: number;
  copiedMessageId: string | null;
  onCopyMessage: (text: string, messageId: string) => void;
}

export default function MessageItem({ 
  message, 
  index, 
  copiedMessageId, 
  onCopyMessage 
}: MessageItemProps) {
  return (
    <div
      className="flex justify-start animate-fade-in-up mb-6"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div
        className={`flex items-start space-x-3 w-full max-w-4xl mx-auto px-4 ${
          message.sender === 'user'
            ? 'flex-row-reverse space-x-reverse'
            : ''
        }`}
      >
        <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
          <AvatarFallback 
            className={`${message.sender === 'user' ? 'bg-primary' : 'bg-secondary'} text-white`}
          >
            {message.sender === 'user' ? (
              <User className="w-4 h-4" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
          </AvatarFallback>
        </Avatar>

        <div
          className={`relative group rounded-2xl p-3 sm:p-4 transition hover:shadow-md max-w-[85%] bg-card border border-border text-card-foreground shadow-sm ${
            message.sender === 'user' ? 'ml-auto' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <FormattedText
              text={message.text}
              className="text-sm sm:text-base whitespace-pre-wrap text-card-foreground"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCopyMessage(message.text, message.id)}
              className="ml-2 opacity-0 group-hover:opacity-100 w-7 h-7 transition-opacity"
              title="メッセージをコピー"
            >
              {copiedMessageId === message.id ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
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
}