import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore, type ThemeMode } from '../../stores/theme.store';

const MODES: { value: ThemeMode; label: string; Icon: React.ElementType }[] = [
  { value: 'light', label: 'Claro', Icon: Sun },
  { value: 'dark', label: 'Oscuro', Icon: Moon },
  { value: 'system', label: 'Sistema', Icon: Monitor },
];

export const ThemeToggle: React.FC = () => {
  const { theme, actualTheme, setTheme } = useThemeStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = MODES.find((m) => m.value === theme) ?? MODES[2];
  const ActiveIcon = actualTheme === 'dark' ? Moon : Sun;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors shadow-sm text-sm font-medium"
        aria-label="Cambiar tema"
        title={`Tema: ${current.label}`}
      >
        <ActiveIcon className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
        <span className="hidden sm:inline text-xs">{current.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-36 rounded-xl border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 shadow-lg overflow-hidden">
          {MODES.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => { setTheme(value); setOpen(false); }}
              className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-sm transition-colors ${
                theme === value
                  ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
              {theme === value && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
