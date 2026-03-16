'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import type { HapticInput } from 'web-haptics';

/**
 * Centralized haptic feedback for all interactive elements.
 *
 * Attaches a single global click listener that triggers haptics
 * whenever the user taps a button, link, badge, switch, slider,
 * or any element marked with [data-haptic].
 *
 * Also exposes `useHaptics()` for imperative triggering.
 *
 * Opt out any element with data-haptic="none".
 */

/* ── Context for imperative access ────────────────── */

interface HapticsContextValue {
  trigger: (input?: HapticInput) => void;
}

const HapticsCtx = createContext<HapticsContextValue | null>(null);

/** Imperatively trigger a haptic pattern from anywhere inside a HapticsProvider. */
export function useHaptics(): HapticsContextValue {
  const ctx = useContext(HapticsCtx);
  // Return a no-op if called outside provider (SSR, standalone pages)
  return ctx ?? { trigger: () => {} };
}

/* ── Click-based auto-haptics ─────────────────────── */

const INTERACTIVE_SELECTOR = [
  'button',
  'a[href]',
  '[role="button"]',
  '[role="switch"]',
  '[role="tab"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[data-haptic]',
  '[data-slot="switch-thumb"]',
  '[data-slot="slider-thumb"]',
].join(',');

function getHapticType(el: HTMLElement): string | null {
  // Explicit opt-out
  const explicit = el.closest('[data-haptic]') as HTMLElement | null;
  if (explicit?.dataset.haptic === 'none') return null;
  if (explicit?.dataset.haptic) return explicit.dataset.haptic;

  // Destructive buttons
  if (
    el.closest('[class*="destructive"]') ||
    el.closest('[class*="text-red"]')
  ) {
    return 'error';
  }

  // Switches and sliders get a nudge
  if (
    el.closest('[role="switch"]') ||
    el.closest('[data-slot="switch-thumb"]') ||
    el.closest('[role="slider"]') ||
    el.closest('[data-slot="slider-thumb"]')
  ) {
    return 'nudge';
  }

  // Default light tap for everything else
  return 'light';
}

export function HapticsProvider({ children }: { children: React.ReactNode }) {
  const hapticsRef = useRef<any>(null);

  useEffect(() => {
    let haptics: any = null;
    let destroyed = false;

    // Dynamic import so the class is instantiated purely client-side
    import('web-haptics').then(({ WebHaptics }) => {
      if (destroyed) return;
      haptics = new WebHaptics();
      hapticsRef.current = haptics;
    });

    const handleClick = (e: MouseEvent) => {
      if (!hapticsRef.current) return;

      const target = e.target as HTMLElement;
      const interactive = target.closest(INTERACTIVE_SELECTOR) as HTMLElement | null;
      if (!interactive) return;

      const type = getHapticType(interactive);
      if (!type) return;

      switch (type) {
        case 'success':
          hapticsRef.current.trigger('success');
          break;
        case 'error':
          hapticsRef.current.trigger('error');
          break;
        case 'nudge':
          hapticsRef.current.trigger('nudge');
          break;
        case 'light':
        default:
          hapticsRef.current.trigger('light');
          break;
      }
    };

    document.addEventListener('click', handleClick, { passive: true });

    return () => {
      destroyed = true;
      document.removeEventListener('click', handleClick);
      haptics?.destroy();
      hapticsRef.current = null;
    };
  }, []);

  const ctxValue: HapticsContextValue = {
    trigger: (input) => hapticsRef.current?.trigger(input),
  };

  return (
    <HapticsCtx.Provider value={ctxValue}>
      {children}
    </HapticsCtx.Provider>
  );
}
