'use client';

import { MessageSquare, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HeaderProps {
  userRole: string;
  onRoleChange: (role: string) => void;
}

export function Header({ userRole, onRoleChange }: HeaderProps) {
  return (
    <div className="z-10 w-full backdrop-blur-sm bg-white/60 border-b border-gray-200 p-3 sm:p-4">
      <div className="flex items-center space-x-3 animate-fade-in">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-lg">
            <div>
              <Image 
                src="/image/clover.svg" 
                alt="Clover Logo" 
                width={20} 
                height={20} 
              />
            </div>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              Corporate Bridge
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">意見交流・アイデア共有</p>
          </div>
        </div>

        <div className="flex items-center justify-end flex-1 space-x-4 ml-auto">
          <Select
            value={userRole}
            onValueChange={onRoleChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="役職を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">一般職</SelectItem>
              <SelectItem value="management">管理職</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}