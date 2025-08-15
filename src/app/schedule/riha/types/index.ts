export type ViewType = 'shift' | 'staff' | 'settings' | 'next-month-shift' | string;

export type LeaveType = '出勤' | '休' | '欠' | '有' | '早' | '時' | '夏' | '特';

export const LEAVE_TYPE_FULL: Record<LeaveType, string> = {
  '出勤': '出勤',
  '休': '休み',
  '欠': '欠勤',
  '有': '有給',
  '早': '早退',
  '時': '時間給',
  '夏': '夏季休暇',
  '特': '特別休暇',
  '取消': '取り消し'
} as const;

export interface ShiftEntry {
  manuallyEdited?: boolean;
  staffId: string;
  date: number;
  isWorking: boolean;
  leaveType?: LeaveType;
  originalStatus?: string;  // 変更前の状態を保持
}