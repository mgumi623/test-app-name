'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ViewType } from '../types';
import { useTeams } from '../contexts/TeamsContext';

interface TeamSelectModalProps {
  onViewChange: (view: string) => void;
}

export default function TeamSelectModal({ onViewChange }: TeamSelectModalProps) {
  const { teams } = useTeams();

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 p-8 rounded-2xl shadow-xl max-w-3xl w-full mx-4 border border-gray-100/50 
        animate-in zoom-in-95 duration-300">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-800
          animate-in fade-in zoom-in-95 duration-500">
          チームを選択
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {teams.map((team, index) => {
            const gradeNumber = parseInt(team.charAt(0));
            const colorClasses = {
              2: 'bg-gradient-to-br from-blue-50/80 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 border-blue-200/30 text-blue-700',
              3: 'bg-gradient-to-br from-emerald-50/80 to-emerald-100/50 hover:from-emerald-100 hover:to-emerald-200/50 border-emerald-200/30 text-emerald-700',
              4: 'bg-gradient-to-br from-violet-50/80 to-violet-100/50 hover:from-violet-100 hover:to-violet-200/50 border-violet-200/30 text-violet-700',
            }[gradeNumber] || 'bg-gradient-to-br from-gray-50/80 to-gray-100/50 hover:from-gray-100 hover:to-gray-200/50 border-gray-200/30 text-gray-700';

            return (
              <Button
                key={team}
                onClick={() => onViewChange(team)}
                variant="outline"
                size="lg"
                className={`
                  h-20 text-xl font-bold shadow-sm hover:shadow-md transition-all
                  animate-in fade-in-50 zoom-in-95
                  duration-500
                  ${colorClasses}
                `}
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'backwards'
                }}
              >
                {team}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}