import { useEffect, useState } from 'react';

export function useTelegramWebApp() {
  const [webApp, setWebApp] = useState(null);
  const [user, setUser] = useState(null);
  const [initData, setInitData] = useState('');
  const [colorScheme, setColorScheme] = useState('dark');

  const applyTheme = (tg) => {
    const isLight = tg ? tg.colorScheme === 'light' : window.matchMedia('(prefers-color-scheme: light)').matches;
    const theme = isLight ? 'light' : 'dark';
    setColorScheme(theme);

    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('theme-light');
      root.classList.remove('theme-dark');
    } else {
      root.classList.add('theme-dark');
      root.classList.remove('theme-light');
    }

    // Set Telegram header and background colors
    if (tg) {
      tg.setHeaderColor(isLight ? '#f8fafc' : '#09090b');
      tg.setBackgroundColor(isLight ? '#f8fafc' : '#09090b');
    }
  };

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (tg) {
      tg.ready();
      tg.expand();

      applyTheme(tg);

      const handleThemeChange = () => {
        applyTheme(tg);
      };

      tg.onEvent('themeChanged', handleThemeChange);

      setWebApp(tg);
      setUser(tg.initDataUnsafe?.user || null);
      setInitData(tg.initData || '');

      return () => {
        tg.offEvent('themeChanged', handleThemeChange);
      };
    } else {
      // Fallback for browser
      applyTheme(null);
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      const handleMediaChange = () => applyTheme(null);
      mediaQuery.addEventListener('change', handleMediaChange);
      return () => mediaQuery.removeEventListener('change', handleMediaChange);
    }
  }, []);

  return { webApp, user, initData, colorScheme };
}
