import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarHeaderProps {
  onCreateNewChat: () => void;
  onCloseSidebar: () => void;
}

export default function SidebarHeader({ onCreateNewChat, onCloseSidebar }: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900">チャット履歴</h2>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCreateNewChat}
          className="hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCloseSidebar}
          className="hover:scale-105 transition-transform"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}