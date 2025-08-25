'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'message' | 'vision';
  onSubmit: (data: {
    title?: string;
    content: string;
    type?: 'short' | 'long';
    priority?: 'high' | 'medium' | 'low';
  }) => void;
}

export function CreatePostDialog({
  open,
  onOpenChange,
  type,
  onSubmit,
}: CreatePostDialogProps) {
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    type: 'short' | 'long';
    priority: 'high' | 'medium' | 'low';
  }>({
    title: '',
    content: '',
    type: 'short',
    priority: 'medium',
  });

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({
      title: '',
      content: '',
      type: 'short',
      priority: 'medium',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {type === 'message' ? '意見を投稿' : '目標・ビジョンを投稿'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {type === 'vision' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">タイトル</label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="目標・ビジョンのタイトル"
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">内容</label>
            <Textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder={
                type === 'message'
                  ? 'あなたの意見やフィードバックを入力してください...'
                  : '目標の詳細や方針を入力してください...'
              }
              rows={4}
            />
          </div>
          {type === 'vision' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">期間</label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'short' | 'long') =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="期間を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">短期</SelectItem>
                    <SelectItem value="long">長期</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">優先度</label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: 'high' | 'medium' | 'low') =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="優先度を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            キャンセル
          </Button>
          <Button onClick={handleSubmit}>
            <Send className="w-4 h-4 mr-2" />
            投稿する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}