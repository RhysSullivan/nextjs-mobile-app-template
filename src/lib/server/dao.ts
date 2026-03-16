import { getDb } from './db';
import type {
  Profile,
  ScheduleSlot,
  WorkoutTemplate,
  AppEvent,
  Goal,
  WeeklyReview,
} from '../types';
import { DEFAULT_PROFILE, DEFAULT_SCHEDULE, DEFAULT_TEMPLATES } from '../defaults';

// ─── Profile ──────────────────────────────────────────────────────

export function getProfile(): Profile {
  const db = getDb();
  const row = db.prepare('SELECT * FROM profile WHERE id = ?').get('default') as any;
  if (!row) {
    insertProfile(DEFAULT_PROFILE);
    return DEFAULT_PROFILE;
  }
  return {
    id: row.id,
    wakeTime: row.wake_time,
    timezone: row.timezone,
    preferredTime: row.preferred_time,
    restDays: JSON.parse(row.rest_days),
    goals: JSON.parse(row.goals),
    notificationsEnabled: !!row.notifications_enabled,
    onboardingComplete: !!row.onboarding_complete,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function insertProfile(p: Profile) {
  const db = getDb();
  db.prepare(`
    INSERT OR REPLACE INTO profile (id, wake_time, timezone, preferred_time, rest_days, goals, notifications_enabled, onboarding_complete, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    p.id,
    p.wakeTime,
    p.timezone,
    p.preferredTime,
    JSON.stringify(p.restDays),
    JSON.stringify(p.goals),
    p.notificationsEnabled ? 1 : 0,
    p.onboardingComplete ? 1 : 0,
    p.createdAt,
    p.updatedAt,
  );
}

export function updateProfile(updates: Partial<Profile>): Profile {
  const current = getProfile();
  const merged = { ...current, ...updates, id: 'default', updatedAt: new Date().toISOString() };
  insertProfile(merged);
  return merged;
}

// ─── Schedule ─────────────────────────────────────────────────────

export function getSchedule(): ScheduleSlot[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM schedule ORDER BY id').all() as any[];
  if (rows.length === 0) {
    initSchedule();
    return DEFAULT_SCHEDULE;
  }
  return rows.map((r) => ({
    type: r.type,
    time: r.time,
    enabled: !!r.enabled,
  }));
}

export function initSchedule() {
  const db = getDb();
  const count = (db.prepare('SELECT COUNT(*) as c FROM schedule').get() as any).c;
  if (count === 0) {
    const insert = db.prepare('INSERT INTO schedule (type, time, enabled) VALUES (?, ?, ?)');
    const tx = db.transaction(() => {
      for (const s of DEFAULT_SCHEDULE) {
        insert.run(s.type, s.time, s.enabled ? 1 : 0);
      }
    });
    tx();
  }
}

export function updateScheduleSlot(index: number, updates: Partial<ScheduleSlot>) {
  const db = getDb();
  const rows = db.prepare('SELECT id FROM schedule ORDER BY id').all() as any[];
  if (index < 0 || index >= rows.length) return;
  const rowId = rows[index].id;

  const sets: string[] = [];
  const vals: any[] = [];
  if (updates.time !== undefined) { sets.push('time = ?'); vals.push(updates.time); }
  if (updates.enabled !== undefined) { sets.push('enabled = ?'); vals.push(updates.enabled ? 1 : 0); }
  if (updates.type !== undefined) { sets.push('type = ?'); vals.push(updates.type); }

  if (sets.length > 0) {
    vals.push(rowId);
    db.prepare(`UPDATE schedule SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  }
}

export function resetSchedule() {
  const db = getDb();
  db.prepare('DELETE FROM schedule').run();
  initSchedule();
}

// ─── Templates ────────────────────────────────────────────────────

export function getTemplates(): WorkoutTemplate[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM templates').all() as any[];
  if (rows.length === 0) {
    initTemplates();
    return DEFAULT_TEMPLATES;
  }
  return rows.map((r) => ({
    id: r.id,
    category: r.category,
    name: r.name,
    muscleGroups: JSON.parse(r.muscle_groups),
    isDefault: !!r.is_default,
  }));
}

export function initTemplates() {
  const db = getDb();
  const count = (db.prepare('SELECT COUNT(*) as c FROM templates').get() as any).c;
  if (count === 0) {
    const insert = db.prepare('INSERT INTO templates (id, category, name, muscle_groups, is_default) VALUES (?, ?, ?, ?, ?)');
    const tx = db.transaction(() => {
      for (const t of DEFAULT_TEMPLATES) {
        insert.run(t.id, t.category, t.name, JSON.stringify(t.muscleGroups), t.isDefault ? 1 : 0);
      }
    });
    tx();
  }
}

export function addTemplate(t: WorkoutTemplate) {
  const db = getDb();
  db.prepare('INSERT INTO templates (id, category, name, muscle_groups, is_default) VALUES (?, ?, ?, ?, ?)').run(
    t.id, t.category, t.name, JSON.stringify(t.muscleGroups), t.isDefault ? 1 : 0
  );
}

export function deleteTemplate(id: string) {
  const db = getDb();
  db.prepare('DELETE FROM templates WHERE id = ?').run(id);
}

// ─── Events ───────────────────────────────────────────────────────

export function getEventsByDate(date: string): AppEvent[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM events WHERE local_date = ? ORDER BY timestamp').all(date) as any[];
  return rows.map(rowToEvent);
}

export function getAllEvents(): AppEvent[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM events ORDER BY timestamp').all() as any[];
  return rows.map(rowToEvent);
}

export function addEvent(event: AppEvent) {
  const db = getDb();
  const { id, timestamp, localDate, localTime, type, ...rest } = event;
  db.prepare('INSERT INTO events (id, timestamp, local_date, local_time, type, data) VALUES (?, ?, ?, ?, ?, ?)').run(
    id, timestamp, localDate, localTime, type, JSON.stringify(rest)
  );
}

export function deleteEvent(id: string) {
  const db = getDb();
  db.prepare('DELETE FROM events WHERE id = ?').run(id);
}

function rowToEvent(row: any): AppEvent {
  const data = JSON.parse(row.data);
  return {
    id: row.id,
    timestamp: row.timestamp,
    localDate: row.local_date,
    localTime: row.local_time,
    type: row.type,
    ...data,
  };
}

// ─── Goals ────────────────────────────────────────────────────────

export function getGoals(): Goal[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM goals ORDER BY created_at DESC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    description: r.description,
    startDate: r.start_date,
    endDate: r.end_date,
    active: !!r.active,
    outcome: r.outcome || undefined,
    createdAt: r.created_at,
  }));
}

export function addGoal(g: Goal) {
  const db = getDb();
  db.prepare('INSERT INTO goals (id, description, start_date, end_date, active, outcome, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    g.id, g.description, g.startDate, g.endDate, g.active ? 1 : 0, g.outcome || null, g.createdAt
  );
}

export function updateGoal(id: string, updates: { active?: boolean; outcome?: string }) {
  const db = getDb();
  const sets: string[] = [];
  const vals: any[] = [];
  if (updates.active !== undefined) { sets.push('active = ?'); vals.push(updates.active ? 1 : 0); }
  if (updates.outcome !== undefined) { sets.push('outcome = ?'); vals.push(updates.outcome); }
  if (sets.length > 0) {
    vals.push(id);
    db.prepare(`UPDATE goals SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  }
}

export function deleteGoal(id: string) {
  const db = getDb();
  db.prepare('DELETE FROM goals WHERE id = ?').run(id);
}

// ─── Weekly Reviews ───────────────────────────────────────────────

export function getWeeklyReviews(): WeeklyReview[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM weekly_reviews ORDER BY week_start DESC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    weekStart: r.week_start,
    weekEnd: r.week_end,
    ...JSON.parse(r.data),
  }));
}

export function upsertWeeklyReview(review: WeeklyReview) {
  const db = getDb();
  const { id, weekStart, weekEnd, ...data } = review;
  db.prepare('INSERT OR REPLACE INTO weekly_reviews (id, week_start, week_end, data) VALUES (?, ?, ?, ?)').run(
    id, weekStart, weekEnd, JSON.stringify(data)
  );
}

// ─── Bulk import ──────────────────────────────────────────────────

export function bulkImportEvents(events: AppEvent[]) {
  const db = getDb();
  const insert = db.prepare('INSERT OR REPLACE INTO events (id, timestamp, local_date, local_time, type, data) VALUES (?, ?, ?, ?, ?, ?)');
  const tx = db.transaction(() => {
    for (const event of events) {
      const { id, timestamp, localDate, localTime, type, ...rest } = event;
      insert.run(id, timestamp, localDate, localTime, type, JSON.stringify(rest));
    }
  });
  tx();
}

export function clearAllEvents() {
  const db = getDb();
  db.prepare('DELETE FROM events').run();
  db.prepare('DELETE FROM goals').run();
  db.prepare('DELETE FROM weekly_reviews').run();
}

export function resetAll() {
  const db = getDb();
  db.prepare('DELETE FROM profile').run();
  db.prepare('DELETE FROM schedule').run();
  db.prepare('DELETE FROM templates').run();
  db.prepare('DELETE FROM events').run();
  db.prepare('DELETE FROM goals').run();
  db.prepare('DELETE FROM weekly_reviews').run();
}
