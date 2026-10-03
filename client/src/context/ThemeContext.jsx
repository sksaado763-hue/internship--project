import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const THEME_STORAGE_KEY = 'meridian-theme';
const THEME_SELECTION_KEY = 'meridian-theme-selected';

function getInitialTheme() {
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const selectedTheme = window.localStorage.getItem(THEME_SELECTION_KEY) === 'true';
    if (savedTheme === 'light' || (savedTheme === 'dark' && selectedTheme)) return savedTheme;
  } catch {
    // The app still works when browser storage is unavailable.
  }

  return 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Persisting the preference is optional.
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => currentTheme === 'light' ? 'dark' : 'light');
    try {
      window.localStorage.setItem(THEME_SELECTION_KEY, 'true');
    } catch {
      // The theme still changes when browser storage is unavailable.
    }
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
