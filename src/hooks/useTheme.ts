import { useEffect } from 'react';

export const useTheme = () => {
  useEffect(() => {
    // Always apply dark theme to document root
      document.documentElement.classList.add('dark');
  }, []);

  return { theme: 'dark' };
};