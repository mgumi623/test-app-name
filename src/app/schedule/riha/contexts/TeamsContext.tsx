'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface TeamsContextType {
  teams: string[];
  addTeam: (team: string) => void;
  removeTeam: (team: string) => void;
  reorderTeams: (teams: string[]) => void;
}

const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

export function TeamsProvider({ children }: { children: React.ReactNode }) {
  const [teams, setTeams] = useState<string[]>(['2A', '2B', '3A', '3B', '4A', '4B']);

  // ローカルストレージからチーム設定を読み込む
  useEffect(() => {
    const savedTeams = localStorage.getItem('riha-teams');
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams));
    }
  }, []);

  // チーム設定の変更をローカルストレージに保存
  const saveTeams = (newTeams: string[]) => {
    localStorage.setItem('riha-teams', JSON.stringify(newTeams));
    setTeams(newTeams);
  };

  const addTeam = (team: string) => {
    if (!teams.includes(team)) {
      saveTeams([...teams, team]);
    }
  };

  const removeTeam = (team: string) => {
    saveTeams(teams.filter(t => t !== team));
  };

  const reorderTeams = (newTeams: string[]) => {
    saveTeams(newTeams);
  };

  return (
    <TeamsContext.Provider value={{ teams, addTeam, removeTeam, reorderTeams }}>
      {children}
    </TeamsContext.Provider>
  );
}

export function useTeams() {
  const context = useContext(TeamsContext);
  if (context === undefined) {
    throw new Error('useTeams must be used within a TeamsProvider');
  }
  return context;
}