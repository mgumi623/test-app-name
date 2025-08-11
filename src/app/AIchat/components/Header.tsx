import { Menu, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Header({ isSidebarOpen, onToggleSidebar }: HeaderProps) {
  return (
    <div className="z-10 w-full backdrop-blur-sm bg-white/80 border-b border-gray-200 p-4 sm:p-6">
      <div className="relative flex items-center justify-between animate-fade-in">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
        >
          {isSidebarOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>

        <div className="absolute inset-x-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                AI Assistant
              </h1>
              <p className="text-sm text-gray-600">いつでもお手伝いします</p>
            </div>
          </div>
        </div>

        <div className="w-10 h-10" />
      </div>
    </div>
  );
}