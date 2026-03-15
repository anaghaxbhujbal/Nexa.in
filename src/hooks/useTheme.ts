import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';

function getTimeBasedTheme(): 'light' | 'dark' {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
}

function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('theme-mode') as ThemeMode) || 'light';
  });

  const resolvedTheme = mode === 'auto' ? getTimeBasedTheme() : mode;

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  // For auto mode, check every minute
  useEffect(() => {
    if (mode !== 'auto') return;
    const interval = setInterval(() => {
      applyTheme(getTimeBasedTheme());
    }, 60000);
    return () => clearInterval(interval);
  }, [mode]);

  const setThemeMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  }, []);

  return { mode, resolvedTheme, setThemeMode };
}
