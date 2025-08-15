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
import dynamic from 'next/dynamic';
import { TeamsProvider, useTeams } from './contexts/TeamsContext';
import { ShiftRulesProvider } from './contexts/ShiftRulesContext';
import { StaffProvider } from './contexts/StaffContext';
import PageTransition from './components/PageTransition';
import TeamView from './components/TeamView';
import { PasswordSettings } from './components/PasswordSettings';
import AdvancedSettings from './components/AdvancedSettings';
import { PasswordProvider } from './contexts/PasswordContext';
import { AdvancedSettingsProvider } from './contexts/AdvancedSettingsContext';
import { SupabaseProvider } from '@/contexts/SupabaseContext';
import './styles/print.css';

const ShiftCreation = dynamic(() => import('./components/ShiftCreation'), {
  ssr: false,
});

type ViewType = 'shift' | 'staff' | 'settings' | 'next-month-shift' | string;

function RihaShiftPageContent() {
  const { user } = useAuth();
  const { teams } = useTeams();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('shift');

  useEffect(() => {
    if (teams.length > 0) {
      handleViewChange('shift');
    }
  
  }, [teams]);

  const handleViewChange = (view: ViewType) => {
    if (view === currentView) return;
    
    console.log('View changing to:', view);
    const selectedTeam = teams.find(team => team.id === view || team.name === view);
    if (selectedTeam) {
      console.log('Selected team:', selectedTeam);
      setCurrentView(selectedTeam.name);
    } else if (['shift', 'staff', 'settings', 'next-month-shift'].includes(view)) {
      setCurrentView(view);
    } else {
      setCurrentView('shift');
    }
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
                : currentView === 'next-month-shift'
                  ? 'シフト作成'
                  : `${currentView}チーム`
          }
          subtitle={currentView === 'shift' 
            ? formattedDate 
            : currentView === 'staff' 
              ? 'スタッフの登録・管理' 
              : currentView === 'settings'
                ? 'システム設定'
                : currentView === 'next-month-shift'
                  ? '新規シフトの作成'
                  : 'チームメンバー一覧'
          }
        />

        <main className="flex-1 overflow-auto bg-gray-50 pt-1 px-4">
          <div className="max-w-7xl mx-auto">
          <PageTransition currentView={currentView}>
  <div className="relative">
    {/* Shift または チームビューのときだけツールバー表示 */}
    {(currentView === 'shift' || teams.some(t => t.name === currentView)) && null}

    {/* コンテンツ本体 */}
    {currentView === 'staff' && <StaffList teamFilter={undefined} />}

    {currentView === 'shift' && (
      <ShiftTable 
        currentDate={currentDate} 
        onViewChange={handleViewChange}
        onMonthChange={(offset) => {
          const newDate = new Date(currentDate);
          newDate.setMonth(newDate.getMonth() + offset);
          setCurrentDate(newDate);
        }}
      />
    )}

    {currentView === 'next-month-shift' && (
      <TeamsProvider>
        <ShiftCreation />
      </TeamsProvider>
    )}

    {currentView === 'settings' && (
      <div className="space-y-4">
        <TeamSettings />
        <MinimumStaffSettings />
        <PasswordSettings />
        <AdvancedSettings />
      </div>
    )}

    {teams.some(t => t.name === currentView) && (
      <TeamView 
        teamName={currentView} 
        currentDate={currentDate}
        onMonthChange={(offset) => {
          const newDate = new Date(currentDate);
          newDate.setMonth(newDate.getMonth() + offset);
          setCurrentDate(newDate);
        }}
      />
    )}

    {/* 万一どれにも該当しない場合のフォールバック */}
    {!['staff','shift','next-month-shift','settings'].includes(currentView) &&
      !teams.some(t => t.name === currentView) && (
        <ShiftTable currentDate={currentDate} />
    )}
  </div>
</PageTransition>

          </div>
        </main>
      </div>
    </div>
  );
}

export default function RihaShiftPage() {
  return (
    <SupabaseProvider>
      <TeamsProvider>
        <ShiftRulesProvider>
          <StaffProvider>
            <PasswordProvider>
              <AdvancedSettingsProvider>
                <RihaShiftPageContent />
              </AdvancedSettingsProvider>
            </PasswordProvider>
          </StaffProvider>
        </ShiftRulesProvider>
      </TeamsProvider>
    </SupabaseProvider>
  );
}