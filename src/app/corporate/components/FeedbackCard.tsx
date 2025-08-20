'use client';

import { Heart, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FeedbackCardProps {
  replies?: { author: string; content: string; date: string }[];
  id: number;
  content: string;
  category: 'workplace' | 'training' | 'general';
  likes: number;
  date: string;
  anonymous: boolean;
  author?: string;
  onLike: (id: number) => void;
  onReply: () => void;
}

export function FeedbackCard({
  id,
  content,
  category,
  likes,
  date,
  anonymous,
  author,
  onLike,
  onReply,
  replies = [],
}: FeedbackCardProps) {
  const categoryColors = {
    workplace: 'bg-emerald-100 text-emerald-800',
    training: 'bg-green-100 text-green-800',
    general: 'bg-teal-100 text-teal-800',
  };

  const categoryLabels = {
    workplace: '職場環境',
    training: '研修',
    general: '一般',
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-green-100 hover:border-green-200">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <Badge className={categoryColors[category]}>
            {categoryLabels[category]}
          </Badge>
        </div>
        <p className="text-muted-foreground p-2 bg-green-50/50 rounded-md">{content}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {date}・{anonymous ? '匿名' : author || '社員'}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(id)}
            className="text-muted-foreground hover:text-emerald-600"
          >
            <Heart className="w-4 h-4 mr-1" />
            {likes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReply}
            className="text-muted-foreground hover:text-emerald-600"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            返信
          </Button>
        </div>
        {replies.length > 0 && (
          <div className="mt-4 space-y-3 border-t border-green-100 pt-3">
            {replies.map((reply, index) => (
              <div key={index} className="bg-green-50/30 p-3 rounded-md">
                <p className="text-sm text-muted-foreground mb-2">{reply.content}</p>
                <div className="text-xs text-muted-foreground">
                  {reply.author} • {reply.date}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}