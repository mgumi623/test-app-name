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
import { Plus, Settings } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { POSITION_PRIORITY, PROFESSION_PRIORITY, Staff, PROFESSIONS } from '../data/staff';
import { useTeams } from '../contexts/TeamsContext';
import { useStaff } from '../contexts/StaffContext';

interface StaffListProps {
  teamFilter?: string;
}

export default function StaffList({ teamFilter }: StaffListProps) {
  const { staffList, setStaffList } = useStaff();
  const { teams } = useTeams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffTeam, setNewStaffTeam] = useState('');
  const [newStaffPosition, setNewStaffPosition] = useState('');
  const [newStaffProfession, setNewStaffProfession] = useState('');
  const [newStaffYears, setNewStaffYears] = useState('');

  const sortedStaffList = useMemo(() => {
    return staffList
      .filter(staff => !teamFilter || staff.team === teamFilter)
      .sort((a, b) => {
        const positionDiff = (POSITION_PRIORITY[b.position] || 0) - (POSITION_PRIORITY[a.position] || 0);
        if (positionDiff !== 0) return positionDiff;
        const professionDiff = (PROFESSION_PRIORITY[b.profession] || 0) - (PROFESSION_PRIORITY[a.profession] || 0);
        if (professionDiff !== 0) return professionDiff;
        return b.years - a.years;
      });
  }, [staffList, teamFilter]);

  const addStaff = () => {
    if (!newStaffName || !newStaffTeam || !newStaffPosition || !newStaffProfession) return;

    const newStaff = {
      id: `staff-${staffList.length + 1}`,
      name: newStaffName,
      team: newStaffTeam,
      position: newStaffPosition,
      profession: newStaffProfession,
      years: Number(newStaffYears || 1),
    };
    setStaffList([...staffList, newStaff]);
    setNewStaffName('');
    setNewStaffTeam('');
    setNewStaffPosition('');
    setNewStaffProfession('');
    setNewStaffYears('');
    setIsAddDialogOpen(false);
  };

  return (
    <Card className="shadow-md border-slate-200">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">スタッフ一覧</h2>
        <div className="flex items-center gap-2">
          <Dialog open={isEditMode} onOpenChange={setIsEditMode}>
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
              </DialogHeader>
              <div className="overflow-y-auto max-h-[60vh]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-600">名前</TableHead>
                      <TableHead className="text-slate-600">チーム</TableHead>
                      <TableHead className="text-slate-600">役職</TableHead>
                      <TableHead className="text-slate-600">職種</TableHead>
                      <TableHead className="text-slate-600">経験年数</TableHead>
                      <TableHead className="text-slate-600 w-[100px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedStaffList.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell>
                          <Input
                            value={editingStaff?.id === staff.id ? editingStaff.name : staff.name}
                            onChange={(e) => {
                              if (editingStaff?.id === staff.id) {
                                setEditingStaff({...editingStaff, name: e.target.value});
                              } else {
                                setEditingStaff({...staff, name: e.target.value});
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={editingStaff?.id === staff.id ? editingStaff.team : staff.team}
                            onValueChange={(value) => {
                              if (editingStaff?.id === staff.id) {
                                setEditingStaff({...editingStaff, team: value});
                              } else {
                                setEditingStaff({...staff, team: value});
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {teams.map((team) => (
                                <SelectItem key={team} value={team}>{team}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={editingStaff?.id === staff.id ? editingStaff.position : staff.position}
                            onValueChange={(value) => {
                              if (editingStaff?.id === staff.id) {
                                setEditingStaff({...editingStaff, position: value});
                              } else {
                                setEditingStaff({...staff, position: value});
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {['一般', '主任', '副主任'].map((pos) => (
                                <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={editingStaff?.id === staff.id ? editingStaff.profession : staff.profession}
                            onValueChange={(value) => {
                              if (editingStaff?.id === staff.id) {
                                setEditingStaff({...editingStaff, profession: value});
                              } else {
                                setEditingStaff({...staff, profession: value});
                              }
                            }}
                          >
                            <SelectTrigger>
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
                            min="1"
                            max="20"
                            value={editingStaff?.id === staff.id ? editingStaff.years : staff.years}
                            onChange={(e) => {
                              if (editingStaff?.id === staff.id) {
                                setEditingStaff({...editingStaff, years: Number(e.target.value)});
                              } else {
                                setEditingStaff({...staff, years: Number(e.target.value)});
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                if (editingStaff?.id === staff.id) {
                                  setStaffList((prevList: Staff[]) =>
                                    prevList.map(s =>
                                      s.id === staff.id ? editingStaff : s
                                    )
                                  );
                                  setEditingStaff(null);
                                }
                              }}
                            >
                              保存
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                setStaffList((prevList: Staff[]) =>
                                  prevList.filter(s => s.id !== staff.id)
                                );
                              }}
                            >
                              削除
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                スタッフを追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新規スタッフ追加</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-medium text-slate-900">名前</label>
                  <Input
                    id="name"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder="例：山田太郎"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="team" className="text-sm font-medium text-slate-900">チーム</label>
                  <Select value={newStaffTeam} onValueChange={setNewStaffTeam}>
                    <SelectTrigger>
                      <SelectValue placeholder="チームを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team} value={team}>{team}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="profession" className="text-sm font-medium text-slate-900">職種</label>
                  <Select value={newStaffProfession} onValueChange={setNewStaffProfession}>
                    <SelectTrigger>
                      <SelectValue placeholder="職種を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFESSIONS.map((prof) => (
                        <SelectItem key={prof} value={prof}>{prof}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="position" className="text-sm font-medium text-slate-900">役職</label>
                  <Select value={newStaffPosition} onValueChange={setNewStaffPosition}>
                    <SelectTrigger>
                      <SelectValue placeholder="役職を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {['一般', '主任', '副主任'].map((pos) => (
                        <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="years" className="text-sm font-medium text-slate-900">経験年数</label>
                  <Input
                    id="years"
                    type="number"
                    min="1"
                    max="20"
                    value={newStaffYears}
                    onChange={(e) => setNewStaffYears(e.target.value)}
                    placeholder="例：5"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>キャンセル</Button>
                <Button onClick={addStaff}>追加</Button>
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