import type { ScheduleSlot } from './types';
import { SCHEDULE_TYPE_LABELS } from './defaults';

let timers: ReturnType<typeof setTimeout>[] = [];

export function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return Promise.resolve(false);
  if (Notification.permission === 'granted') return Promise.resolve(true);
  if (Notification.permission === 'denied') return Promise.resolve(false);

  return Notification.requestPermission().then((p) => p === 'granted');
}

export function scheduleNotifications(schedule: ScheduleSlot[]) {
  // Clear existing
  timers.forEach(clearTimeout);
  timers = [];

  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const now = new Date();
  const today = now.toDateString();

  schedule.filter((s) => s.enabled).forEach((slot) => {
    const [h, m] = slot.time.split(':').map(Number);
    const target = new Date(today);
    target.setHours(h, m, 0, 0);

    // 5 minutes before
    const warningTime = new Date(target.getTime() - 5 * 60 * 1000);
    const label = SCHEDULE_TYPE_LABELS[slot.type] || slot.type;

    if (warningTime > now) {
      const delay = warningTime.getTime() - now.getTime();
      const timer = setTimeout(() => {
        new Notification(`${label} in 5 minutes`, {
          body: `Time to get ready for your ${label.toLowerCase()}.`,
          tag: `schedule-${slot.type}`,
          silent: false,
        });
      }, delay);
      timers.push(timer);
    }

    // At scheduled time
    if (target > now) {
      const delay = target.getTime() - now.getTime();
      const timer = setTimeout(() => {
        new Notification(`${label} time`, {
          body: `Your ${label.toLowerCase()} is now. Let's go!`,
          tag: `schedule-${slot.type}-now`,
          silent: false,
        });
      }, delay);
      timers.push(timer);
    }
  });
}

export function clearAllNotifications() {
  timers.forEach(clearTimeout);
  timers = [];
}
