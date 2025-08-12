import { Grid3x3, List, AlignLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type LayoutType = 'grid' | 'accordion' | 'list';

interface LayoutSwitcherProps {
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
}

const layouts = [
  { type: 'accordion' as const, icon: List, label: 'カテゴリ別' },
  { type: 'grid' as const, icon: Grid3x3, label: 'グリッド' },
  { type: 'list' as const, icon: AlignLeft, label: 'リスト' },
];

export default function LayoutSwitcher({ currentLayout, onLayoutChange }: LayoutSwitcherProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="text-sm font-medium text-muted-foreground mr-2">表示形式:</span>
      {layouts.map(({ type, icon: Icon, label }) => (
        <Button
          key={type}
          variant={currentLayout === type ? 'default' : 'outline'}
          size="sm"
          onClick={() => onLayoutChange(type)}
          className="flex items-center gap-2"
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  );
}