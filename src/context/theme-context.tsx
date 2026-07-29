'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'theme';

/**
 * Inline script to inject into <head> to prevent flash of unstyled content.
 * Reads localStorage and system preference before first paint.
 *
 * Usage in layout.tsx:
 *   <head>
 *     <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
 *   </head>
 */
export const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('${STORAGE_KEY}');
    if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var d = document.documentElement;
    d.setAttribute('data-theme', t);
    if (t === 'dark') d.classList.add('dark');
    else d.classList.remove('dark');
  } catch(e) {}
})();
`;

function applyTheme(t: Theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', t);
  if (t === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // On mount, read persisted theme or system preference
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial: Theme = stored || (systemDark ? 'dark' : 'light');

    setThemeState(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  // Listen for system preference changes when no stored preference
  useEffect(() => {
    if (!mounted) return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      // Only follow system if user hasn't explicitly chosen
      if (!localStorage.getItem(STORAGE_KEY)) {
        const next: Theme = e.matches ? 'dark' : 'light';
        setThemeState(next);
        applyTheme(next);
      }
    };

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [mounted]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
    applyTheme(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
