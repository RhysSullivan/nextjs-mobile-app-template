import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import type {
  AppEvent,
  WorkoutEvent,
  ScheduleSlot,
  WeeklyReview,
  WorkoutCategory,
  MuscleGroup,
  MoodTag,
} from './types';

// ─── Helper: filter workouts ──────────────────────────────────────

export function getWorkoutsForDate(events: AppEvent[], date: string): WorkoutEvent[] {
  return events.filter(
    (e) => e.localDate === date && e.type === 'workout'
  ) as WorkoutEvent[];
}

export function didWorkoutToday(events: AppEvent[], date: string): boolean {
  return events.some((e) => e.localDate === date && e.type === 'workout');
}

// ─── Current streak ───────────────────────────────────────────────

export function getCurrentStreak(allEvents: AppEvent[]): number {
  const today = format(new Date(), 'yyyy-MM-dd');
  let streak = 0;
  let date = today;

  while (true) {
    const hasWorkout = allEvents.some(
      (e) => e.localDate === date && e.type === 'workout'
    );
    const hasRestDay = allEvents.some(
      (e) => e.localDate === date && e.type === 'rest_day'
    );

    if (hasWorkout || hasRestDay) {
      streak++;
      // Go to previous day
      const d = parseISO(date);
      d.setDate(d.getDate() - 1);
      date = format(d, 'yyyy-MM-dd');
    } else {
      break;
    }
  }

  return streak;
}

// ─── This week stats ──────────────────────────────────────────────

export function getThisWeekWorkoutCount(allEvents: AppEvent[]): number {
  const now = new Date();
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');

  return allEvents.filter(
    (e) => e.type === 'workout' && e.localDate >= weekStart && e.localDate <= weekEnd
  ).length;
}

export function getThisWeekTotalMinutes(allEvents: AppEvent[]): number {
  const now = new Date();
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');

  return allEvents
    .filter((e) => e.type === 'workout' && e.localDate >= weekStart && e.localDate <= weekEnd)
    .reduce((sum, e) => sum + ((e as WorkoutEvent).durationMinutes || 0), 0);
}

// ─── Weekly review computation ────────────────────────────────────

export function computeWeeklyReview(
  allEvents: AppEvent[],
  schedule: ScheduleSlot[],
  wakeTime: string,
  weekDate: Date,
): Omit<WeeklyReview, 'id' | 'notes' | 'createdAt'> {
  const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 });
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');
  const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

  const weekEvents = allEvents.filter(
    (e) => e.localDate >= weekStartStr && e.localDate <= weekEndStr
  );

  const workouts = weekEvents.filter((e) => e.type === 'workout') as WorkoutEvent[];
  const restDays = weekEvents.filter((e) => e.type === 'rest_day');

  const totalMinutes = workouts.reduce((sum, w) => sum + (w.durationMinutes || 0), 0);

  const efforts = workouts.map((w) => w.effort).filter((e): e is number => e !== undefined);
  const avgEffort = efforts.length > 0 ? efforts.reduce((a, b) => a + b, 0) / efforts.length : null;

  // Category breakdown
  const categoryBreakdown: Record<WorkoutCategory, number> = {
    strength: 0, cardio: 0, flexibility: 0, sports: 0, other: 0,
  };
  workouts.forEach((w) => {
    categoryBreakdown[w.category] = (categoryBreakdown[w.category] || 0) + 1;
  });

  // Muscle group breakdown
  const muscleGroupBreakdown: Record<MuscleGroup, number> = {
    chest: 0, back: 0, shoulders: 0, biceps: 0, triceps: 0, legs: 0, core: 0, full_body: 0,
  };
  workouts.forEach((w) => {
    (w.muscleGroups || []).forEach((mg) => {
      muscleGroupBreakdown[mg] = (muscleGroupBreakdown[mg] || 0) + 1;
    });
  });

  // Common tags
  const tagCounts: Record<string, number> = {};
  workouts.forEach((w) => {
    (w.tags || []).forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const commonTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag as MoodTag);

  // Streak calculation for the week
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  let streakDays = 0;
  for (const day of days) {
    const dateStr = format(day, 'yyyy-MM-dd');
    const hasActivity = weekEvents.some(
      (e) => e.localDate === dateStr && (e.type === 'workout' || e.type === 'rest_day')
    );
    if (hasActivity) streakDays++;
  }

  // Unique rest day count
  const restDayDates = new Set(restDays.map((e) => e.localDate));

  return {
    weekStart: weekStartStr,
    weekEnd: weekEndStr,
    workoutCount: workouts.length,
    restDayCount: restDayDates.size,
    totalMinutes,
    avgEffort,
    categoryBreakdown,
    muscleGroupBreakdown,
    commonTags,
    streakDays,
  };
}

// ─── Insights ─────────────────────────────────────────────────────

export interface Insight {
  type: 'pattern' | 'improvement' | 'suggestion';
  message: string;
  priority: number; // 1 = highest
}

export function generateInsights(review: Omit<WeeklyReview, 'id' | 'notes' | 'createdAt'>): Insight[] {
  const insights: Insight[] = [];

  if (review.workoutCount >= 4) {
    insights.push({
      type: 'improvement',
      message: `Great week! ${review.workoutCount} workouts logged.`,
      priority: 2,
    });
  }

  if (review.workoutCount < 3 && review.workoutCount > 0) {
    insights.push({
      type: 'suggestion',
      message: `Only ${review.workoutCount} workout${review.workoutCount !== 1 ? 's' : ''} this week. Can you fit in one more?`,
      priority: 1,
    });
  }

  if (review.workoutCount === 0) {
    insights.push({
      type: 'pattern',
      message: 'No workouts logged this week. Even a short session counts.',
      priority: 1,
    });
  }

  // Check muscle group balance
  const activeMuscles = Object.entries(review.muscleGroupBreakdown)
    .filter(([, count]) => count > 0);
  if (activeMuscles.length === 1 && review.workoutCount >= 3) {
    insights.push({
      type: 'suggestion',
      message: 'You focused on one muscle group all week. Try mixing it up for balance.',
      priority: 3,
    });
  }

  // Check if only cardio or only strength
  if (review.categoryBreakdown.strength > 0 && review.categoryBreakdown.cardio === 0 && review.workoutCount >= 3) {
    insights.push({
      type: 'suggestion',
      message: 'All strength, no cardio. Consider adding a short run or bike ride.',
      priority: 4,
    });
  }

  if (review.categoryBreakdown.cardio > 0 && review.categoryBreakdown.strength === 0 && review.workoutCount >= 3) {
    insights.push({
      type: 'suggestion',
      message: 'All cardio, no strength. Try adding a bodyweight or weight session.',
      priority: 4,
    });
  }

  if (review.avgEffort && review.avgEffort >= 8) {
    insights.push({
      type: 'pattern',
      message: `High average effort (${review.avgEffort.toFixed(1)}/10). Make sure you're recovering properly.`,
      priority: 3,
    });
  }

  return insights.sort((a, b) => a.priority - b.priority);
}

// ─── Next helpful step ────────────────────────────────────────────

export function getNextHelpfulStep(
  events: AppEvent[],
  schedule: ScheduleSlot[],
  today: string,
  nowTime: string,
): { message: string; action?: string; urgent: boolean } {
  const todayWorkouts = getWorkoutsForDate(events, today);
  const todayHasRestDay = events.some((e) => e.localDate === today && e.type === 'rest_day');

  if (todayWorkouts.length > 0) {
    return {
      message: `You've already worked out today. Nice work! Log another or rest.`,
      urgent: false,
    };
  }

  if (todayHasRestDay) {
    return {
      message: 'Rest day logged. Recovery is part of the plan.',
      urgent: false,
    };
  }

  // Check if there's an upcoming scheduled workout
  const nextSlot = schedule
    .filter((s) => s.enabled && s.time > nowTime)
    .sort((a, b) => a.time.localeCompare(b.time))[0];

  if (nextSlot) {
    return {
      message: `Your next scheduled session is at ${formatTime12(nextSlot.time)}. Ready?`,
      action: 'log_workout',
      urgent: false,
    };
  }

  return {
    message: 'No workout logged yet today. Get after it!',
    action: 'log_workout',
    urgent: true,
  };
}

function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}
