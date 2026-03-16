'use client';

import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
  type ReactNode,
  type RefObject,
} from 'react';

export const TAB_ROUTES = ['/', '/log', '/timer', '/history', '/templates', '/goals'] as const;
export type TabRoute = (typeof TAB_ROUTES)[number];

interface TabContextValue {
  activeTab: TabRoute;
  scrollProgress: number;
  scrollToTab: (tab: TabRoute, opts?: { searchParams?: string }) => void;
  logSearchParams: string | null;
  clearLogSearchParams: () => void;
  containerRef: RefObject<HTMLDivElement | null>;
  paneHeight: number;
}

const TabCtx = createContext<TabContextValue | null>(null);

export function useTabNavigation() {
  const ctx = useContext(TabCtx);
  return ctx;
}

export function TabProvider({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabRoute>('/');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [paneHeight, setPaneHeight] = useState(0);
  const [logSearchParams, setLogSearchParams] = useState<string | null>(null);
  const urlTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number>(0);
  const scrollingRef = useRef(false);

  const scrollToTab = useCallback((tab: TabRoute, opts?: { searchParams?: string }) => {
    const index = TAB_ROUTES.indexOf(tab);
    if (index === -1 || !containerRef.current) return;
    if (opts?.searchParams) {
      setLogSearchParams(opts.searchParams);
    }
    const container = containerRef.current;
    const targetX = index * container.clientWidth;
    container.scrollTo({ left: targetX, behavior: 'smooth' });
  }, []);

  const clearLogSearchParams = useCallback(() => {
    setLogSearchParams(null);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const tick = () => {
      if (!scrollingRef.current) return;
      const w = container.clientWidth;
      if (w === 0) { rafRef.current = requestAnimationFrame(tick); return; }
      const progress = container.scrollLeft / w;
      const clamped = Math.max(0, Math.min(progress, TAB_ROUTES.length - 1));
      setScrollProgress(clamped);
      const nearest = Math.round(clamped);
      const newTab = TAB_ROUTES[nearest];
      setActiveTab((prev) => (prev === newTab ? prev : newTab));
      rafRef.current = requestAnimationFrame(tick);
    };

    const handleScrollStart = () => {
      if (!scrollingRef.current) {
        scrollingRef.current = true;
        rafRef.current = requestAnimationFrame(tick);
      }
      if (urlTimeoutRef.current) clearTimeout(urlTimeoutRef.current);
      urlTimeoutRef.current = setTimeout(() => {
        scrollingRef.current = false;
        const w = container.clientWidth;
        if (w === 0) return;
        const finalProgress = container.scrollLeft / w;
        const finalIndex = Math.round(finalProgress);
        const finalClamped = Math.max(0, Math.min(finalIndex, TAB_ROUTES.length - 1));
        setScrollProgress(finalClamped);
        const finalTab = TAB_ROUTES[finalClamped];
        setActiveTab(finalTab);
        const url = finalTab === '/' ? '/' : finalTab;
        if (window.location.pathname !== url) {
          window.history.replaceState(null, '', url);
        }
      }, 100);
    };

    container.addEventListener('scroll', handleScrollStart, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScrollStart);
      if (urlTimeoutRef.current) clearTimeout(urlTimeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(([entry]) => {
      setPaneHeight(entry.contentRect.height);
    });
    ro.observe(container);
    setPaneHeight(container.clientHeight);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const HASH_TO_TAB: Record<string, TabRoute> = {
      log: '/log',
      timer: '/timer',
      history: '/history',
      templates: '/templates',
      goals: '/goals',
    };
    const tab = HASH_TO_TAB[hash];
    if (tab && containerRef.current) {
      const index = TAB_ROUTES.indexOf(tab);
      containerRef.current.scrollTo({ left: index * containerRef.current.clientWidth });
      setActiveTab(tab);
      setScrollProgress(index);
      window.history.replaceState(null, '', tab);
    }
  }, []);

  return (
    <TabCtx.Provider value={{ activeTab, scrollProgress, scrollToTab, logSearchParams, clearLogSearchParams, containerRef, paneHeight }}>
      {children}
    </TabCtx.Provider>
  );
}
