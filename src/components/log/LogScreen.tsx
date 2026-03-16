'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { WorkoutLogForm } from './WorkoutLogForm';
import { RestDayForm } from './RestDayForm';
import { NoteLogForm } from './NoteLogForm';
import { useTabNavigation } from '@/components/shared/TabContext';

type LogType = 'workout' | 'rest_day' | 'note';

const LOG_OPTIONS: { value: LogType; label: string }[] = [
  { value: 'workout', label: 'Workout' },
  { value: 'rest_day', label: 'Rest day' },
  { value: 'note', label: 'Note' },
];

export function LogScreen() {
  const tabCtx = useTabNavigation()!;
  const { logSearchParams, clearLogSearchParams, scrollToTab } = tabCtx;
  const [logType, setLogType] = useState<LogType>('workout');
  const [resetKey, setResetKey] = useState(0);

  // React to search params from TabContext (e.g. when navigating from Today with ?type=workout)
  useEffect(() => {
    if (logSearchParams) {
      const params = new URLSearchParams(logSearchParams);
      const type = params.get('type') as LogType | null;
      if (type && LOG_OPTIONS.some((o) => o.value === type)) {
        setLogType(type);
      }
      clearLogSearchParams();
    }
  }, [logSearchParams, clearLogSearchParams]);

  const handleComplete = () => {
    setResetKey((k) => k + 1);
    scrollToTab('/');
  };

  return (
    <div className="space-y-5">
      {/* Type selector */}
      <div className="flex flex-wrap gap-2">
        {LOG_OPTIONS.map((opt) => (
          <button key={opt.value} type="button" onClick={() => setLogType(opt.value)}>
            <Badge
              variant={logType === opt.value ? 'default' : 'outline'}
              className={`cursor-pointer text-sm px-3.5 py-1.5 rounded-lg transition-all duration-200 ${
                logType === opt.value
                  ? 'shadow-sm'
                  : 'hover:bg-accent/60'
              }`}
            >
              {opt.label}
            </Badge>
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="animate-fade-in">
        {logType === 'workout' && <WorkoutLogForm key={resetKey} onComplete={handleComplete} />}
        {logType === 'rest_day' && <RestDayForm key={resetKey} onComplete={handleComplete} />}
        {logType === 'note' && <NoteLogForm key={resetKey} onComplete={handleComplete} />}
      </div>
    </div>
  );
}
