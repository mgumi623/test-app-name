'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface ReplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (content: string) => void;
  messageContent: string;
}

export function ReplyDialog({
  open,
  onOpenChange,
  onSubmit,
  messageContent,
}: ReplyDialogProps) {
  const [replyContent, setReplyContent] = useState('');

  const handleSubmit = () => {
    if (replyContent.trim()) {
      onSubmit(replyContent);
      setReplyContent('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>フィードバックに返信</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm text-muted-foreground">{messageContent}</p>
          </div>
          
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="返信内容を入力してください"
            className="min-h-[100px]"
          />
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            送信
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}