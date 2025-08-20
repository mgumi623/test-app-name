'use client';

import React from 'react';
import OptionCard from './OptionCard';
import { Option } from '../types';

interface ListLayoutProps {
  options: Option[];
  selectedId: string | null;
  isPending: boolean;
  onNavigate: (option: Option) => void;
}

export default function ListLayout({ options, selectedId, isPending, onNavigate }: ListLayoutProps) {
  return (
    <div className="space-y-4">
      {options.map((option) => (
        <OptionCard
          key={option.id}
          option={option}
          isPending={isPending && selectedId === option.id}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}