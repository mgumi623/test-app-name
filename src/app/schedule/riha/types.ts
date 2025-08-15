export type LeaveType = '希望休' | '休み' | '有給' | '夏季' | '特別休暇';

export type ViewType = 'month' | 'week';

export interface Staff {
  id: string;
  name: string;
}

export interface ShiftEntry {
  manuallyEdited?: boolean;
  staffId: string;
  date: number;
  leaveType?: LeaveType;
  isWorking: boolean;
}

export interface DayStatus {
  date: number;
  workingCount: number;
  entries: ShiftEntry[];
}