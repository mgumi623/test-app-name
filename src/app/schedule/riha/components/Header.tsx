import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onToggleSidebar: () => void;
  title: string;
  subtitle: string;
}

export default function Header({ onToggleSidebar, title, subtitle }: HeaderProps) {
  return (
    <div className="z-10 w-full backdrop-blur-sm bg-white/60 border-b border-gray-200 p-3 sm:p-4">
      <div className="flex items-center space-x-3 animate-fade-in max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            title="メニューを表示"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <img src="/image/clover.svg" alt="Clover" className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">
            {title}
          </h1>
          <p className="text-sm text-gray-600">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}