'use client';

import { Eye, Heart } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VisionCardProps {
  id: number;
  title: string;
  content: string;
  type: 'short' | 'long';
  priority: 'high' | 'medium' | 'low';
  author: string;
  date: string;
  likes: number;
  views: number;
  onLike: (id: number) => void;
}

export function VisionCard({
  id,
  title,
  content,
  type,
  priority,
  author,
  date,
  likes,
  views,
  onLike,
}: VisionCardProps) {
  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-emerald-100 text-emerald-800',
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-green-100 hover:border-green-200">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary">{type === 'short' ? '短期' : '長期'}</Badge>
            <Badge className={cn(priorityColors[priority] + ' hover:opacity-80 transition-opacity')}>{priority}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground p-2 bg-green-50/50 rounded-md">{content}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {author}・{date}
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(id)}
            className="text-muted-foreground hover:text-emerald-600"
          >
            <Heart className="w-4 h-4 mr-1" />
            {likes}
          </Button>
          <div className="flex items-center text-muted-foreground">
            <Eye className="w-4 h-4 mr-1" />
            {views}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}