import React, { createContext, useContext, useMemo, useState } from 'react';
import { buildTheme } from '../utils/theme';

const resolveCssVar = (name, fallback) => {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

const getInitialTheme = () => {
  return {
    backgroundColor: resolveCssVar('--bg-primary', '#ffffff'),
    primaryColor: resolveCssVar('--accent-color', '#4caf50'),
    accentColor: resolveCssVar('--accent-color', '#4caf50'),
  };
};

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme());
  const computed = useMemo(() => buildTheme(theme), [theme]);

  const value = useMemo(
    () => ({
      theme,
      computed,
      setTheme,
    }),
    [theme, computed]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
