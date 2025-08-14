import { MessageSquare, Trash2 } from 'lucide-react';
import { ChatSession } from '../../types';

interface ChatListProps {
  chatSessions: ChatSession[];
  currentChatId: string;
  onSelectChat: (id: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export default function ChatList({ 
  chatSessions, 
  currentChatId, 
  onSelectChat, 
  onDeleteChat 
}: ChatListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-2 bg-[#e8f2ed]">
      {chatSessions.map((chat) => (
        <div
          key={chat.id}
          onClick={() => onSelectChat(chat.id)}
          className={`group flex items-center justify-between p-3 mb-2 rounded-lg cursor-pointer hover:bg-[#dbe9e3] transition ${
            chat.id === currentChatId ? 'bg-[#dbe9e3] border border-[#cce3d9]' : ''
          }`}
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <MessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">{chat.title}</p>
              <p className="text-xs text-gray-500">
                {chat.lastMessage.toLocaleDateString('ja-JP')}
              </p>
            </div>
          </div>
          {chatSessions.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chat.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-500 hover:text-red-500 hover:bg-red-50 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}