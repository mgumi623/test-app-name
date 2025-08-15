/**
 * シフト自動生成モジュール
 * 
 * このモジュールは以下の機能を提供します：
 * - 月間シフトの自動生成
 * - 週単位でのシフトパターン生成
 * - シフトルールの検証
 * 
 * 主な制約条件：
 * 1. weekly_five_shifts=trueの場合、週2日の休み
 * 2. 週の開始日は管理者設定に従う（日曜/月曜）
 * 3. 上位2名（主任・副主任）は必ずどちらかが出勤
 * 4. 休みはランダムに割り当て
 * 5. 出勤は空白表示
 */

import { Staff } from '../types';
import { validateShifts } from './validateShifts';
import { addDays, startOfWeek, format } from 'date-fns';
import { supabase } from '@/lib/supabase';

/**
 * 管理者設定の型定義
 * @property weekly_five_shifts - 週休二日制の有効/無効
 * @property weekly_sunday - 週の開始日を日曜にするかどうか
 */
interface ShiftSettings {
  weekly_five_shifts: boolean;
  weekly_sunday: boolean;
}

/**
 * 生成されたシフトの型定義
 * @property staffId - スタッフID
 * @property date - 日付
 * @property isWorking - 出勤かどうか
 * @property leaveType - 休暇の種類（休み・有給など）
 */
interface GeneratedShift {
  staffId: string;
  date: number;
  isWorking: boolean;
  leaveType?: string;
}

/**
 * 月間のシフトを自動生成する
 * 
 * @param staff - 対象スタッフの配列
 * @param currentDate - 対象月の日付
 * @returns 生成されたシフトの配列
 */
/**
 * シフト自動生成のルール：
 * 1. 週の基本設定
 *    - weekly_five_shifts=trueの場合：週2日の休み
 *    - weekly_sunday=trueの場合：日曜から土曜
 *    - falseの場合：月曜から日曜
 * 
 * 2. スタッフ配置ルール
 *    - 上位2名（主任・副主任）は必ずどちらかが出勤
 *    - 役職の優先順位：主任 > 副主任 > 一般
 * 
 * 3. 休みの割り当て
 *    - 週に2日の休みを自動的に割り当て
 *    - ランダムに休みを振り分け
 * 
 * 4. 制約条件
 *    - 5日以上の連続出勤を避ける
 *    - 一週間のうちに出勤以外の文字がない場合は背景色を赤く表示
 * 
 * 5. 表示ルール
 *    - 出勤は空白表示
 *    - 休みは「休」と表示
 */
export async function generateMonthlyShifts(
  staff: Staff[],
  currentDate: Date,
  existingShifts: ShiftEntry[] = []
): Promise<GeneratedShift[]> {
  // 管理者設定を取得
  const { data: settingsData } = await supabase
    .from('admin_settings')
    .select('weekly_five_shifts, weekly_sunday')
    .single();

  const settings: ShiftSettings = settingsData || {
    weekly_five_shifts: true,
    weekly_sunday: true
  };

  const shifts: GeneratedShift[] = [];
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  // 上位2名のスタッフを取得（役職で並び替え）
  const seniorStaff = staff
    .filter(s => s.position === '主任' || s.position === '副主任')
    .slice(0, 2);

  // 週ごとにシフトを生成
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    
    // 週の開始日を設定
    const weekStart = startOfWeek(currentDay, {
      weekStartsOn: settings.weekly_sunday ? 0 : 1
    });

    // その日が週の何日目かを計算
    const dayOfWeek = (currentDay.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24);

    // 週の初めの場合、その週の休みを割り当て
    if (dayOfWeek === 0) {
      for (const s of staff) {
        // 各スタッフの週の休み日を決定
        const daysOff = new Set<number>();
        while (daysOff.size < (settings.weekly_five_shifts ? 2 : 1)) {
          const randomDay = Math.floor(Math.random() * 7);
          daysOff.add(randomDay);
        }

        // 週の各日のシフトを生成
        for (let i = 0; i < 7; i++) {
          const shiftDate = addDays(weekStart, i);
          // 月が変わったら終了
          if (shiftDate.getMonth() !== currentDate.getMonth()) continue;

          // 手動編集済みのシフトをチェック
          const existingShift = existingShifts.find(
            shift => shift.staffId === s.id && shift.date === shiftDate.getDate() && shift.manuallyEdited
          );
          
          // 手動編集済みのセルはスキップ
          if (existingShift) {
            shifts.push(existingShift);
            continue;
          }

          // 上位2名のスタッフの場合、交互に出勤を割り当て
          if (seniorStaff.includes(s)) {
            const otherSenior = seniorStaff.find(senior => senior.id !== s.id);
            const otherSeniorShift = shifts.find(
              shift => shift.staffId === otherSenior?.id && shift.date === shiftDate.getDate()
            );

            if (otherSeniorShift?.leaveType === '休') {
              // もう一人が休みの場合は出勤
              shifts.push({
                staffId: s.id,
                date: shiftDate.getDate(),
                isWorking: true
              });
              continue;
            }
          }

          if (daysOff.has(i)) {
            shifts.push({
              staffId: s.id,
              date: shiftDate.getDate(),
              isWorking: false,
              leaveType: '休'
            });
          } else {
            shifts.push({
              staffId: s.id,
              date: shiftDate.getDate(),
              isWorking: true
            });
          }
        }
      }
    }
  }

  return shifts;
}

/**
 * 生成されたシフトが制約条件を満たしているか検証する
 * 
 * @param shifts - 検証対象のシフト配列
 * @param staff - スタッフ情報
 * @param date - 対象月の日付
 * @returns 制約条件を満たしているかどうか
 */
export function validateWeeklyShifts(
  shifts: GeneratedShift[],
  staff: Staff[],
  date: Date
): boolean {
  const staffShifts = new Map<string, GeneratedShift[]>();

  // スタッフごとのシフトをグループ化
  shifts.forEach(shift => {
    if (!staffShifts.has(shift.staffId)) {
      staffShifts.set(shift.staffId, []);
    }
    staffShifts.get(shift.staffId)?.push(shift);
  });

  // 各スタッフの週ごとのシフトを検証
  for (const [staffId, staffShiftList] of staffShifts) {
    const weeklyShifts = new Map<string, GeneratedShift[]>();
    
    staffShiftList.forEach(shift => {
      const shiftDate = new Date(date.getFullYear(), date.getMonth(), shift.date);
      const weekKey = format(startOfWeek(shiftDate), 'yyyy-MM-dd');
      
      if (!weeklyShifts.has(weekKey)) {
        weeklyShifts.set(weekKey, []);
      }
      weeklyShifts.get(weekKey)?.push(shift);
    });

    // 各週のシフトを検証
    for (const weekShifts of weeklyShifts.values()) {
      const daysOff = weekShifts.filter(s => s.leaveType === '休').length;
      if (daysOff !== 2) {
        return false;
      }
    }
  }

  return true;
}