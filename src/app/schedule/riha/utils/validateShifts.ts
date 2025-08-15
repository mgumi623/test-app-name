import { ShiftEntry } from '../types';

/**
 * 連続出勤日数をチェックする
 * @param shifts - チェック対象のシフト配列
 * @param staffId - スタッフID
 * @returns 最大連続出勤日数
 */
export function getConsecutiveWorkDays(shifts: ShiftEntry[], staffId: string): number {
  let maxConsecutive = 0;
  let current = 0;

  // 日付でソート
  const sortedShifts = [...shifts]
    .filter(s => s.staffId === staffId)
    .sort((a, b) => a.date - b.date);

  for (const shift of sortedShifts) {
    if (shift.isWorking && !shift.leaveType) {
      current++;
      maxConsecutive = Math.max(maxConsecutive, current);
    } else {
      current = 0;
    }
  }

  return maxConsecutive;
}

/**
 * シフトのバリデーション
 * - 5日以上の連続出勤をチェック
 * @param shifts - チェック対象のシフト配列
 * @returns バリデーション結果とエラーメッセージ
 */
export function validateShifts(shifts: ShiftEntry[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const staffIds = [...new Set(shifts.map(s => s.staffId))];

  for (const staffId of staffIds) {
    const consecutiveDays = getConsecutiveWorkDays(shifts, staffId);
    if (consecutiveDays >= 5) {
      errors.push(`スタッフID ${staffId} が ${consecutiveDays} 日連続で出勤になっています`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}