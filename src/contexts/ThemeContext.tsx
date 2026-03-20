import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeColor = 'orange' | 'green' | 'blue' | 'red' | 'purple' | 'cyan' | 'yellow' | 'pink';
export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
  color: ThemeColor;
  mode: ThemeMode;
  setColor: (color: ThemeColor) => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const COLOR_MAP: Record<ThemeColor, string> = {
  orange: '#FF8C00',
  green: '#00FF00',
  blue: '#0088FF',
  red: '#FF0033',
  purple: '#B000FF',
  cyan: '#00FFFF',
  yellow: '#FFFF00',
  pink: '#FF00FF',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [color, setColor] = useState<ThemeColor>(() => 
    (localStorage.getItem('theme-color') as ThemeColor) || 'orange'
  );
  const [mode, setMode] = useState<ThemeMode>(() => 
    (localStorage.getItem('theme-mode') as ThemeMode) || 'dark'
  );

  useEffect(() => {
    localStorage.setItem('theme-color', color);
    localStorage.setItem('theme-mode', mode);

    const root = document.documentElement;
    const primaryHex = COLOR_MAP[color];
    root.style.setProperty('--theme-primary', primaryHex);

    const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.setProperty('--theme-bg', '#050505');
      root.style.setProperty('--theme-panel', `color-mix(in srgb, ${primaryHex} 10%, #000)`);
      root.style.setProperty('--theme-text', primaryHex);
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.style.setProperty('--theme-bg', '#FAFAFA');
      root.style.setProperty('--theme-panel', `color-mix(in srgb, ${primaryHex} 10%, #FFF)`);
      // Use a darker version of the primary color for text in light mode for readability
      root.style.setProperty('--theme-text', `color-mix(in srgb, ${primaryHex} 40%, #000)`);
    }
  }, [color, mode]);

  // Listen for system theme changes
  useEffect(() => {
    if (mode !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // Trigger re-render to update classes by forcing a state update
      setMode('system'); 
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ color, mode, setColor, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
