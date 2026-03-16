'use client';

import { useEffect, Suspense } from 'react';
import { AppShell } from '@/components/shared/AppShell';
import { TabProvider } from '@/components/shared/TabContext';
import { TabPane } from '@/components/shared/TabPane';
import { TodayScreen } from '@/components/today/TodayScreen';
import { LogScreen } from '@/components/log/LogScreen';
import { TimerScreen } from '@/components/timer/TimerScreen';
import { HistoryScreen } from '@/components/history/HistoryScreen';
import { TemplatesScreen } from '@/components/templates/TemplatesScreen';
import { GoalsScreen } from '@/components/goals/GoalsScreen';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { HapticsProvider } from '@/components/shared/HapticsProvider';
import { useProfile } from '@/hooks/useProfile';
import { useSchedule } from '@/hooks/useSchedule';
import { scheduleNotifications } from '@/lib/notifications';
import { registerServiceWorker } from '@/lib/sw-register';

export default function HomePage() {
  const { profile, isLoading } = useProfile();
  const { schedule } = useSchedule();

  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    if (profile.notificationsEnabled && schedule.length > 0) {
      scheduleNotifications(schedule);
    }
  }, [profile.notificationsEnabled, schedule]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!profile.onboardingComplete) {
    return (
      <HapticsProvider>
        <OnboardingFlow
          onComplete={() => {
            window.location.reload();
          }}
        />
      </HapticsProvider>
    );
  }

  return (
    <TabProvider>
      <AppShell>
        <TabPane>
          <TodayScreen />
        </TabPane>
        <TabPane>
          <Suspense>
            <LogScreen />
          </Suspense>
        </TabPane>
        <TabPane>
          <TimerScreen />
        </TabPane>
        <TabPane>
          <HistoryScreen />
        </TabPane>
        <TabPane>
          <TemplatesScreen />
        </TabPane>
        <TabPane>
          <GoalsScreen />
        </TabPane>
      </AppShell>
    </TabProvider>
  );
}
