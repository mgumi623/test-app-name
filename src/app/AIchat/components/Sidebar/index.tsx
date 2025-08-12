import { ChatSession } from '../../types';
import SidebarHeader from './SidebarHeader';
import ChatList from './ChatList';

interface SidebarProps {
  isOpen: boolean;
  chatSessions: ChatSession[];
  currentChatId: string;
  onSelectChat: (id: string) => void;
  onCreateNewChat: () => void;
  onDeleteChat: (chatId: string, e: React.MouseEvent<HTMLButtonElement>) => void;
  onCloseSidebar: () => void;
}

export default function Sidebar({
  isOpen,
  chatSessions,
  currentChatId,
  onSelectChat,
  onCreateNewChat,
  onDeleteChat,
  onCloseSidebar,
}: SidebarProps) {
  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-screen">
          <SidebarHeader 
            onCreateNewChat={onCreateNewChat}
            onCloseSidebar={onCloseSidebar}
          />
          <ChatList
            chatSessions={chatSessions}
            currentChatId={currentChatId}
            onSelectChat={onSelectChat}
            onDeleteChat={onDeleteChat}
          />
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