import { MessageSquare, Trash2, Trash } from 'lucide-react';
import { ChatSession } from '../../types';
import { Button } from '@/components/ui/button';

interface ChatListProps {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  currentChatId: string;
  onSelectChat: (id: string) => void;
  onDeleteChat: (chatId: string) => void;
  onDeleteAllChats: () => void;
}

export default function ChatList({ 
  sessions,
  currentChatId, 
  onSelectChat, 
  onDeleteChat,
  onDeleteAllChats
}: ChatListProps) {
  return (
    <div className="flex flex-col h-full bg-[#e8f2ed]">
      {/* チャットリスト */}
      <div className="flex-1 overflow-y-auto p-2 pb-0 min-h-0">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelectChat(session.id)}
            className={`group flex items-center justify-between p-3 mb-2 rounded-lg cursor-pointer hover:bg-[#dbe9e3] transition ${
              session.id === currentChatId ? 'bg-[#dbe9e3] border border-[#cce3d9]' : ''
            }`}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <MessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{session.title}</p>
                <p className="text-xs text-gray-500">
                  {session.lastMessage.toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(session.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-500 hover:text-red-500 hover:bg-red-50 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* 一括削除ボタン - 固定位置 */}
      <div className="flex-shrink-0 p-3 border-t border-[#cce3d9] bg-[#e8f2ed]">
        {/* チャット履歴数表示 */}
        <div className="text-xs text-gray-600 mb-3 text-center font-medium">
          チャット履歴: {sessions.length}件
        </div>
        
        {sessions.length > 0 ? (
          <Button
            onClick={onDeleteAllChats}
            variant="outline"
            size="sm"
            className="w-full bg-white hover:bg-red-50 border-[#cce3d9] hover:border-red-300 text-[#2d513f] hover:text-red-600 transition-all duration-200 shadow-sm font-medium group"
          >
            <Trash className="w-4 h-4 mr-2 text-[#2d513f] group-hover:text-red-600 transition-colors" />
            全チャット履歴を削除
          </Button>
        ) : (
          <div className="text-center text-gray-500 text-sm py-3 bg-white rounded-lg border border-[#cce3d9]">
            チャット履歴がありません
          </div>
        )}
      </div>
    </div>
  );
}