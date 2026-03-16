'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useProfile } from '@/hooks/useProfile';
import { useSchedule } from '@/hooks/useSchedule';
import { useTheme } from '@/hooks/useTheme';
import { requestNotificationPermission, clearAllNotifications, scheduleNotifications } from '@/lib/notifications';
import { client } from '@/lib/orpc';
import { Sun, Moon, Monitor, Bell, AlertTriangle, Trash2 } from 'lucide-react';
import type { ThemeMode } from '@/hooks/useTheme';
import { SCHEDULE_TYPE_LABELS } from '@/lib/defaults';

export function SettingsScreen() {
  const { profile, updateProfile } = useProfile();
  const { schedule, updateSlot, resetSchedule } = useSchedule();
  const { mode, theme, setMode } = useTheme();
  const [showDanger, setShowDanger] = useState(false);

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        await updateProfile({ notificationsEnabled: true });
        scheduleNotifications(schedule);
      }
    } else {
      clearAllNotifications();
      await updateProfile({ notificationsEnabled: false });
    }
  };

  const handleClearData = async () => {
    if (window.confirm('This will delete ALL your data. This cannot be undone. Are you sure?')) {
      await client.import({ action: 'clear' });
      window.location.reload();
    }
  };

  const handleResetAll = async () => {
    if (
      window.confirm(
        'This will delete ALL data and reset the app to its initial state. Are you sure?'
      )
    ) {
      await client.import({ action: 'reset' });
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h2 className="font-display text-3xl tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Customize your schedule and preferences.
        </p>
      </div>

      {/* Appearance */}
      <Card className="shadow-sm">
        <CardContent className="p-4 space-y-4">
          <h3 className="text-sm font-medium">Appearance</h3>
          <div className="flex gap-2">
            {([
              { value: 'system', label: 'System', icon: Monitor },
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon },
            ] as const).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-3 text-sm transition-all duration-200 ${
                  mode === value
                    ? 'border-primary/40 bg-primary/5 font-medium shadow-sm'
                    : 'border-border/60 hover:bg-accent/40 hover:border-border'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card className="shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Schedule</h3>
            <Button variant="ghost" size="sm" onClick={resetSchedule} className="rounded-lg text-xs">
              Reset to defaults
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wakeTime">Wake time</Label>
            <Input
              id="wakeTime"
              type="time"
              value={profile.wakeTime}
              onChange={(e) => updateProfile({ wakeTime: e.target.value })}
              className="rounded-lg"
            />
          </div>

          <Separator />

          <div className="space-y-3">
            {schedule.map((slot, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 flex-1">
                  <Switch
                    checked={slot.enabled}
                    onCheckedChange={(checked) => updateSlot(i, { enabled: checked })}
                    aria-label={`Enable ${SCHEDULE_TYPE_LABELS[slot.type] || slot.type}`}
                  />
                  <span className="text-sm">
                    {SCHEDULE_TYPE_LABELS[slot.type] || slot.type}
                  </span>
                </div>
                <Input
                  type="time"
                  value={slot.time}
                  onChange={(e) => updateSlot(i, { time: e.target.value })}
                  className="w-32 rounded-lg"
                  disabled={!slot.enabled}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="shadow-sm">
        <CardContent className="p-4 space-y-4">
          <h3 className="text-sm font-medium">Notifications</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60">
                <Bell className="h-4 w-4" />
              </div>
              <Label>Workout reminders</Label>
            </div>
            <Switch
              checked={profile.notificationsEnabled}
              onCheckedChange={handleNotificationToggle}
            />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Browser notifications 5 minutes before each scheduled session.
          </p>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card className="shadow-sm">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-medium">Privacy</h3>
          <ul className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
              All data is stored locally on this device.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
              No account required.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
              No analytics, telemetry, or tracking.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
              No network requests are made by the core app.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
              Export your data anytime from the Export page.
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-200/60 dark:border-red-900/40 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <button
            onClick={() => setShowDanger(!showDanger)}
            className="flex items-center gap-2.5 text-sm font-medium text-red-600 dark:text-red-400"
          >
            <AlertTriangle className="h-4 w-4" />
            Data management
          </button>

          {showDanger && (
            <div className="space-y-2.5 ml-6.5 animate-fade-in">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearData}
                className="text-red-600 border-red-200/60 dark:text-red-400 dark:border-red-900/40 rounded-lg"
              >
                <Trash2 className="mr-1.5 h-3 w-3" />
                Clear all logs (keep settings)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetAll}
                className="text-red-600 border-red-200/60 dark:text-red-400 dark:border-red-900/40 rounded-lg"
              >
                <Trash2 className="mr-1.5 h-3 w-3" />
                Reset entire app
              </Button>
              <p className="text-xs text-muted-foreground leading-relaxed">
                These actions cannot be undone. Export your data first.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
