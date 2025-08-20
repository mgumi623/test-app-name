import { ChatSession } from '../../types';
import SidebarHeader from './SidebarHeader';
import ChatList from './ChatList';

interface SidebarProps {
  isOpen: boolean;
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  currentChatId: string;
  onSelectChat: (id: string) => void;
  onCreateNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onDeleteAllChats: () => void;
  onCloseSidebar: () => void;
  isLoading?: boolean;
}

export default function Sidebar({
  isOpen,
  currentSession,
  sessions,
  currentChatId,
  onSelectChat,
  onCreateNewChat,
  onDeleteChat,
  onDeleteAllChats,
  onCloseSidebar,
  isLoading = false,
}: SidebarProps) {
  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-[#e8f2ed] border-r border-[#cce3d9] backdrop-blur-sm transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full max-h-screen">
          <SidebarHeader 
            onCreateNewChat={onCreateNewChat}
            onCloseSidebar={onCloseSidebar}
            isLoading={isLoading}
          />
          <div className="flex-1 min-h-0">
            <ChatList
              currentSession={currentSession}
              sessions={sessions}
              currentChatId={currentChatId}
              onSelectChat={onSelectChat}
              onDeleteChat={onDeleteChat}
              onDeleteAllChats={onDeleteAllChats}
            />
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onCloseSidebar}
        />
      )}
    </>
  );
}