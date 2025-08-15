'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { LEAVE_TYPE_FULL, LeaveType } from '../types/index';

/**
 * シフト編集モーダルコンポーネント
 * 
 * 機能：
 * - シフトステータスの編集
 * - 出勤/休み/有給などの設定
 * - ステータスの取り消し
 */
interface ShiftEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: string;
  onStatusChange: (newStatus: LeaveType | '取消') => void;
}

export function ShiftEditModal({
  isOpen,
  onClose,
  currentStatus,
  onStatusChange,
}: ShiftEditModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[425px] bg-white shadow-sm border border-green-100"
      >
        <DialogHeader>
          <DialogTitle className="text-green-700 font-medium">勤務状態の変更</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 p-2">
          <RadioGroup
            defaultValue=""
            onValueChange={(value) => onStatusChange(value as LeaveType)}
            className="grid grid-cols-2 gap-3"
          >
            {Object.entries(LEAVE_TYPE_FULL).map(([key, label]) => (
              <div key={key} className={`flex items-center space-x-2 p-2 hover:bg-green-50/50 rounded-md transition-colors ${key === '取消' ? 'hover:bg-blue-50/50' : 'hover:bg-green-50/50'}`}>
                <RadioGroupItem value={key} id={key} />
                <Label 
                  htmlFor={key} 
                  className={`cursor-pointer text-sm ${key === '取消' ? 'text-blue-600' : 'text-gray-600'}`}
                >
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
}