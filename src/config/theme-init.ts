import { storeConfig } from '@/config/store.config';

/**
 * Generates a script string that sets CSS custom properties immediately
 * on page load, before React hydration. This prevents a flash of
 * default colors when the store uses a non-default preset.
 *
 * Used in root layout's <head> via dangerouslySetInnerHTML.
 */
export function getThemeInitScript(): string {
  const { colors, radius, fonts } = storeConfig.theme;
  const trackingMap = { tight: '-0.025em', normal: '0', wide: '0.05em' };

  return `(function(){var s=document.documentElement.style;
s.setProperty('--color-accent','${colors.accent}');
s.setProperty('--color-accent-light','${colors.accentLight}');
s.setProperty('--color-accent-dark','${colors.accentDark}');
s.setProperty('--color-selection','${colors.selection}');
s.setProperty('--radius-card','${radius.card}');
s.setProperty('--radius-button','${radius.button}');
s.setProperty('--radius-badge','${radius.badge}');
s.setProperty('--heading-transform','${fonts.headingUppercase ? 'uppercase' : 'none'}');
s.setProperty('--heading-tracking','${trackingMap[fonts.headingTracking]}');
})()`;
}
