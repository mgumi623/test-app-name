import { useEffect, useRef } from 'react';
import { ChatMessage } from '../../types';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  copiedMessageId: string | null;
  onCopyMessage: (text: string, messageId: string) => void;
}

export default function MessageList({ 
  messages, 
  isTyping, 
  copiedMessageId, 
  onCopyMessage 
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(scrollToBottom, [messages]);

  return (
    <ScrollArea className="flex-1 bg-gray-50 h-full">
      <div className="py-4 sm:py-6 min-h-full">
        {messages.map((message, idx) => (
          <MessageItem
            key={message.id}
            message={message}
            index={idx}
            copiedMessageId={copiedMessageId}
            onCopyMessage={onCopyMessage}
          />
        ))}

        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}