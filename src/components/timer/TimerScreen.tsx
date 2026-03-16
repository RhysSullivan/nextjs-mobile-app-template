'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTimer } from '@/hooks/useTimer';
import { Activity, Play, Square, RotateCcw, CheckCircle2 } from 'lucide-react';

const DURATION_PRESETS = [
  { label: '5 min', seconds: 5 * 60 },
  { label: '10 min', seconds: 10 * 60 },
  { label: '15 min', seconds: 15 * 60 },
  { label: '30 min', seconds: 30 * 60 },
  { label: '60 min', seconds: 60 * 60 },
];

export function TimerScreen() {
  const [durationSeconds, setDurationSeconds] = useState(10 * 60);
  const timer = useTimer(durationSeconds);

  const circumference = 2 * Math.PI * 120;
  const dashOffset = circumference * (1 - timer.progress);

  if (timer.isComplete) {
    return (
      <div className="space-y-6 stagger-children">
        <div className="flex flex-col items-center justify-center gap-6 py-12 animate-fade-in">
          <CheckCircle2 className="h-20 w-20 text-green-600 dark:text-green-400 animate-check-pop" />
          <div className="text-center space-y-2">
            <h2 className="font-display text-3xl tracking-tight">Time&apos;s up!</h2>
            <p className="text-muted-foreground">
              Great work. You stayed with it for {Math.round(durationSeconds / 60)} minutes.
            </p>
          </div>
          <Button onClick={timer.reset} variant="outline" className="rounded-xl">
            <RotateCcw className="mr-2 h-4 w-4" />
            Start another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 stagger-children">
      <div className="text-center">
        <h2 className="font-display text-3xl tracking-tight">Workout timer</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Set a duration and focus on your session.
        </p>
      </div>

      {/* Circular timer */}
      <div className="flex justify-center py-6">
        <div className="relative flex items-center justify-center">
          <svg width="280" height="280" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="140"
              cy="140"
              r="120"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/30"
            />
            {/* Progress circle */}
            <circle
              cx="140"
              cy="140"
              r="120"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="text-primary transition-all duration-1000 ease-linear"
            />
          </svg>
          {/* Timer display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className={`font-display text-5xl tabular-nums tracking-tight ${timer.isRunning ? 'animate-pulse' : ''}`}>
              {timer.display}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {timer.isRunning ? 'In progress' : 'Ready'}
            </p>
          </div>
        </div>
      </div>

      {/* Duration quick-select */}
      {!timer.isRunning && (
        <div className="flex flex-wrap justify-center gap-2 animate-fade-in">
          {DURATION_PRESETS.map((preset) => (
            <button
              key={preset.seconds}
              type="button"
              onClick={() => {
                setDurationSeconds(preset.seconds);
                timer.reset();
              }}
            >
              <Badge
                variant={durationSeconds === preset.seconds ? 'default' : 'outline'}
                className={`cursor-pointer px-3.5 py-1.5 rounded-lg transition-all duration-200 ${
                  durationSeconds === preset.seconds ? 'shadow-sm' : 'hover:bg-accent/60'
                }`}
              >
                {preset.label}
              </Badge>
            </button>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {!timer.isRunning ? (
          <Button onClick={timer.start} size="lg" className="rounded-xl px-8">
            <Play className="mr-2 h-5 w-5" />
            Start
          </Button>
        ) : (
          <Button onClick={timer.stop} size="lg" variant="destructive" className="rounded-xl px-8">
            <Square className="mr-2 h-5 w-5" />
            Stop
          </Button>
        )}
        <Button onClick={timer.reset} size="lg" variant="outline" className="rounded-xl">
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>

      {/* Supportive copy */}
      <div className="flex items-center justify-center gap-2 py-3">
        <Activity className="h-3 w-3 text-primary/40" />
        <p className="text-center text-xs text-muted-foreground italic">
          Every minute counts. Stay present.
        </p>
        <Activity className="h-3 w-3 text-primary/40" />
      </div>
    </div>
  );
}
