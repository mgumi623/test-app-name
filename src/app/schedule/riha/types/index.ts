export type ViewType = 'shift' | 'staff' | 'settings' | 'next-month-shift' | string;

export type LeaveType = '希望休' | '休み' | '有給' | '夏季' | '特別休暇';

export const LEAVE_TYPE_FULL: Record<LeaveType | '取消', string> = {
  '希望休': '希望休',
  '休み': '休み',
  '有給': '有給休暇',
  '夏季': '夏季休暇',
  '特別休暇': '特別休暇',
  '取消': '取消'
} as const;

export interface ShiftEntry {
  manuallyEdited?: boolean;
  staffId: string;
  date: number;
  isWorking: boolean;
  leaveType?: LeaveType;
  originalStatus?: string;  // 変更前の状態を保持
}