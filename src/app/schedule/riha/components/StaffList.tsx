'use client';

import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Settings, Save, X } from 'lucide-react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStaff } from '../contexts/StaffContext';
import { useTeams } from '../contexts/TeamsContext';
import { generateStaffData } from '../data/generateStaffData';
import { PROFESSIONS } from '../data/staff';

interface StaffListProps {
  teamFilter?: string;
}

type ViewMode = 'list' | 'edit';

interface EditingStaff {
  id: string;
  name: string;
  team: string;
  position: string;
  profession: string;
  years: number;
}

export default function StaffList({ teamFilter }: StaffListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const { staffList, getSortedStaff, getStaffByTeam, createStaff, updateStaff, loading, error, fetchStaff } = useStaff();

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);
  const { teams } = useTeams();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<EditingStaff | null>(null);

  // スタッフデータを初期化
  const initializeStaffData = async () => {
    const newStaffList = generateStaffData();
    await Promise.all(newStaffList.map(staff => createStaff(staff)));
  };

  // フィルタリングとソート済みのスタッフリスト
  // チームでフィルタリングされたスタッフリスト
  const sortedStaffList = useMemo(() => {
    console.log('StaffList rendering with teamFilter:', teamFilter);
    const allStaff = getSortedStaff('position', 'desc');
    console.log('All staff:', allStaff);
    if (!teamFilter) return allStaff;
    const filteredStaff = allStaff.filter(staff => staff.team === teamFilter);
    console.log('Filtered staff:', filteredStaff);
    return filteredStaff;
  }, [getSortedStaff, teamFilter]);

  // 編集開始
  const handleEdit = useCallback((staff: EditingStaff) => {
    setEditingStaff(staff);
    setIsEditDialogOpen(true);
  }, []);

  // 編集保存
  const handleSave = useCallback(async () => {
    if (!editingStaff) return;

    try {
      await updateStaff(editingStaff.id, {
        name: editingStaff.name,
        team: editingStaff.team,
        position: editingStaff.position,
        profession: editingStaff.profession,
        years: editingStaff.years
      });
      setEditingStaff(null);
      setIsEditDialogOpen(false);
    } catch (err) {
      console.error('Failed to update staff:', err);
    }
  }, [editingStaff, updateStaff]);

  // 編集キャンセル
  const handleCancel = useCallback(() => {
    setEditingStaff(null);
    setIsEditDialogOpen(false);
  }, []);

  return (
    <Card className="shadow-md border-slate-200">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">スタッフ一覧</h2>
        <div className="flex items-center gap-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                編集
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-full">
              <DialogHeader>
                <DialogTitle>スタッフ一覧編集</DialogTitle>
                <p className="text-sm text-gray-500">
                  スタッフの情報を編集します。
                </p>
              </DialogHeader>
              <div className="flex justify-end gap-2 mb-4">
                <Button 
                  variant="outline"
                  onClick={initializeStaffData}
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  スタッフデータを初期化
                </Button>
              </div>
              <div className="overflow-y-auto max-h-[60vh]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-600">名前</TableHead>
                      <TableHead className="text-slate-600">チーム</TableHead>
                      <TableHead className="text-slate-600">役職</TableHead>
                      <TableHead className="text-slate-600">職種</TableHead>
                      <TableHead className="text-slate-600">経験年数</TableHead>
                      <TableHead className="text-slate-600 w-20">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedStaffList.map((staff) => (
                      <TableRow key={staff.id}>
                        {editingStaff?.id === staff.id ? (
                          <>
                            <TableCell>
                              <Input
                                value={editingStaff.name}
                                onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                value={editingStaff.team}
                                onValueChange={(value) => setEditingStaff({ ...editingStaff, team: value })}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {teams.map((team) => (
                                    <SelectItem key={team.id} value={team.name}>{team.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={editingStaff.position}
                                onValueChange={(value) => setEditingStaff({ ...editingStaff, position: value })}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="主任">主任</SelectItem>
                                  <SelectItem value="副主任">副主任</SelectItem>
                                  <SelectItem value="一般">一般</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={editingStaff.profession}
                                onValueChange={(value) => setEditingStaff({ ...editingStaff, profession: value })}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PROFESSIONS.map((prof) => (
                                    <SelectItem key={prof} value={prof}>{prof}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={editingStaff.years}
                                onChange={(e) => setEditingStaff({ ...editingStaff, years: parseInt(e.target.value) || 0 })}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleSave}
                                  className="bg-green-50 text-green-700 hover:bg-green-100"
                                >
                                  <Save className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancel}
                                  className="bg-red-50 text-red-700 hover:bg-red-100"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>{staff.name}</TableCell>
                            <TableCell>{staff.team}</TableCell>
                            <TableCell>{staff.position}</TableCell>
                            <TableCell>{staff.profession}</TableCell>
                            <TableCell>{staff.years}年目</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(staff)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                編集
                              </Button>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-4">
        <Table className="[&_tr:hover]:bg-slate-50">
          <TableHeader>
            <TableRow>
              <TableHead className="text-slate-600">名前</TableHead>
              <TableHead className="text-slate-600">チーム</TableHead>
              <TableHead className="text-slate-600">役職</TableHead>
              <TableHead className="text-slate-600">職種</TableHead>
              <TableHead className="text-slate-600">経験年数</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStaffList.map((staff) => (
              <TableRow key={staff.id} className="transition-colors">
                <TableCell>{staff.name}</TableCell>
                <TableCell>{staff.team}</TableCell>
                <TableCell>{staff.position}</TableCell>
                <TableCell>{staff.profession}</TableCell>
                <TableCell>{staff.years}年目</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}