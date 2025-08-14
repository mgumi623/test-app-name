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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LeaveType } from '../types';

interface BulkEditDialogProps {
  onBulkEdit: (startDay: number, endDay: number, value: string, selectedStaff: string[]) => void;
  staffList: { id: string; name: string; }[];
  daysInMonth: number;
}

export default function BulkEditDialog({ onBulkEdit, staffList, daysInMonth }: BulkEditDialogProps) {
  const [startDay, setStartDay] = useState(1);
  const [endDay, setEndDay] = useState(daysInMonth);
  const [selectedValue, setSelectedValue] = useState<string>('出勤');
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleSubmit = () => {
    onBulkEdit(startDay, endDay, selectedValue, selectedStaff);
    setIsOpen(false);
  };

  const toggleStaff = (staffId: string) => {
    setSelectedStaff(prev =>
      prev.includes(staffId)
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  const selectAllStaff = () => {
    if (selectedStaff.length === staffList.length) {
      setSelectedStaff([]);
    } else {
      setSelectedStaff(staffList.map(staff => staff.id));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">一括入力</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>シフトの一括入力</DialogTitle>
          <DialogDescription>
            選択した期間と対象者のシフトを一括で設定できます
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label>開始日</Label>
              <Select
                value={startDay.toString()}
                onValueChange={(value) => setStartDay(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map(day => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}日
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>終了日</Label>
              <Select
                value={endDay.toString()}
                onValueChange={(value) => setEndDay(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map(day => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}日
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>シフト内容</Label>
            <Select
              value={selectedValue}
              onValueChange={setSelectedValue}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="出勤">出勤</SelectItem>
                <SelectItem value="休み">休み</SelectItem>
                <SelectItem value="希望休">希望休</SelectItem>
                <SelectItem value="有給">有給</SelectItem>
                <SelectItem value="夏季">夏季</SelectItem>
                <SelectItem value="特別休暇">特別休暇</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>対象スタッフ</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllStaff}
              >
                {selectedStaff.length === staffList.length ? '全て解除' : '全て選択'}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-lg p-2">
              {staffList.map(staff => (
                <div key={staff.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={staff.id}
                    checked={selectedStaff.includes(staff.id)}
                    onCheckedChange={() => toggleStaff(staff.id)}
                  />
                  <Label htmlFor={staff.id}>{staff.name}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={selectedStaff.length === 0}
          >
            一括設定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}