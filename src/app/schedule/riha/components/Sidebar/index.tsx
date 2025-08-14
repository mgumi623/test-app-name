'use client';

import { CalendarDays, Users, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTeams } from '../../contexts/TeamsContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./Sheet";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: 'shift' | 'staff' | 'settings' | string;
  onViewChange: (view: 'shift' | 'staff' | 'settings' | string) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  currentView,
  onViewChange,
  currentDate,
  onDateChange,
}: SidebarProps) {
  const { teams } = useTeams();

  const menuItems = [
    { id: 'shift', label: 'シフト表示', icon: CalendarDays },
    ...teams.map(team => ({
      id: team,
      label: `${team}チーム`,
      icon: Users,
    })),
    { id: 'staff', label: 'スタッフ一覧', icon: Users },
    { id: 'settings', label: '設定', icon: Settings },
  ] as const;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-80 bg-[#e8f2ed] border-[#cce3d9] p-0">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-[#cce3d9] bg-[#e8f2ed]">
            <SheetHeader className="w-full">
              <SheetTitle className="text-left">メニュー</SheetTitle>
            </SheetHeader>
          </div>

          <nav className="space-y-2 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <Button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    onClose();
                  }}
                  variant="ghost"
                  className={`w-full flex items-center justify-between px-4 py-3 transition-colors duration-75 ${
                    isActive ? 'bg-white text-[#2d513f]' : 'text-gray-700 hover:bg-white hover:text-[#2d513f]'
                  } ${!['shift', 'staff', 'settings'].includes(item.id) ? 'pl-8 text-sm' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                </Button>
              );
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}