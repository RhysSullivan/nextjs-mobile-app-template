import type { ScheduleSlot, WorkoutTemplate, Profile } from './types';

// ─── Default Schedule ─────────────────────────────────────────────

export const DEFAULT_SCHEDULE: ScheduleSlot[] = [
  { type: 'morning_workout', time: '07:00', enabled: true },
  { type: 'evening_stretch', time: '20:00', enabled: false },
];

// ─── Default Templates ───────────────────────────────────────────

export const DEFAULT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'tmpl_push_day',
    category: 'strength',
    name: 'Push day (chest, shoulders, triceps)',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    isDefault: true,
  },
  {
    id: 'tmpl_pull_day',
    category: 'strength',
    name: 'Pull day (back, biceps)',
    muscleGroups: ['back', 'biceps'],
    isDefault: true,
  },
  {
    id: 'tmpl_leg_day',
    category: 'strength',
    name: 'Leg day (squats, lunges, calves)',
    muscleGroups: ['legs'],
    isDefault: true,
  },
  {
    id: 'tmpl_full_body',
    category: 'strength',
    name: 'Full body circuit',
    muscleGroups: ['full_body'],
    isDefault: true,
  },
  {
    id: 'tmpl_run',
    category: 'cardio',
    name: 'Running / jogging',
    muscleGroups: ['legs', 'core'],
  },
  {
    id: 'tmpl_cycling',
    category: 'cardio',
    name: 'Cycling',
    muscleGroups: ['legs'],
  },
  {
    id: 'tmpl_yoga',
    category: 'flexibility',
    name: 'Yoga flow',
    muscleGroups: ['full_body'],
  },
  {
    id: 'tmpl_stretching',
    category: 'flexibility',
    name: 'Stretching routine',
    muscleGroups: ['full_body'],
  },
];

// ─── Default Profile ─────────────────────────────────────────────

export const DEFAULT_PROFILE: Profile = {
  id: 'default',
  wakeTime: '07:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles',
  preferredTime: '07:00',
  restDays: ['sunday'],
  goals: [
    'Work out at least 4 days per week',
    'Try a new exercise each week',
    'Improve consistency over intensity',
  ],
  notificationsEnabled: false,
  onboardingComplete: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ─── Suggested Goals ──────────────────────────────────────────────

export const SUGGESTED_GOALS = [
  'Work out 4+ days this week',
  'Hit every muscle group at least once',
  'Try one new exercise or routine',
  'Do 10 minutes of stretching after each workout',
  'Complete a longer cardio session (30+ min)',
  'Increase weight or reps on one lift',
  'Do a morning workout instead of evening',
  'Take proper rest days (no guilt)',
];

// ─── Schedule Type Labels ────────────────────────────────────────

export const SCHEDULE_TYPE_LABELS: Record<string, string> = {
  morning_workout: 'Morning workout',
  evening_stretch: 'Evening stretch',
};

// ─── Motivational Copy ───────────────────────────────────────────

export const MOTIVATIONAL_MESSAGES = {
  restDay: [
    'Rest is part of the plan. Your muscles grow during recovery.',
    'Active recovery or full rest — both count.',
    'Rest days build consistency, not guilt.',
  ],
  general: [
    'Consistency beats intensity.',
    'Every workout counts, no matter how short.',
    'The best workout is the one you actually do.',
    'Show up. That\'s the hardest part.',
  ],
  streak: [
    'You\'re on a roll. Keep it going.',
    'Momentum is everything.',
  ],
};
