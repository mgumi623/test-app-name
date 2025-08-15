import { useState, useMemo, useCallback } from 'react';
import { generateMonthlyShifts } from '../utils/shiftGenerator';
import { PasswordDialog } from './PasswordDialog';
import { getDaysInMonth, format, isWeekend, getDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Staff, POSITION_PRIORITY, PROFESSION_PRIORITY, TEAMS } from '../data/staff';
import { LeaveType, ShiftEntry, LEAVE_TYPE_FULL } from '../types/index';
import { ShiftEditModal } from './ShiftEditModal';
import { AutoAssignButton } from './AutoAssignButton';

/**
 * シフト表示テーブルコンポーネント
 * 
 * 機能：
 * - シフトの表示
 * - セルのクリックによる編集
 * - 自動配置機能
 * - 印刷機能
 * 
 * 主な機能：
 * 1. スタッフ毎のシフト表示
 * 2. 編集モードでのセル編集
 * 3. 自動配置ボタンによるシフト自動生成
 * 4. 印刷用レイアウト対応
 */
interface ShiftTableProps {
  currentDate: Date;
  teamFilter?: string;
  showTeamSelect?: boolean;
  onViewChange?: (view: string) => void;
  teamStaff?: Staff[];
  onMonthChange?: (offset: number) => void;
}

/**
 * シフト表コンポーネント
 * 
 * @param currentDate - 表示対象の日付
 * @param teamFilter - チームでのフィルタリング
 * @param showTeamSelect - チーム選択を表示するか
 * @param onViewChange - ビュー変更時のコールバック
 * @param teamStaff - チームのスタッフ情報
 * @param onMonthChange - 月変更時のコールバック
 */
export default function ShiftTable({ 
  currentDate, 
  teamFilter, 
  showTeamSelect = true, 
  onViewChange, 
  teamStaff,
  onMonthChange 
}: ShiftTableProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [shifts, setShifts] = useState<ShiftEntry[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{ staffId: string; date: number } | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ staffId: string; date: number } | null>(null);

  const daysInMonth = getDaysInMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const sortedStaff = useMemo(() => {
    const staffToSort = teamStaff || [];
    return staffToSort.sort((a, b) => {
      const positionDiff = (POSITION_PRIORITY[b.position] || 0) - (POSITION_PRIORITY[a.position] || 0);
      if (positionDiff !== 0) return positionDiff;
      const professionDiff = (PROFESSION_PRIORITY[b.profession] || 0) - (PROFESSION_PRIORITY[a.profession] || 0);
      if (professionDiff !== 0) return professionDiff;
      return b.years - a.years;
    });
  }, [teamStaff]);

  const filteredStaff = useMemo(() => {
    const filtered = sortedStaff.filter(staff => selectedTeam === 'all' || staff.team === selectedTeam);
    // 初期表示時はすべてのセルを空白にする
    setShifts([]);
    return filtered;
  }, [sortedStaff, selectedTeam]);

  const getDayStatus = (date: number) => {
    const dayShifts = shifts.filter(s => s.date === date);
    const workingCount = dayShifts.filter(s => s.isWorking).length;
    const isValid = workingCount >= 8;
    return { workingCount, isValid };
  };

  const handleStatusChange = (newStatus: LeaveType | '取消') => {
    if (!editingCell) return;

    const { staffId, date } = editingCell;
    const currentEntry = shifts.find(s => s.staffId === staffId && s.date === date);
    const currentStatus = currentEntry?.leaveType ?? (currentEntry?.isWorking ? '出勤' : '');

    setShifts(prev => {
      const updated = prev.filter(s => !(s.staffId === staffId && s.date === date));
      // 取り消しの場合はセルをクリア
      if (newStatus === '取消') {
        return updated;
      }

      return [...updated, {
        manuallyEdited: true,
        staffId,
        date,
        isWorking: false,
        leaveType: newStatus,
        originalStatus: currentStatus
      }];
    });

    setEditModalOpen(false);
    setEditingCell(null);
  };

  return (
    <Card className="print-table">
      <ShiftEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        currentStatus={
          editingCell 
            ? shifts.find(s => s.staffId === editingCell.staffId && s.date === editingCell.date)?.leaveType ?? '休'
            : '休'
        }
        onStatusChange={handleStatusChange}
      />
      <div className="px-4 pt-1 no-print">
        {showTeamSelect && (
          <div className="flex items-center gap-4">
            <Select
              value={selectedTeam}
              onValueChange={(value) => {
                if (value !== 'all') {
                  onViewChange?.(value);
                } else {
                  setSelectedTeam(value);
                }
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="チームを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全てのチーム</SelectItem>
                {TEAMS.map((team) => (
                  <SelectItem key={team} value={team}>{team}チーム</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="relative py-4 px-6 no-print">
        <div className="absolute right-6 -top-8 flex gap-2">
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="group inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-100 hover:border-blue-100 hover:bg-blue-50 transition-all duration-200"
            title="編集"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400 group-hover:text-blue-500 transition-colors duration-200"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span className="text-sm text-gray-500 group-hover:text-blue-600 font-medium">
              編集する
            </span>
          </button>
          {isEditMode && (
            <AutoAssignButton
              onClick={async () => {
                try {
                  const generatedShifts = await generateMonthlyShifts(sortedStaff, currentDate, shifts);
                  setShifts(generatedShifts);
                } catch (error) {
                  console.error('シフト自動生成エラー:', error);
                }
              }}
            />
          )}
          <button
            onClick={() => window.print()}
            className="group inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-100 hover:border-green-100 hover:bg-green-50 transition-all duration-200"
            title="印刷"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400 group-hover:text-green-500 transition-colors duration-200"
            >
              <path d="M6 9V2h12v7"></path>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <path d="M6 14h12v8H6z"></path>
            </svg>
            <span className="text-sm text-gray-500 group-hover:text-green-600 font-medium">
              印刷する
            </span>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={() => onMonthChange?.(-1)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <path d="m15 18-6-6 6-6"/>
            </svg>
            前月
          </button>
          <h2 className="text-lg font-medium text-gray-900">
            {format(currentDate, 'yyyy年 M月', { locale: ja })}のシフト表
          </h2>
          <button
            onClick={() => onMonthChange?.(1)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            翌月
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-gray-100 w-40 left-0 z-20 sticky text-center">スタッフ名</TableHead>
              {days.map(day => {
                const dayStatus = getDayStatus(day);
                const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                return (
                  <TableHead 
                    key={day}
                    className={`text-center min-w-[64px] transition-colors 
                      ${isWeekend(dateObj) ? 'bg-slate-50' : ''} 
                      ${hoveredCell?.date === day ? 'bg-blue-50 text-blue-900' : ''}
                      ${getDay(dateObj) === 6 ? 'border-r-[1px] border-gray-400' : ''} ${
                      !dayStatus.isValid ? 'bg-red-50' : ''
                    }`}
                  >
                    <div className="text-sm">{day}日</div>
                    <div className={`text-xs ${
                      format(dateObj, 'E', { locale: ja }) === '土' ? 'text-blue-500' :
                      format(dateObj, 'E', { locale: ja }) === '日' ? 'text-red-500' : 
                      'text-gray-500'
                    }`}>
                      {format(dateObj, 'E', { locale: ja })}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.map(staff => (
              <TableRow 
                key={staff.id} 
                className={`even:bg-gray-100 ${hoveredCell?.staffId === staff.id ? 'bg-gray-50' : ''}`}
              >
                <TableCell className={`font-medium left-0 z-10 sticky whitespace-nowrap py-3 text-sm transition-colors flex flex-col items-center justify-center ${hoveredCell?.staffId === staff.id ? 'bg-blue-50 text-blue-900' : 'bg-inherit'}`}>
                  <div>
                    {staff.name}
                    {staff.position !== '一般' && (
                      <div className="text-xs text-gray-500 mt-0.5 text-center w-full">{staff.position}</div>
                    )}
                  </div>
                </TableCell>
                {days.map(day => {
                  const entry = shifts.find(s => s.staffId === staff.id && s.date === day);
                  const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  
                  return (
                    <TableCell 
                      key={day} 
                      onMouseEnter={() => setHoveredCell({ staffId: staff.id, date: day })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`py-6 px-6 text-center transition-all duration-300 hover:bg-blue-100/80 hover:shadow-inner hover:scale-105 cursor-pointer 
                        ${hoveredCell?.date === day ? 'bg-gray-100' : ''} 
                        ${getDay(dateObj) === 6 ? 'border-r-[1px] border-gray-400' : ''}
                        ${entry?.manuallyEdited ? 'bg-yellow-50' : ''} ${
                        entry?.isWorking ? 'text-blue-600' :
                        entry?.leaveType === '休み' ? 'text-red-600' :
                        entry?.leaveType ? 'text-orange-600' : ''
                      }`}
                      onClick={() => {
                        if (isEditMode) {
                          setEditingCell({ staffId: staff.id, date: day });
                          setEditModalOpen(true);
                        }
                      }}
                    >
                      <div>
                        <span>
                          {entry?.leaveType ?? (entry?.isWorking ? '' : '')}
                        </span>
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <PasswordDialog
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => setIsEditMode(true)}
      />
    </Card>
  );
}