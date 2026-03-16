'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TagSelectorProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  selected: T[];
  onChange: (selected: T[]) => void;
}

export function TagSelector<T extends string>({
  label,
  options,
  selected,
  onChange,
}: TagSelectorProps<T>) {
  const toggle = (value: T) => {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="space-y-2.5">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => toggle(value)}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
          >
            <Badge
              variant={selected.includes(value) ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer px-3 py-1.5 rounded-lg transition-all duration-200',
                selected.includes(value)
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:bg-accent/60'
              )}
            >
              {label}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
