'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DEFAULT_PROFILE } from '@/lib/defaults';
import { client } from '@/lib/orpc';
import { requestNotificationPermission } from '@/lib/notifications';
import { Activity } from 'lucide-react';
import type { Profile } from '@/lib/types';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Profile>({
    ...DEFAULT_PROFILE,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles',
  });
  const [notifications, setNotifications] = useState(false);

  const handleFinish = async () => {
    // Save profile via oRPC
    await client.profile.update({
      ...profile,
      notificationsEnabled: notifications,
      onboardingComplete: true,
      updatedAt: new Date().toISOString(),
    });

    // Init schedule and templates via oRPC
    await client.schedule.init({});
    await client.templates.init({});

    // Request notifications if enabled
    if (notifications) {
      await requestNotificationPermission();
    }

    onComplete();
  };

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="space-y-8 animate-fade-in-up">
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Activity className="h-8 w-8 text-primary" />
        </div>
      </div>
      <div className="space-y-3 text-center">
        <h2 className="font-display text-3xl tracking-tight">Welcome</h2>
        <p className="text-muted-foreground leading-relaxed">
          A simple workout tracker that helps you build consistency.
          No complicated spreadsheets, no social feeds, no noise.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Just log your workouts, set goals, and watch your patterns.
        </p>
      </div>
      <div className="rounded-xl bg-muted/40 p-5 space-y-3">
        <p className="text-sm font-medium">What this app does:</p>
        <ul className="text-sm text-muted-foreground space-y-2 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
            Track workouts, rest days, and notes
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
            Set and complete weekly goals
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
            Analyze your patterns and trends
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
            Use templates for quick one-tap logging
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
            Keep all your data private and exportable
          </li>
        </ul>
      </div>
      <Button onClick={() => setStep(1)} className="w-full rounded-xl" size="lg">
        Get started
      </Button>
    </div>,

    // Step 1: Schedule basics
    <div key="schedule" className="space-y-6 animate-fade-in-up">
      <div className="space-y-2">
        <h2 className="font-display text-3xl tracking-tight">Your schedule</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          When do you usually wake up and work out? You can change these later.
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="wakeTime">Wake time</Label>
          <Input
            id="wakeTime"
            type="time"
            value={profile.wakeTime}
            onChange={(e) => setProfile({ ...profile, wakeTime: e.target.value })}
            className="rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredTime">Preferred workout time</Label>
          <Input
            id="preferredTime"
            type="time"
            value={profile.preferredTime}
            onChange={(e) => setProfile({ ...profile, preferredTime: e.target.value })}
            className="rounded-lg"
          />
        </div>

        <div className="rounded-xl bg-muted/40 p-4 space-y-3">
          <p className="text-sm font-medium">Default schedule:</p>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li className="flex justify-between">
              <span>Morning workout</span>
              <span className="tabular-nums">7:00 AM</span>
            </li>
            <li className="flex justify-between">
              <span>Evening stretch</span>
              <span className="tabular-nums">8:00 PM</span>
            </li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            You can customize these in Settings.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(0)} className="flex-1 rounded-xl">
          Back
        </Button>
        <Button onClick={() => setStep(2)} className="flex-1 rounded-xl">
          Continue
        </Button>
      </div>
    </div>,

    // Step 2: Notifications & privacy
    <div key="notifications" className="space-y-6 animate-fade-in-up">
      <div className="space-y-2">
        <h2 className="font-display text-3xl tracking-tight">Notifications & privacy</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Optional reminders to help you stay on schedule.
        </p>
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
          <div className="space-y-0.5">
            <Label htmlFor="notifications">Workout reminders</Label>
            <p className="text-xs text-muted-foreground">
              Get browser notifications before scheduled sessions
            </p>
          </div>
          <Switch
            id="notifications"
            checked={notifications}
            onCheckedChange={setNotifications}
          />
        </div>

        <div className="rounded-xl bg-muted/40 p-5 space-y-3">
          <p className="text-sm font-medium">Privacy</p>
          <ul className="text-sm text-muted-foreground space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
              All data stays on this device
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
              No account required
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
              No analytics or telemetry
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
              Export your data anytime as JSON
            </li>
          </ul>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-xl">
          Back
        </Button>
        <Button onClick={handleFinish} className="flex-1 rounded-xl" size="lg">
          Start tracking
        </Button>
      </div>
    </div>,
  ];

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Progress dots */}
        <div className="mb-8 flex justify-center gap-2.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                i === step ? 'w-6 bg-primary' : 'w-2 bg-muted'
              )}
            />
          ))}
        </div>
        {steps[step]}
      </div>
    </div>
  );
}
