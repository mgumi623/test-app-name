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

export default function MessageItem({ message, index, copiedMessageId, onCopyMessage }: MessageItemProps) {
  // デバッグ情報
  if (process.env.NODE_ENV === 'development') {
    console.log('[MessageItem] Rendering message:', { 
      id: message.id, 
      sender: message.sender, 
      text: message.text.substring(0, 50),
      type: message.type 
    });
  }

  if (message.type === 'mode_change') {
    return (
      <div className="animate-fade-in-up mb-6" style={{ animationDelay: `${index * 0.1}s` }}>
        <div className="flex justify-center px-4 max-w-6xl mx-auto">
          <div className="bg-gray-100 rounded-full px-4 py-2 text-xs text-gray-500 text-center">
            <FormattedText text={message.text} className="whitespace-pre-wrap text-center" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up mb-6" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className={`flex items-start space-x-3 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 ring-1 ring-slate-200 shadow-sm">
            <AvatarFallback 
              className={`${
                message.sender === 'user' 
                  ? 'bg-primary border-primary' 
                  : 'bg-gradient-to-br from-slate-100 to-white border-slate-200'
              } flex items-center justify-center border`}
            >
              {message.sender === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <div className="w-5 h-5">
                  <img 
                    src="/image/clover.svg" 
                    alt="AI" 
                    className="w-full h-full"
                  />
                </div>
              )}
            </AvatarFallback>
          </Avatar>

          <div className={`relative group rounded-2xl p-3 sm:p-4 transition hover:shadow-md max-w-[85%] shadow-sm bg-card border border-border text-card-foreground ${message.sender === 'user' ? 'ml-auto' : ''}`}>
            <div className="flex items-start justify-between">
              <FormattedText text={message.text} className="text-sm sm:text-base whitespace-pre-wrap text-card-foreground" />
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
              {message.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}