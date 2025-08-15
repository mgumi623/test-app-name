'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Key } from 'lucide-react';
import { usePassword } from '../contexts/PasswordContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function PasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { updatePassword, verifyPassword, loading: passwordLoading } = usePassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('すべての項目を入力してください');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('新しいパスワードと確認用パスワードが一致しません');
      return;
    }

    try {
      const isValid = await verifyPassword(currentPassword);
      if (!isValid) {
        setError('現在のパスワードが正しくありません');
        return;
      }

      await updatePassword(newPassword);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('パスワードの更新に失敗しました');
    }
  };

  return (
    <Card className="shadow-sm border-gray-200">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="password-settings" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-green-50/30 data-[state=open]:bg-green-50/50">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900 group-hover:text-green-900">管理者パスワードの設定</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">現在のパスワード</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">新しいパスワード</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">新しいパスワード（確認）</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                  {success && (
                    <p className="text-sm text-green-600">パスワードを更新しました</p>
                  )}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? "更新中..." : "パスワードを更新"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}