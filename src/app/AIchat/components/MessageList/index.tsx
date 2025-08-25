import { useEffect, useRef, memo } from 'react';
import { ChatMessage } from '../../types';
import { MessageItem } from '@/components/chat/MessageItem';
import TypingIndicator from './TypingIndicator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useVirtualizer } from '@tanstack/react-virtual';

interface MessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  copiedMessageId: string | null;
  onCopyMessage: (text: string, messageId: string) => void;
}

const MessageList = memo(function MessageList({ 
  messages, 
  isTyping, 
  copiedMessageId, 
  onCopyMessage 
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5
  });

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(scrollToBottom, [messages]);

  return (
    <ScrollArea className="flex-1 bg-gray-50 h-full">
      <div ref={parentRef} className="h-full relative py-4 sm:py-6">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const message = messages[virtualRow.index];
            return (
              <div
                key={message.id}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <MessageItem
                  message={message}
                  index={virtualRow.index}
                  copiedMessageId={copiedMessageId}
                  onCopyMessage={onCopyMessage}
                />
              </div>
            );
          })}
        </div>

        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
});

export default MessageList;