import { useState, useMemo } from 'react';
import { getDaysInMonth, format, isWeekend } from 'date-fns';
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
import { STAFF as ALL_STAFF, POSITION_PRIORITY, PROFESSION_PRIORITY, TEAMS } from '../data/staff';
import { LeaveType, ShiftEntry } from '../types';

interface ShiftTableProps {
  currentDate: Date;
  teamFilter?: string;
  showTeamSelect?: boolean;
  onViewChange?: (view: string) => void;
}

export default function ShiftTable({ currentDate, teamFilter, showTeamSelect = true, onViewChange }: ShiftTableProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [shifts, setShifts] = useState<ShiftEntry[]>([]);

  const daysInMonth = getDaysInMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const sortedStaff = useMemo(() => {
    return ALL_STAFF
      .filter(staff => !teamFilter || staff.team === teamFilter)
      .sort((a, b) => {
        const positionDiff = (POSITION_PRIORITY[b.position] || 0) - (POSITION_PRIORITY[a.position] || 0);
        if (positionDiff !== 0) return positionDiff;
        const professionDiff = (PROFESSION_PRIORITY[b.profession] || 0) - (PROFESSION_PRIORITY[a.profession] || 0);
        if (professionDiff !== 0) return professionDiff;
        return b.years - a.years;
      });
  }, [teamFilter]);

  const filteredStaff = useMemo(() => {
    return sortedStaff.filter(staff => selectedTeam === 'all' || staff.team === selectedTeam);
  }, [sortedStaff, selectedTeam]);

  const getDayStatus = (date: number) => {
    const dayShifts = shifts.filter(s => s.date === date);
    const workingCount = dayShifts.filter(s => s.isWorking).length;
    const isValid = workingCount >= 8;
    return { workingCount, isValid };
  };

  return (
    <Card>
      <div className="px-4 pt-1">
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

      <div className="overflow-x-auto -mt-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-gray-100 w-40 left-0 z-20 sticky">スタッフ名</TableHead>
              {days.map(day => {
                const dayStatus = getDayStatus(day);
                const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                return (
                  <TableHead 
                    key={day}
                    className={`text-center min-w-[80px] ${isWeekend(dateObj) ? 'bg-slate-50' : ''} ${
                      !dayStatus.isValid ? 'bg-red-50' : ''
                    }`}
                  >
                    <div className="text-sm">{day}日</div>
                    <div className={`text-xs ${isWeekend(dateObj) ? 'text-red-500' : 'text-gray-500'}`}>
                      {format(dateObj, 'E', { locale: ja })}
                    </div>
                  </TableHead>
                );
              })}
              <TableHead className="bg-gray-100 right-0 z-20 sticky text-center">
                出勤日数
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.map(staff => (
              <TableRow key={staff.id}>
                <TableCell className="bg-gray-50 font-medium left-0 z-10 sticky whitespace-nowrap py-1 text-sm">
                  <div>
                    {staff.name}
                    {staff.position !== '一般' && (
                      <div className="text-xs text-gray-500 mt-0.5">{staff.position}</div>
                    )}
                  </div>
                </TableCell>
                {days.map(day => {
                  const entry = shifts.find(s => s.staffId === staff.id && s.date === day);
                  const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  
                  return (
                    <TableCell 
                      key={day} 
                      className={`p-2 text-center transition-colors duration-300 ${
                        entry?.isWorking ? 'text-blue-600' :
                        entry?.leaveType === '休み' ? 'text-red-600' :
                        entry?.leaveType ? 'text-orange-600' : ''
                      }`}
                    >
                      {entry?.leaveType ?? (entry?.isWorking ? '出勤' : '休み')}
                    </TableCell>
                  );
                })}
                <TableCell className="bg-gray-50 right-0 z-10 sticky text-center py-1 text-sm">
                  {shifts.filter(s => s.staffId === staff.id && s.isWorking).length}日
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}