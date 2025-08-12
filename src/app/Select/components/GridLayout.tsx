import { Option } from '../types';
import OptionCard from './OptionCard';

interface GridLayoutProps {
  options: Option[];
  selectedId: string | null;
  isPending: boolean;
  onNavigate: (option: Option) => void;
}

export default function GridLayout({ options, selectedId, isPending, onNavigate }: GridLayoutProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {options.map((option) => {
        const active = selectedId === option.id && isPending;
        return (
          <div key={option.id} className="w-full">
            <OptionCard
              option={option}
              isActive={active}
              isPending={isPending}
              onNavigate={onNavigate}
            />
          </div>
        );
      })}
    </div>
  );
}