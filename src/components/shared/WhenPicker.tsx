'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';

interface WhenPickerProps {
  value: Date | null; // null = now
  onChange: (date: Date | null) => void;
}

/**
 * Compact "when did this happen?" picker for log forms.
 * Defaults to "Now". Tap to switch to a date + time picker for retroactive logging.
 */
export function WhenPicker({ value, onChange }: WhenPickerProps) {
  const [custom, setCustom] = useState(value !== null);

  const handleToggle = () => {
    if (custom) {
      // Switch back to "now"
      setCustom(false);
      onChange(null);
    } else {
      // Switch to custom — default to current time
      setCustom(true);
      onChange(new Date());
    }
  };

  // Format the date/time input values
  const dateValue = value ? format(value, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
  const timeValue = value ? format(value, 'HH:mm') : format(new Date(), 'HH:mm');

  const handleDateChange = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const next = value ? new Date(value) : new Date();
    next.setFullYear(y, m - 1, d);
    onChange(next);
  };

  const handleTimeChange = (timeStr: string) => {
    const [h, min] = timeStr.split(':').map(Number);
    const next = value ? new Date(value) : new Date();
    next.setHours(h, min, 0, 0);
    onChange(next);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
      >
        <Clock className="h-3.5 w-3.5" />
        {custom ? 'Custom time' : 'Now'}
      </button>

      {custom && (
        <div className="flex items-center gap-1.5 animate-fade-in">
          <input
            type="date"
            value={dateValue}
            onChange={(e) => handleDateChange(e.target.value)}
            className="rounded-lg border border-border/60 bg-transparent px-2 py-1 text-sm tabular-nums"
          />
          <input
            type="time"
            value={timeValue}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="rounded-lg border border-border/60 bg-transparent px-2 py-1 text-sm tabular-nums"
          />
        </div>
      )}
    </div>
  );
}
