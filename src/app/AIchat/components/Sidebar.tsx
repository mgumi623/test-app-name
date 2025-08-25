import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onClearChat: () => Promise<void>;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onClearChat }) => {
  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out`}
    >
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-800">AI Assistant</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav className="p-4 space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">チャット管理</h3>
          <button
            onClick={onClearChat}
            className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg border border-red-200 hover:border-red-300 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            チャット履歴をクリア
          </button>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">ヘルプ</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Enter キーでメッセージを送信</p>
            <p>• Shift + Enter で改行</p>
            <p>• メッセージをクリックしてコピー</p>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;