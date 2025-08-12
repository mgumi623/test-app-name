import { Option } from '../types';
import { Loader2 } from 'lucide-react';

interface ListLayoutProps {
  options: Option[];
  selectedId: string | null;
  isPending: boolean;
  onNavigate: (option: Option) => void;
}

export default function ListLayout({ options, selectedId, isPending, onNavigate }: ListLayoutProps) {
  return (
    <div className="space-y-2">
      {options.map((option) => {
        const active = selectedId === option.id && isPending;
        return (
          <button
            key={option.id}
            onClick={() => onNavigate(option)}
            disabled={isPending}
            className={`
              w-full text-left p-4 rounded-lg border transition-all duration-200
              hover:shadow-md hover:scale-[1.01] active:scale-[0.99]
              ${active
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-border bg-card hover:border-primary/50'
              }
              ${isPending && !active ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-label={`${option.label}に移動`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">
                  {option.label}
                </h3>
                {option.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {option.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-3 ml-4">
                {option.Icon && (
                  <div className="flex-shrink-0 text-muted-foreground">
                    <option.Icon className="w-5 h-5" />
                  </div>
                )}
                
                {active && (
                  <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0" />
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}