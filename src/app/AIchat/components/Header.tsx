import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';

export type ModeType = '通常' | '脳血管' | '感染マニュアル' | '議事録作成' | '文献検索';

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  selectedMode?: ModeType;
  onModeChange?: (mode: ModeType) => void;
}

export default function Header({ isSidebarOpen, onToggleSidebar, selectedMode = '通常', onModeChange }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const modes: ModeType[] = ['通常', '脳血管', '感染マニュアル', '議事録作成', '文献検索'];

  // ドロップダウン外をクリックした時に閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <div className="z-10 w-full backdrop-blur-sm bg-white/60 border-b border-gray-200 p-3 sm:p-4">
      <div className="flex items-center space-x-3 animate-fade-in">
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

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-1.5 transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-lg">
              <img src="/image/clover.svg" alt="Clover Logo" className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                AI Assistant
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">{selectedMode}モード</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              {modes.map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    onModeChange?.(mode);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                    selectedMode === mode ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {mode}モード
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}