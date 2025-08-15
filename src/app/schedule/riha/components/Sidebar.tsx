'use client';

import { useState } from 'react';
import { CalendarDays, Users, X, Settings, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTeams } from '../contexts/TeamsContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: 'shift' | 'staff' | 'settings' | 'next-month-shift' | string;
  onViewChange: (view: 'shift' | 'staff' | 'settings' | 'next-month-shift' | string) => void;
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

  interface MenuItem {
    id: string;
    label: string;
    icon: typeof CalendarDays | typeof Users | typeof CalendarPlus | typeof Settings;
    submenu?: MenuItem[];
    isTeam?: boolean;
  }

  const menuItems: MenuItem[] = [
    {
      id: 'shift',
      label: 'シフト表示',
      icon: CalendarDays,
      submenu: teams
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(team => ({
          id: team.id,
          label: `${team.name}チーム`,
          icon: Users,
          isTeam: true,
        })),
    },
    {
      id: 'next-month-shift',
      label: 'シフト作成',
      icon: CalendarPlus,
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

  // メニュー項目が開いているかどうかの状態
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    title: true,  // システムタイトルは初期状態で開く
    shift: true,  // シフト表示は初期状態で開く
  });

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
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isExpanded = expandedItems[item.id];

            // メニューアイテムを再帰的に描画する関数
            const renderMenuItem = (menuItem: MenuItem, depth = 0) => {
              const ItemIcon = menuItem.icon;
              const hasSubItems = menuItem.submenu && menuItem.submenu.length > 0;
              const isItemExpanded = expandedItems[menuItem.id];
              const isActive = currentView === menuItem.id;
              const isClickable = !hasSubItems || 'isTeam' in menuItem;

              return (
                <div key={menuItem.id}>
                  <Button
                    onClick={() => {
                      if (isClickable) {
                        onViewChange(menuItem.id);
                        onClose();
                      } else if (hasSubItems) {
                        setExpandedItems(prev => ({ ...prev, [menuItem.id]: !prev[menuItem.id] }));
                      }
                    }}
                    variant="ghost"
                    className={cn(
                      "w-full flex items-center justify-between transition-colors duration-75",
                      isActive ? "bg-white text-[#2d513f]" : "text-gray-700 hover:bg-white hover:text-[#2d513f]",
                      depth === 0 ? "px-4 py-3" : "px-4 py-2 text-sm",
                      depth > 0 && "ml-4",
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <ItemIcon className={depth === 0 ? "w-5 h-5" : "w-4 h-4"} />
                      <span>{menuItem.label}</span>
                    </div>
                  </Button>

                  {/* サブメニュー */}
                  {hasSubItems && isItemExpanded && (
                    <div className="space-y-1 mt-1">
                      {menuItem.submenu?.map(subItem => renderMenuItem(subItem, depth + 1))}
                    </div>
                  )}
                </div>
              );
            };

            return renderMenuItem(item);
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}