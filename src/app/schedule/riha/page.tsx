'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ShiftTable from './components/ShiftTable';
import StaffList from './components/StaffList';
import NavigationButtons from './components/NavigationButtons';
import TeamSettings from './components/TeamSettings';
import MinimumStaffSettings from './components/MinimumStaffSettings';
import TeamSelectModal from './components/TeamSelectModal';
import PageTransition from './components/PageTransition';
import { TeamsProvider, useTeams } from './contexts/TeamsContext';

type ViewType = 'shift' | 'staff' | 'settings' | string;

function RihaShiftPageContent() {
  const { user } = useAuth();
  const { teams } = useTeams();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('shift');

  useEffect(() => {
    if (teams.length > 0) {
      handleViewChange(teams[0]);
    }
  }, [teams]);

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">ログインしてください</p>
        </div>
      </div>
    );
  }

  const formattedDate = format(currentDate, 'yyyy年 M月', { locale: ja });

  return (
    <div className="flex min-h-screen bg-white overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentView={currentView}
        onViewChange={handleViewChange}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
      />

      <div
        className={`
          flex flex-col flex-1 min-h-screen
          transition-[margin,width] duration-300 ease-in-out
          ${isSidebarOpen ? 'ml-[280px]' : 'ml-0'}
        `}
      >
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          title={currentView === 'shift' 
            ? 'シフト管理' 
            : currentView === 'staff' 
              ? 'スタッフ一覧' 
              : currentView === 'settings'
                ? '設定'
                : `${currentView}チーム`
          }
          subtitle={currentView === 'shift' 
            ? formattedDate 
            : currentView === 'staff' 
              ? 'スタッフの登録・管理' 
              : currentView === 'settings'
                ? 'システム設定'
                : 'チームメンバー一覧'
          }
        />

        <main className="flex-1 overflow-auto bg-gray-50 pt-1 px-4">
          <div className="max-w-7xl mx-auto">
            <PageTransition currentView={currentView}>
              {currentView === 'staff' ? (
                <StaffList teamFilter={undefined} />
              ) : currentView === 'shift' ? (
                <ShiftTable currentDate={currentDate} onViewChange={handleViewChange} />
              ) : currentView === 'settings' ? (
                <div className="space-y-4">
                  <TeamSettings />
                  <MinimumStaffSettings />
                </div>
              ) : teams.includes(currentView) ? (
                <ShiftTable
                  currentDate={currentDate}
                  teamFilter={currentView}
                  showTeamSelect={false}
                />
              ) : (
                <ShiftTable
                  currentDate={currentDate}
                />
              )}
            </PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function RihaShiftPage() {
  return (
    <TeamsProvider>
      <RihaShiftPageContent />
    </TeamsProvider>
  );
}