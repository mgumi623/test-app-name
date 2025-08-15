'use client';

import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Settings } from 'lucide-react';
import { useAdvancedSettings } from '../contexts/AdvancedSettingsContext';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function AdvancedSettings() {
  const { settings, updateSettings, isLoading } = useAdvancedSettings();
  return (
    <Card className="shadow-sm border-gray-200">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="advanced-settings" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-green-50/30 data-[state=open]:bg-green-50/50">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">詳細設定</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>週5勤務で調整</Label>
                      <p className="text-sm text-gray-500">スタッフの勤務日数を週5日に自動調整します</p>
                    </div>
                    <Switch 
                      checked={settings.weeklyFiveShifts} 
                      onCheckedChange={(checked) => updateSettings('weeklyFiveShifts', checked)} 
                      disabled={isLoading}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>週の区切り（日曜から土曜）</Label>
                      <p className="text-sm text-gray-500">チェックを外すと月曜から日曜になります</p>
                    </div>
                    <Switch 
                      checked={settings.weekStartsSunday} 
                      onCheckedChange={(checked) => updateSettings('weekStartsSunday', checked)}
                      disabled={isLoading}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>主任・副主任の出勤調整</Label>
                      <p className="text-sm text-gray-500">主任・副主任のどちらかが必ず出勤になるよう調整（不在の場合は上位2名が出勤）</p>
                    </div>
                    <Switch 
                      checked={settings.seniorStaffAdjustment} 
                      onCheckedChange={(checked) => updateSettings('seniorStaffAdjustment', checked)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}