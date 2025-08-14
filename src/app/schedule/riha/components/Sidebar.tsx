'use client';

import { CalendarDays, Users, X, Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTeams } from '../contexts/TeamsContext';
import * as Sheet from "@radix-ui/react-dialog";
import { cn } from '@/lib/utils';

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
    <Sheet.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Sheet.Portal>
        <Sheet.Overlay className="fixed inset-0 z-50 bg-black/20 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Sheet.Content className="fixed inset-y-0 left-0 z-50 h-full w-[280px] animate-in duration-300 data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left bg-[#e8f2ed] border-r border-[#cce3d9] backdrop-blur-sm">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-[#cce3d9]">
              <h2 className="text-lg font-semibold text-gray-900">メニュー</h2>
              <Sheet.Close asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-[#2d513f] hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </Button>
              </Sheet.Close>
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
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 transition-colors duration-75",
                      isActive ? "bg-white text-[#2d513f]" : "text-gray-700 hover:bg-white hover:text-[#2d513f]",
                      !['shift', 'staff', 'settings'].includes(item.id) ? "pl-8 text-sm" : ""
                    )}
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
        </Sheet.Content>
      </Sheet.Portal>
    </Sheet.Root>
  );
}