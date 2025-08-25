import { memo, useRef } from 'react';
import { ChatMessage } from '../../types/chat';
import { MessageItem } from '@/components/chat/MessageItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useVirtualizer } from '@tanstack/react-virtual';

interface MessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  copiedMessageId: string | null;
  onCopyMessage: (text: string, messageId: string) => void;
}

export const MessageList = memo(function MessageList({
  messages,
  isTyping,
  copiedMessageId,
  onCopyMessage
}: MessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  // 仮想スクロールの設定
  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5
  });


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

        {isTyping && (
          <div className="p-4">
            <div className="animate-pulse flex space-x-2">
              <div className="h-2 w-2 bg-gray-400 rounded-full" />
              <div className="h-2 w-2 bg-gray-400 rounded-full" />
              <div className="h-2 w-2 bg-gray-400 rounded-full" />
            </div>
          </div>
        )}

      </div>
    </ScrollArea>
  );
});
