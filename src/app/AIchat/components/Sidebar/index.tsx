import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onCloseSidebar: () => void;
  onClearChat: () => void;
}

export default function Sidebar({
  isOpen,
  onCloseSidebar,
  onClearChat
}: SidebarProps) {
  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-[#e8f2ed] border-r border-[#cce3d9] backdrop-blur-sm transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">メニュー</h2>
            <button
              onClick={onCloseSidebar}
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              ✕
            </button>
          </div>
          <div className="flex-1">
            <button
              onClick={onClearChat}
              className="w-full py-2 px-4 bg-white hover:bg-gray-100 rounded-lg text-left mb-2"
            >
              チャットをクリア
            </button>
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