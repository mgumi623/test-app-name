import { CalendarClock } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function Header() {
  return (
    <header className="mb-8 sm:mb-12 text-center">
      <Avatar className="w-16 h-16 mx-auto shadow">
        <AvatarFallback className="bg-secondary border border-border">
          <CalendarClock aria-hidden className="w-8 h-8 text-secondary-foreground" />
        </AvatarFallback>
      </Avatar>
      <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">項目を選択</h1>
      <p className="mt-2 text-sm sm:text-base text-muted-foreground">
        行きたい機能を選ぶとすぐに移動します。
      </p>
    </header>
  );
}