import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../stores/theme.store';

export const ThemeToggle: React.FC = () => {
  const { actualTheme, toggleTheme } = useThemeStore();
  
  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
      title={actualTheme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
    >
      {actualTheme === 'light' ? (
        <Moon className="w-5 h-5 text-gray-700" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-400" />
      )}
    </button>
  );
};
