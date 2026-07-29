/* ------------------------------------------------------------------ */
/*  Active Store Configuration                                         */
/*                                                                     */
/*  Switch between niches by changing the import below.                */
/*  Everything else — colors, fonts, layout, card style — adapts       */
/*  automatically.                                                     */
/*                                                                     */
/*  Available presets:                                                  */
/*    fashionPreset  — Bold, uppercase, red accent (#FF3D00)           */
/*    groceryPreset  — Clean, friendly, green accent (#16A34A)         */
/*    babyPreset     — Soft, rounded, purple accent (#8B5CF6)          */
/* ------------------------------------------------------------------ */

// import { fashionPreset } from './presets';
import { groceryPreset } from './presets';
// import { babyPreset } from './presets';

import type { StoreConfig } from './store.types';

/** The active store configuration. Change this one line to switch niches. */
export const storeConfig: StoreConfig = groceryPreset;

/** Re-export types for convenience */
export type { StoreConfig } from './store.types';
export type {
  ThemeColors,
  ThemeFonts,
  ThemeRadius,
  StoreTheme,
  StoreContent,
  SectionSettings,
  ProductCardVariant,
  HomepageSection,
  HeaderStyle,
  MobileNav,
} from './store.types';
