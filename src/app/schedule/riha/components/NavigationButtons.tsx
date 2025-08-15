'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ViewType } from '../types';
import { useTeams } from '../contexts/TeamsContext';

interface NavigationButtonsProps {
  onViewChange: (view: string) => void;
}

export default function NavigationButtons({ onViewChange }: NavigationButtonsProps) {
  const { teams } = useTeams();

  return (
    <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75 rounded-lg shadow-sm">
      {teams.map((team) => {
        const gradeNumber = parseInt(team.name.charAt(0));
        const colorClasses = {
          2: 'from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 border-blue-200/50 text-blue-700',
          3: 'from-emerald-50 to-emerald-100/50 hover:from-emerald-100 hover:to-emerald-200/50 border-emerald-200/50 text-emerald-700',
          4: 'from-violet-50 to-violet-100/50 hover:from-violet-100 hover:to-violet-200/50 border-violet-200/50 text-violet-700',
        }[gradeNumber] || 'from-gray-50 to-gray-100/50 hover:from-gray-100 hover:to-gray-200/50 border-gray-200/50 text-gray-700';

        return (
          <Button
            key={team.id}
            onClick={() => onViewChange(team.name)}
            variant="outline"
            size="lg"
            className={`h-24 text-2xl font-bold bg-gradient-to-br ${colorClasses} shadow-sm hover:shadow transition-all duration-200 ease-in-out`}
          >
            {team.name}
          </Button>
        );
      })}
    </div>
  );
}