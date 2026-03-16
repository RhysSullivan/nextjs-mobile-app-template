'use client';

import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [resolved, setResolved] = useState<'light' | 'dark'>('light');

  // Init from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('theme') as ThemeMode | null;
    const initial: ThemeMode = stored === 'light' || stored === 'dark' ? stored : 'system';
    const res = initial === 'system' ? getSystemTheme() : initial;
    setModeState(initial);
    setResolved(res);
    applyTheme(res);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (mode !== 'system') return;
      const res = e.matches ? 'dark' : 'light';
      setResolved(res);
      applyTheme(res);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    if (m === 'system') {
      localStorage.removeItem('theme');
      const res = getSystemTheme();
      setResolved(res);
      applyTheme(res);
    } else {
      localStorage.setItem('theme', m);
      setResolved(m);
      applyTheme(m);
    }
  }, []);

  const toggle = useCallback(() => {
    const next: ThemeMode = mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system';
    setMode(next);
  }, [mode, setMode]);

  return { mode, theme: resolved, setMode, toggle };
}
