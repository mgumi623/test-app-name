'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useTeams } from '../contexts/TeamsContext';

interface MinStaffConfig {
  [team: string]: number;
}

export default function MinimumStaffSettings() {
  const { teams } = useTeams();
  const [minStaffConfig, setMinStaffConfig] = useState<MinStaffConfig>({});
  const [isEditing, setIsEditing] = useState(false);
  const [tempConfig, setTempConfig] = useState<MinStaffConfig>({});

  // 初期設定を読み込む
  useEffect(() => {
    const savedConfig = localStorage.getItem('min-staff-config');
    if (savedConfig) {
      setMinStaffConfig(JSON.parse(savedConfig));
      setTempConfig(JSON.parse(savedConfig));
    } else {
      // デフォルト値を設定
      const defaultConfig = teams.reduce((acc, team) => {
        acc[team.id] = 1;
        return acc;
      }, {} as MinStaffConfig);
      setMinStaffConfig(defaultConfig);
      setTempConfig(defaultConfig);
    }
  }, [teams]);

  // 設定を保存
  const handleSave = () => {
    setMinStaffConfig(tempConfig);
    localStorage.setItem('min-staff-config', JSON.stringify(tempConfig));
    setIsEditing(false);
  };

  // 編集をキャンセル
  const handleCancel = () => {
    setTempConfig(minStaffConfig);
    setIsEditing(false);
  };

  // 値の変更
  const handleValueChange = (team: string, value: string) => {
    const numValue = Math.max(1, Math.min(20, parseInt(value) || 1));
    setTempConfig(prev => ({
      ...prev,
      [team]: numValue
    }));
  };

  return (
    <Card className="shadow-sm border-gray-200">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="min-staff" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-green-50/30 data-[state=open]:bg-green-50/50">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">最低出勤人数設定</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    各チームの1日あたりの最低出勤人数を設定します
                  </p>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                        >
                          キャンセル
                        </Button>
                        <Button
                          onClick={handleSave}
                          className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
                        >
                          保存
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
                      >
                        編集
                      </Button>
                    )}
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">チーム</TableHead>
                      <TableHead>最低出勤人数</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teams.map((team) => (
                      <TableRow key={team.id}>
                        <TableCell className="font-medium">{team.name}チーム</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              min={1}
                              max={20}
                              value={tempConfig[team.id] || 1}
                              onChange={(e) => handleValueChange(team.id, e.target.value)}
                              className="w-24"
                            />
                          ) : (
                            <span>{minStaffConfig[team.id] || 1}人</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}