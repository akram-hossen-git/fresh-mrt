'use client';

import { useEffect } from 'react';
import { storeConfig } from '@/config/store.config';

/**
 * Injects CSS custom properties from the store config onto :root.
 * This runs client-side and overrides the defaults in globals.css.
 *
 * Place this component once in the root layout.
 */
export function ThemeInjector() {
  useEffect(() => {
    const { colors, radius } = storeConfig.theme;
    const root = document.documentElement;

    // Colors
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-accent-light', colors.accentLight);
    root.style.setProperty('--color-accent-dark', colors.accentDark);
    root.style.setProperty('--color-selection', colors.selection);

    // Radius
    root.style.setProperty('--radius-card', radius.card);
    root.style.setProperty('--radius-button', radius.button);
    root.style.setProperty('--radius-badge', radius.badge);

    // Font flags (used by utility classes)
    root.style.setProperty(
      '--heading-transform',
      storeConfig.theme.fonts.headingUppercase ? 'uppercase' : 'none'
    );

    const trackingMap = { tight: '-0.025em', normal: '0', wide: '0.05em' };
    root.style.setProperty(
      '--heading-tracking',
      trackingMap[storeConfig.theme.fonts.headingTracking]
    );
  }, []);

  return null;
}
