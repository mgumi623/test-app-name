import React from 'react';

export type ModeType = '通常' | '脳血管' | '感染マニュアル' | '議事録作成' | '文献検索';

interface HeaderProps {
  selectedMode: ModeType;
  onModeChange: (mode: ModeType) => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ selectedMode: mode, onModeChange, onToggleSidebar }) => {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          className={`px-4 py-2 rounded ${
            mode === '通常' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => onModeChange('通常')}
        >
          通常
        </button>
        <button
          className={`px-4 py-2 rounded ${
            mode === '脳血管' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => onModeChange('脳血管')}
        >
          脳血管
        </button>
        <button
          className={`px-4 py-2 rounded ${
            mode === '感染マニュアル' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => onModeChange('感染マニュアル')}
        >
          感染マニュアル
        </button>
        <button
          className={`px-4 py-2 rounded ${
            mode === '議事録作成' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => onModeChange('議事録作成')}
        >
          議事録作成
        </button>
        <button
          className={`px-4 py-2 rounded ${
            mode === '文献検索' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => onModeChange('文献検索')}
        >
          文献検索
        </button>
      </div>
    </header>
  );
};

export default Header;