'use client';

import { useState } from 'react';
import { CalendarDays, Users, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface NSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: 'shift' | 'staff' | 'settings';
  onViewChange: (view: 'shift' | 'staff' | 'settings') => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export default function NSidebar({
  isOpen,
  onClose,
  currentView,
  onViewChange,
  currentDate,
  onDateChange,
}: NSidebarProps) {
  const menuItems = [
    {
      id: 'shift',
      label: 'シフト表示',
      icon: CalendarDays,
    },
    {
      id: 'staff',
      label: 'スタッフ一覧',
      icon: Users,
    },
    {
      id: 'settings',
      label: '設定',
      icon: Settings,
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        side="left" 
        className="w-[280px] p-0 bg-[#e8f2ed] border-r border-[#cce3d9]"
      >
        <div className="flex items-center gap-2 p-4 border-b border-[#cce3d9] bg-[#e8f2ed]">
          <SheetTitle className="text-lg font-semibold text-gray-900">メニュー</SheetTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-[#2d513f] hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <nav className="space-y-2 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full justify-start gap-3 h-auto p-3 text-left transition-all ${
                  isActive
                    ? 'bg-[#2d513f] text-white shadow-md'
                    : 'hover:bg-[#cce3d9] text-gray-700'
                }`}
                onClick={() => onViewChange(item.id as 'shift' | 'staff' | 'settings')}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Button>
            );
          })}
        </nav>

        {/* 日付選択 */}
        <div className="p-4 border-t border-[#cce3d9]">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">月選択</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() - 1);
                onDateChange(newDate);
              }}
            >
              前月
            </Button>
            <div className="text-center text-sm text-gray-600 py-2">
              {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() + 1);
                onDateChange(newDate);
              }}
            >
              翌月
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
