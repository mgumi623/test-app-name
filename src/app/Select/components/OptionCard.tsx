import { Users, Loader2 } from 'lucide-react';
import { Option } from '../types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface OptionCardProps {
  option: Option;
  isActive: boolean;
  isPending: boolean;
  onNavigate: (option: Option) => void;
}

export default function OptionCard({ option, isActive, isPending, onNavigate }: OptionCardProps) {
  return (
    <Button
      variant="outline"
      onClick={() => onNavigate(option)}
      disabled={isPending}
      className={[
        'group relative w-full overflow-hidden rounded-2xl text-left h-auto',
        'bg-card border-border transition-all shadow-sm',
        'hover:-translate-y-1 hover:bg-gradient-to-br hover:from-white hover:to-gray-50 hover:shadow-xl hover:shadow-gray-400/25 hover:border-gray-300',
        'disabled:opacity-70 disabled:cursor-not-allowed',
        'p-5 sm:p-6 min-h-[200px]',
      ].join(' ')}
      aria-busy={isActive || undefined}
      aria-describedby={`${option.id}-desc`}
      asChild
    >
      <div>
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 opacity-60 group-hover:opacity-80 transition-opacity bg-gradient-to-r ${option.gradient}`}
      />
      <div className="relative z-10 flex items-start gap-4">
        <Avatar className="shrink-0 w-12 h-12">
          <AvatarFallback className="bg-muted border border-border">
            <option.Icon className="w-6 h-6 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs border border-border text-secondary-foreground">
              {option.department}
            </span>
          </div>
          <h3 className="mt-2 text-lg font-semibold leading-tight text-card-foreground">
            {option.label}
          </h3>
          <p id={`${option.id}-desc`} className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {option.description}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <span
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium transition-all group-hover:translate-x-0.5 text-secondary-foreground"
              aria-hidden
            >
              {isActive ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Users className="w-4 h-4" />
              )}
              {isActive ? '移動中…' : '開く'}
            </span>
            <span className="text-xs text-muted-foreground" aria-hidden>
              Enter / Space で決定
            </span>
          </div>
        </div>
      </div>
      </div>
    </Button>
  );
}