'use client';

import { type ReactNode, type MouseEvent } from 'react';
import { useTabNavigation, TAB_ROUTES, type TabRoute } from './TabContext';

interface TabLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  'aria-label'?: string;
}

/**
 * Drop-in replacement for next/link that scrolls to a tab
 * instead of doing a full route navigation.
 *
 * If the href is not a tab route, falls back to a normal <a>.
 */
export function TabLink({ href, children, className, ...rest }: TabLinkProps) {
  const tabCtx = useTabNavigation();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!tabCtx) return; // Not inside TabProvider, let normal navigation happen

    // Parse the href to extract path and search params
    const [path, search] = href.split('?');
    const tabRoute = path as TabRoute;

    if (TAB_ROUTES.includes(tabRoute)) {
      e.preventDefault();
      tabCtx.scrollToTab(tabRoute, search ? { searchParams: search } : undefined);
    }
    // else: let it navigate normally (export, settings, external)
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  );
}
