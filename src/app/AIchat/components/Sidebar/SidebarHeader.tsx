import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarHeaderProps {
  onCreateNewChat: () => void;
  onCloseSidebar: () => void;
}

export default function SidebarHeader({ onCreateNewChat, onCloseSidebar }: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-[#cce3d9] bg-[#e8f2ed]">
      <h2 className="text-lg font-semibold text-gray-900">チャット履歴</h2>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateNewChat}
          className="bg-white hover:bg-[#2d513f] hover:text-white transition-all flex items-center gap-2 font-medium shadow-sm border-[#cce3d9]"
          title="新規チャットを開始"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm">新規チャット</span>
        </Button>
      </div>
    </div>
  );
}