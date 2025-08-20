/**
 * このファイルはAIチャットのヘッダーコンポーネントを提供します。
 *
 * 主な機能：
 * - モード切替（通常、脳血管、感染マニュアル等）
 * - サイドバーの表示/非表示制御
 * - モード説明のツールチップ表示
 *
 * UI要素：
 * - クローバーロゴ（アニメーション付き）
 * - モード選択ドロップダウン
 * - ハンバーガーメニュー
 *
 * 特徴：
 * - レスポンシブデザイン
 * - アニメーション効果
 * - クリックアウトサイドでの自動閉じ
 */

'use client';

import { Menu, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type ModeType = '通常' | '脳血管' | '感染マニュアル' | '議事録作成' | '文献検索';

const modeDescriptions: Record<ModeType, string> = {
  '通常': '医療に関する一般的な質問に回答いたします。\n具体的な症状や治療についてのアドバイスは、必ず医師にご相談ください。',
  '脳血管': '脳血管疾患に関する専門的な質問に答えます',
  '感染マニュアル': '感染症対策マニュアルに基づいて回答します',
  '議事録作成': '会議の内容から議事録を作成します',
  '文献検索': '医学文献を検索して関連情報を提供します',
};

interface HeaderProps {
  selectedMode?: ModeType;
  onModeChange?: (mode: ModeType) => void;
  currentChatId?: string;
  onPostNotice?: (text: string) => void; // optional にして安全化
  onToggleSidebar: () => void;
}

export default function Header({
  selectedMode = '通常',
  onModeChange,
  onPostNotice = () => {}, // デフォルト no-op
  onToggleSidebar,
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [shouldRotate, setShouldRotate] = useState(false);
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="z-10 w-full backdrop-blur-sm bg-white/60 border-b border-gray-200 p-3 sm:p-4">
      <div className="flex items-center space-x-3 animate-fade-in">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
          title="チャット履歴を表示"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-1.5 transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-lg">
              <div className={shouldRotate ? 'rotate-once' : ''}>
                <Image
                  src="/image/clover.svg"
                  alt="Clover Logo"
                  width={20}
                  height={20}
                  onAnimationEnd={() => setShouldRotate(false)}
                />
              </div>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">AI Assistant</h1>
              <p className="text-xs sm:text-sm text-gray-600">{selectedMode}モード</p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              {modes.map((mode) => (
                <TooltipProvider key={mode}>
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          if (mode === selectedMode) {
                            setIsDropdownOpen(false);
                            return;
                          }
                          setIsDropdownOpen(false);
                          setShouldRotate(true);
                          const notice = `モードを${mode}に変更しました。\n${modeDescriptions[mode]}`;
                          onPostNotice?.(notice);  // オプショナルチェーンで安全
                          onModeChange?.(mode);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                          selectedMode === mode ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {mode}モード
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{modeDescriptions[mode]}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
