'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Option } from '../types';

interface SearchPaletteProps {
  options: Option[];
  onSelect: (option: Option) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchPalette({ options, onSelect, isOpen, onClose }: SearchPaletteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // 検索結果のフィルタリング
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // キーボードナビゲーション
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredOptions[selectedIndex]) {
            onSelect(filteredOptions[selectedIndex]);
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredOptions, selectedIndex, onSelect, onClose]);

  // 検索語が変更されたら選択インデックスをリセット
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  // パレットが開いたらフォーカス
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* 検索パレット */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-50">
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200">
          {/* ヘッダー */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="機能名、部署、タグで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border-0 focus:ring-0 text-lg"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* 検索結果 */}
          <div className="max-h-96 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">検索結果が見つかりません</p>
                <p className="text-sm">別のキーワードで検索してください</p>
              </div>
            ) : (
              <div className="py-2">
                {filteredOptions.map((option, index) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      onSelect(option);
                      onClose();
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      index === selectedIndex ? 'bg-green-50 border-r-2 border-green-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {option.department}
                          </span>
                          {option.description && (
                            <span className="truncate">{option.description}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-gray-400">
                        <Command className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span>↑↓ で選択</span>
                <span>Enter で決定</span>
                <span>Esc で閉じる</span>
              </div>
              <span>{filteredOptions.length} 件の結果</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
