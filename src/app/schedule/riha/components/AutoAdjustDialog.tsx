import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from 'lucide-react';
import { ShiftEntry } from '../types';

interface DayStatus {
  date: number;
  workingCount: number;
  entries: ShiftEntry[];
}

interface AutoAdjustDialogProps {
  currentShifts: ShiftEntry[];
  staffList: { id: string; name: string; }[];
  daysInMonth: number;
  onAdjust: (newShifts: ShiftEntry[]) => void;
}

export default function AutoAdjustDialog({
  currentShifts,
  staffList,
  daysInMonth,
  onAdjust
}: AutoAdjustDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustmentResult, setAdjustmentResult] = useState<{
    beforeCount: number;
    afterCount: number;
  } | null>(null);

  const getDayStatus = (shifts: ShiftEntry[], date: number): DayStatus => {
    const entries = shifts.filter(s => s.date === date);
    const workingCount = entries.filter(s => s.isWorking).length;
    return { date, workingCount, entries };
  };

  const autoAdjustShifts = () => {
    setIsAdjusting(true);
    const newShifts = [...currentShifts];
    const problemDays: DayStatus[] = [];

    // 問題のある日を特定
    for (let day = 1; day <= daysInMonth; day++) {
      const status = getDayStatus(newShifts, day);
      if (status.workingCount < 8) {
        problemDays.push(status);
      }
    }

    const beforeProblems = problemDays.length;

    // 各問題日に対して調整を試みる
    problemDays.forEach(day => {
      const shortageCount = 8 - day.workingCount;
      const availableStaff = staffList
        .filter(staff => {
          const entry = newShifts.find(s => s.staffId === staff.id && s.date === day.date);
          return !entry?.isWorking && !entry?.leaveType;
        })
        .sort(() => Math.random() - 0.5) // ランダムに並べ替え
        .slice(0, shortageCount);

      // 出勤者を追加
      availableStaff.forEach(staff => {
        newShifts.push({
          staffId: staff.id,
          date: day.date,
          isWorking: true
        });
      });
    });

    // 結果を確認
    const remainingProblems = Array.from({ length: daysInMonth }, (_, i) => i + 1)
      .filter(day => getDayStatus(newShifts, day).workingCount < 8)
      .length;

    setAdjustmentResult({
      beforeCount: beforeProblems,
      afterCount: remainingProblems
    });

    setTimeout(() => {
      setIsAdjusting(false);
      if (remainingProblems < beforeProblems) {
        onAdjust(newShifts);
      }
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2">自動調整</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>シフトの自動調整</DialogTitle>
          <DialogDescription>
            出勤者が8人未満の日を自動で調整します
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isAdjusting ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2">調整中...</span>
            </div>
          ) : adjustmentResult ? (
            <Alert>
              <AlertDescription>
                {adjustmentResult.beforeCount}件の問題のうち、
                {adjustmentResult.beforeCount - adjustmentResult.afterCount}件を解決しました。
                {adjustmentResult.afterCount > 0 && (
                  <>
                    <br />
                    残り{adjustmentResult.afterCount}件は手動での調整が必要です。
                  </>
                )}
              </AlertDescription>
            </Alert>
          ) : (
            <p className="text-sm text-gray-600">
              出勤者数が不足している日を検出し、可能な範囲で自動調整を行います。
              特別な休暇が設定されている場合は、その設定を優先します。
            </p>
          )}
        </div>

        <DialogFooter>
          {!isAdjusting && (
            <Button
              onClick={autoAdjustShifts}
              disabled={isAdjusting}
            >
              調整を開始
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}