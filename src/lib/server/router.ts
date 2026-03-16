import { os } from '@orpc/server';
import * as z from 'zod';
import * as dao from './dao';

// ─── Zod Schemas ──────────────────────────────────────────────────

const WorkoutCategorySchema = z.enum(['strength', 'cardio', 'flexibility', 'sports', 'other']);

const EventTypeSchema = z.enum(['workout', 'rest_day', 'note']);

const MuscleGroupSchema = z.enum(['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core', 'full_body']);

const MoodTagSchema = z.enum([
  'energized', 'tired', 'sore', 'motivated', 'stressed', 'relaxed', 'rushed', 'other',
]);

const ProfileSchema = z.object({
  id: z.string(),
  wakeTime: z.string(),
  timezone: z.string(),
  preferredTime: z.string(),
  restDays: z.array(z.string()),
  goals: z.array(z.string()),
  notificationsEnabled: z.boolean(),
  onboardingComplete: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const ScheduleSlotSchema = z.object({
  type: z.string(),
  time: z.string(),
  enabled: z.boolean(),
});

const WorkoutTemplateSchema = z.object({
  id: z.string(),
  category: WorkoutCategorySchema,
  name: z.string(),
  muscleGroups: z.array(MuscleGroupSchema),
  isDefault: z.boolean().optional(),
});

const BaseEventSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  localDate: z.string(),
  localTime: z.string(),
  type: EventTypeSchema,
  notes: z.string().optional(),
});

const WorkoutEventSchema = BaseEventSchema.extend({
  type: z.literal('workout'),
  category: WorkoutCategorySchema,
  templateId: z.string().optional(),
  name: z.string(),
  durationMinutes: z.number().optional(),
  effort: z.number().optional(),
  muscleGroups: z.array(MuscleGroupSchema).optional(),
  tags: z.array(MoodTagSchema).optional(),
});

const RestDayEventSchema = BaseEventSchema.extend({
  type: z.literal('rest_day'),
  reason: z.string().optional(),
});

const NoteEventSchema = BaseEventSchema.extend({
  type: z.literal('note'),
});

const AppEventSchema = z.union([WorkoutEventSchema, RestDayEventSchema, NoteEventSchema]);

const GoalSchema = z.object({
  id: z.string(),
  description: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  active: z.boolean(),
  outcome: z.string().optional(),
  createdAt: z.string(),
});

// ─── Procedures ───────────────────────────────────────────────────

// Profile
const getProfile = os
  .handler(async () => {
    return dao.getProfile();
  });

const updateProfile = os
  .input(ProfileSchema.partial().omit({ id: true }))
  .handler(async ({ input }) => {
    return dao.updateProfile(input);
  });

// Schedule
const getSchedule = os
  .handler(async () => {
    return dao.getSchedule();
  });

const updateScheduleSlot = os
  .input(z.object({
    index: z.number(),
    updates: ScheduleSlotSchema.partial(),
  }))
  .handler(async ({ input }) => {
    dao.updateScheduleSlot(input.index, input.updates);
    return dao.getSchedule();
  });

const initSchedule = os
  .handler(async () => {
    dao.initSchedule();
    return dao.getSchedule();
  });

const resetSchedule = os
  .handler(async () => {
    dao.resetSchedule();
    return dao.getSchedule();
  });

// Templates
const getTemplates = os
  .handler(async () => {
    return dao.getTemplates();
  });

const addTemplate = os
  .input(WorkoutTemplateSchema)
  .handler(async ({ input }) => {
    dao.addTemplate(input);
    return dao.getTemplates();
  });

const deleteTemplate = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    dao.deleteTemplate(input.id);
    return dao.getTemplates();
  });

const initTemplates = os
  .handler(async () => {
    dao.initTemplates();
    return dao.getTemplates();
  });

// Events
const getEventsByDate = os
  .input(z.object({ date: z.string() }))
  .handler(async ({ input }) => {
    return dao.getEventsByDate(input.date);
  });

const getAllEvents = os
  .handler(async () => {
    return dao.getAllEvents();
  });

const addEvent = os
  .input(AppEventSchema)
  .handler(async ({ input }) => {
    dao.addEvent(input);
    return { ok: true as const };
  });

const deleteEvent = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    dao.deleteEvent(input.id);
    return { ok: true as const };
  });

// Goals
const getGoals = os
  .handler(async () => {
    return dao.getGoals();
  });

const addGoal = os
  .input(GoalSchema)
  .handler(async ({ input }) => {
    dao.addGoal(input);
    return dao.getGoals();
  });

const updateGoal = os
  .input(z.object({
    id: z.string(),
    active: z.boolean().optional(),
    outcome: z.string().optional(),
  }))
  .handler(async ({ input }) => {
    const { id, ...updates } = input;
    dao.updateGoal(id, updates);
    return dao.getGoals();
  });

const deleteGoal = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    dao.deleteGoal(input.id);
    return dao.getGoals();
  });

// Export
const exportData = os
  .input(z.object({
    days: z.number().optional(),
  }).optional())
  .handler(async ({ input }) => {
    const { format: fmtFn, subDays } = await import('date-fns');

    const profile = dao.getProfile();
    const schedule = dao.getSchedule();
    const templates = dao.getTemplates();
    let events = dao.getAllEvents();
    const goals = dao.getGoals();
    const weeklyReviews = dao.getWeeklyReviews();

    if (input?.days) {
      const cutoff = fmtFn(subDays(new Date(), input.days), 'yyyy-MM-dd');
      events = events.filter((e) => e.localDate >= cutoff);
    }

    const { id, ...profileData } = profile;

    return {
      schemaVersion: '1.0.0',
      appVersion: '0.1.0',
      exportedAt: new Date().toISOString(),
      profile: profileData,
      schedule,
      templates,
      events,
      goals,
      weeklyReviews,
    };
  });

// Import
const importData = os
  .input(z.object({
    action: z.enum(['clear', 'reset', 'import']).optional(),
    data: z.any().optional(),
  }))
  .handler(async ({ input }) => {
    if (input.action === 'clear') {
      dao.clearAllEvents();
      return { ok: true as const, message: 'All logs cleared.' };
    }

    if (input.action === 'reset') {
      dao.resetAll();
      return { ok: true as const, message: 'App reset.' };
    }

    // Import data
    const data = input.data;
    if (!data?.schemaVersion || !data?.events) {
      throw new Error('Invalid export format.');
    }

    if (data.profile) {
      dao.updateProfile({ ...data.profile, id: 'default' });
    }

    if (data.schedule) {
      dao.resetSchedule();
      const { getDb } = await import('./db');
      const db = getDb();
      db.prepare('DELETE FROM schedule').run();
      const insert = db.prepare('INSERT INTO schedule (type, time, enabled) VALUES (?, ?, ?)');
      for (const s of data.schedule) {
        insert.run(s.type, s.time, s.enabled ? 1 : 0);
      }
    }

    if (data.templates) {
      const { getDb } = await import('./db');
      const db = getDb();
      db.prepare('DELETE FROM templates').run();
      for (const t of data.templates) {
        dao.addTemplate(t);
      }
    }

    if (data.events) {
      dao.bulkImportEvents(data.events);
    }

    if (data.goals) {
      for (const g of data.goals) {
        try { dao.addGoal(g); } catch { /* skip duplicates */ }
      }
    }

    if (data.weeklyReviews) {
      for (const r of data.weeklyReviews) {
        dao.upsertWeeklyReview(r);
      }
    }

    return { ok: true as const, message: `Imported ${data.events.length} events.` };
  });

// ─── Router ───────────────────────────────────────────────────────

export const router = {
  profile: {
    get: getProfile,
    update: updateProfile,
  },
  schedule: {
    get: getSchedule,
    updateSlot: updateScheduleSlot,
    init: initSchedule,
    reset: resetSchedule,
  },
  templates: {
    get: getTemplates,
    add: addTemplate,
    delete: deleteTemplate,
    init: initTemplates,
  },
  events: {
    getByDate: getEventsByDate,
    getAll: getAllEvents,
    add: addEvent,
    delete: deleteEvent,
  },
  goals: {
    get: getGoals,
    add: addGoal,
    update: updateGoal,
    delete: deleteGoal,
  },
  export: exportData,
  import: importData,
};
