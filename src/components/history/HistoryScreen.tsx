'use client';

import { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useEvents } from '@/hooks/useEvents';
import { useSchedule } from '@/hooks/useSchedule';
import { useProfile } from '@/hooks/useProfile';
import {
  computeWeeklyReview,
  generateInsights,
} from '@/lib/analytics';
import { MOOD_TAG_LABELS, MUSCLE_GROUP_LABELS, type MoodTag, type MuscleGroup, type WorkoutCategory } from '@/lib/types';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Lightbulb,
  AlertTriangle,
  BarChart3,
  Activity,
  Dumbbell,
} from 'lucide-react';

const CATEGORY_LABELS: Record<WorkoutCategory, string> = {
  strength: 'Strength',
  cardio: 'Cardio',
  flexibility: 'Flexibility',
  sports: 'Sports',
  other: 'Other',
};

export function HistoryScreen() {
  const { allEvents } = useEvents();
  const { schedule } = useSchedule();
  const { profile } = useProfile();
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDate = weekOffset === 0 ? new Date() : subWeeks(new Date(), -weekOffset);
  const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 });

  const review = useMemo(
    () => computeWeeklyReview(allEvents, schedule, profile.wakeTime, weekDate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allEvents, schedule, profile.wakeTime, weekOffset]
  );

  const insights = useMemo(() => generateInsights(review), [review]);

  // Active categories
  const activeCategories = Object.entries(review.categoryBreakdown)
    .filter(([, count]) => count > 0) as [WorkoutCategory, number][];

  // Active muscle groups
  const activeMuscleGroups = Object.entries(review.muscleGroupBreakdown)
    .filter(([, count]) => count > 0) as [MuscleGroup, number][];

  return (
    <div className="space-y-5 stagger-children">
      {/* Week selector */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setWeekOffset(weekOffset - 1)}
          className="rounded-lg"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <h2 className="font-display text-2xl tracking-tight">Weekly review</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(weekStart, 'MMM d')} &mdash; {format(weekEnd, 'MMM d, yyyy')}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setWeekOffset(weekOffset + 1)}
          disabled={weekOffset >= 0}
          className="rounded-lg"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <Card className="shadow-sm">
          <CardContent className="p-3 text-center space-y-1">
            <p className="text-2xl font-semibold tabular-nums tracking-tight">{review.workoutCount}</p>
            <p className="text-[11px] text-muted-foreground leading-none">Workouts</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-3 text-center space-y-1">
            <p className="text-2xl font-semibold tabular-nums tracking-tight">{review.restDayCount}</p>
            <p className="text-[11px] text-muted-foreground leading-none">Rest days</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-3 text-center space-y-1">
            <p className="text-2xl font-semibold tabular-nums tracking-tight">{review.totalMinutes}</p>
            <p className="text-[11px] text-muted-foreground leading-none">Minutes</p>
          </CardContent>
        </Card>
      </div>

      {/* Average effort */}
      {review.avgEffort !== null && (
        <Card className="shadow-sm">
          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Average effort</h3>
              <span className="text-sm font-semibold tabular-nums">{review.avgEffort.toFixed(1)}/10</span>
            </div>
            <Progress value={review.avgEffort * 10} className="h-1.5" />
          </CardContent>
        </Card>
      )}

      {/* Category breakdown */}
      {activeCategories.length > 0 && (
        <Card className="shadow-sm">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-medium">Category breakdown</h3>
            <div className="space-y-2.5">
              {activeCategories.map(([cat, count]) => {
                const percent = Math.round((count / review.workoutCount) * 100);
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span>{CATEGORY_LABELS[cat]}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {count} ({percent}%)
                      </span>
                    </div>
                    <Progress value={percent} className="h-1.5" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Muscle group breakdown */}
      {activeMuscleGroups.length > 0 && (
        <Card className="shadow-sm">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-medium">Muscle groups hit</h3>
            <div className="flex flex-wrap gap-2">
              {activeMuscleGroups.map(([mg, count]) => (
                <Badge key={mg} variant="secondary" className="rounded-md">
                  {MUSCLE_GROUP_LABELS[mg]} ({count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Common mood tags */}
      {review.commonTags.length > 0 && (
        <Card className="shadow-sm">
          <CardContent className="p-4 space-y-2.5">
            <h3 className="text-sm font-medium">How you felt</h3>
            <div className="flex flex-wrap gap-2">
              {review.commonTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="rounded-md">
                  {MOOD_TAG_LABELS[tag] || tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Streak */}
      {review.streakDays > 0 && (
        <Card className="border-green-300/50 dark:border-green-800/50 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm leading-relaxed">
              {review.streakDays} active day{review.streakDays !== 1 ? 's' : ''} this week.
              {review.streakDays >= 5 ? ' Outstanding consistency!' : ' Keep building momentum.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Insights
          </h3>
          {insights.map((insight, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="flex items-start gap-3 p-3.5">
                {insight.type === 'pattern' && (
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                  </div>
                )}
                {insight.type === 'improvement' && (
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                    <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                )}
                {insight.type === 'suggestion' && (
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                    <Lightbulb className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                <p className="text-sm leading-relaxed">{insight.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {allEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/60">
            <BarChart3 className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">
            No data yet. Start logging workouts to see your patterns.
          </p>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 py-3">
        <Activity className="h-3 w-3 text-primary/40" />
        <p className="text-center text-xs text-muted-foreground italic">
          Progress = consistency over time, not perfection.
        </p>
        <Activity className="h-3 w-3 text-primary/40" />
      </div>
    </div>
  );
}
