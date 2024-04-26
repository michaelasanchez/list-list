import { useEffect, useState } from 'react';
import { AppTheme } from '../shared';
import { useLocalStorage } from './useLocalStorage';

const setThemeAttribute = (theme: AppTheme) => {
  const htmlTag = document.getElementsByTagName('html');

  htmlTag[0].setAttribute(
    'data-bs-theme',
    theme == AppTheme.Light ? 'light' : 'dark'
  );
};

export interface ThemeState {
  current: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

export const useTheme = (themeKey: string): ThemeState => {
  const themeStorage = useLocalStorage(themeKey);

  const [theme, setTheme] = useState<AppTheme>(() => {
    const defaultTheme = themeStorage.exists()
      ? (parseInt(themeStorage.fetch()) as AppTheme)
      : window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ? AppTheme.Dark
      : AppTheme.Light;

    setThemeAttribute(defaultTheme);

    return defaultTheme;
  });

  useEffect(() => {
    themeStorage.commit(theme.toString());
    setThemeAttribute(theme);
  }, [theme]);

  return {
    current: theme,
    setTheme,
  };
};
