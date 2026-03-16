'use client';

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

export function SliderField({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
  step = 1,
  description,
}: SliderFieldProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted/60 text-sm font-medium tabular-nums">
          {value}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(val) => onChange(Array.isArray(val) ? val[0] : val)}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
