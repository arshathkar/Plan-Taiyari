'use client';

import { useEffect } from 'react';
import { usePlanStore } from '@/store/plan-store';

/**
 * ThemeProvider — applies theme and accessibility data attributes to <html>
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const settings = usePlanStore(s => s.settings);

  useEffect(() => {
    const root = document.documentElement;

    // Theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const effectiveTheme = settings.theme === 'auto'
      ? (prefersDark ? 'dark' : 'light')
      : settings.theme;
    root.setAttribute('data-theme', effectiveTheme);

    // Transparency
    const prefersReducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
    root.setAttribute('data-reduce-transparency',
      String(settings.reduceTransparency || prefersReducedTransparency));

    // Motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.setAttribute('data-reduce-motion',
      String(settings.reduceMotion || prefersReducedMotion));

    // Text size
    root.setAttribute('data-text-size', String(settings.textSize));
  }, [settings]);

  return <>{children}</>;
}
