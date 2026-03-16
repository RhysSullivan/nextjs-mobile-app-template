'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { TabLink } from '@/components/shared/TabLink';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Dumbbell,
  Calendar,
  Clock,
  Timer,
  PenLine,
  CheckCircle2,
  Circle,
  ArrowRight,
  Activity,
  Settings,
  Download,
} from 'lucide-react';
import { startViewTransition } from '@/lib/view-transition';
import { useProfile } from '@/hooks/useProfile';
import { useSchedule } from '@/hooks/useSchedule';
import { useEvents } from '@/hooks/useEvents';
import {
  getNextHelpfulStep,
  didWorkoutToday,
  getCurrentStreak,
  getThisWeekWorkoutCount,
  getThisWeekTotalMinutes,
} from '@/lib/analytics';
import { SCHEDULE_TYPE_LABELS } from '@/lib/defaults';
import type { ScheduleSlot } from '@/lib/types';

export function TodayScreen() {
  const { profile } = useProfile();
  const { schedule } = useSchedule();
  const today = format(new Date(), 'yyyy-MM-dd');
  const { events, allEvents } = useEvents(today);
  const [now, setNow] = useState(new Date());
  const router = useRouter();

  // Update time every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const nowTime = format(now, 'HH:mm');

  const nextStep = getNextHelpfulStep(events, schedule, today, nowTime);

  const workedOutToday = didWorkoutToday(events, today);
  const streak = getCurrentStreak(allEvents);
  const weekWorkouts = getThisWeekWorkoutCount(allEvents);
  const weekMinutes = getThisWeekTotalMinutes(allEvents);

  // Today's schedule completion
  const enabledSlots = schedule.filter((s) => s.enabled);
  const completedSlots = enabledSlots.filter((slot) => {
    // A slot is "complete" if there's a workout event logged after (or around) its time
    return events.some((e) => e.type === 'workout');
  });
  const completionPercent =
    enabledSlots.length > 0
      ? (workedOutToday ? Math.min(completedSlots.length, enabledSlots.length) / enabledSlots.length : 0) * 100
      : 0;

  return (
    <div className="space-y-5 stagger-children">
      {/* Date header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-3xl tracking-tight">Today</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(now, 'EEEE, MMMM d')}
            <span className="ml-2 tabular-nums">{format(now, 'h:mm a')}</span>
          </p>
        </div>
        <div className="flex items-center gap-1 -mr-2 pt-1">
          <button
            type="button"
            onClick={() => {
              document.documentElement.classList.remove('vt-back');
              startViewTransition(() => router.push('/export'));
            }}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
            aria-label="Export"
          >
            <Download className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => {
              document.documentElement.classList.remove('vt-back');
              startViewTransition(() => router.push('/settings'));
            }}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
            aria-label="Settings"
          >
            <Settings className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      {/* Next helpful step */}
      <Card className={nextStep.urgent ? 'border-primary/40 shadow-sm shadow-primary/5' : 'shadow-sm'}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <ArrowRight className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-2.5 flex-1">
              <p className="text-sm font-medium leading-snug">{nextStep.message}</p>
              {nextStep.action === 'log_workout' && (
                <TabLink href="/log?type=workout">
                  <Button size="sm" variant="default" className="rounded-lg">
                    Log workout now
                  </Button>
                </TabLink>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2.5">
        <TabLink href="/log?type=workout" className="block">
          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-1.5 rounded-xl border-border/60 bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
            <Dumbbell className="h-5 w-5 text-primary/80" />
            <span className="text-xs font-medium">Log workout</span>
          </Button>
        </TabLink>
        <TabLink href="/log?type=rest_day" className="block">
          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-1.5 rounded-xl border-border/60 bg-card shadow-sm hover:shadow-md hover:border-green-400/40 transition-all duration-200">
            <Calendar className="h-5 w-5 text-green-500/80" />
            <span className="text-xs font-medium">Rest day</span>
          </Button>
        </TabLink>
        <TabLink href="/timer" className="block">
          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-1.5 rounded-xl border-border/60 bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
            <Timer className="h-5 w-5 text-primary/80" />
            <span className="text-xs font-medium">Timer</span>
          </Button>
        </TabLink>
        <TabLink href="/log?type=note" className="block">
          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-1.5 rounded-xl border-border/60 bg-card shadow-sm hover:shadow-md transition-all duration-200">
            <PenLine className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-medium">Note</span>
          </Button>
        </TabLink>
      </div>

      {/* Today's schedule progress */}
      <Card className="shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Today&apos;s schedule</h3>
            <span className="text-xs text-muted-foreground tabular-nums">
              {workedOutToday ? 1 : 0}/{enabledSlots.length} sessions
            </span>
          </div>
          <Progress value={completionPercent} className="h-2" />

          <div className="space-y-2.5">
            {enabledSlots.map((slot) => {
              const isPast = slot.time < nowTime;
              const done = workedOutToday && isPast;
              const label = SCHEDULE_TYPE_LABELS[slot.type] || slot.type;
              return (
                <div
                  key={slot.type}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2.5">
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Circle className={`h-4 w-4 ${isPast ? 'text-amber-500' : 'text-border'}`} />
                    )}
                    <span className={done ? 'text-muted-foreground line-through' : ''}>
                      {label}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatTime12(slot.time)}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2.5">
        <Card className="shadow-sm">
          <CardContent className="p-3 text-center space-y-1">
            <p className="text-2xl font-semibold tabular-nums tracking-tight">{weekWorkouts}</p>
            <p className="text-[11px] text-muted-foreground leading-none">This week</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-3 text-center space-y-1">
            <p className="text-2xl font-semibold tabular-nums tracking-tight">{streak}</p>
            <p className="text-[11px] text-muted-foreground leading-none">Day streak</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-3 text-center space-y-1">
            <p className="text-2xl font-semibold tabular-nums tracking-tight">{weekMinutes}</p>
            <p className="text-[11px] text-muted-foreground leading-none">Minutes</p>
          </CardContent>
        </Card>
      </div>

      {/* Motivational copy */}
      <div className="flex items-center justify-center gap-2 py-3">
        <Activity className="h-3 w-3 text-primary/40" />
        <p className="text-center text-xs text-muted-foreground italic">
          Consistency beats intensity. Show up and move.
        </p>
        <Activity className="h-3 w-3 text-primary/40" />
      </div>
    </div>
  );
}

function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}
