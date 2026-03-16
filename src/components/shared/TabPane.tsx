'use client';

import { type ReactNode } from 'react';
import { useTabNavigation } from '@/components/shared/TabContext';

export function TabPane({ children }: { children: ReactNode }) {
  const tabCtx = useTabNavigation();
  const h = tabCtx?.paneHeight;

  return (
    <div
      className="snap-start snap-always overflow-y-auto overscroll-y-contain"
      style={{
        height: h ? `${h}px` : '100%',
        width: '100vw',
        flexShrink: 0,
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="mx-auto w-full max-w-2xl px-4 pb-14 pt-4">
        {children}
      </div>
    </div>
  );
}
