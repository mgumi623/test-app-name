import { Message } from '@/types/chat';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex flex-col space-y-4 p-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`px-4 py-2 rounded-lg ${
              message.sender === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-900'
            }`}
          >
            {message.text}
          </div>
        </div>
      ))}
    </div>
  );
}