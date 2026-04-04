import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { useThemeStore } from '../../stores/theme.store';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/ThemeToggle';

/**
 * Layout para el dashboard del administrador
 * Similar al HostDashboardLayout pero con más opciones
 */
export const AdminDashboardLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { applyUserBrandColors } = useThemeStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  useEffect(() => {
    applyUserBrandColors({
      primary: user?.preferences?.brandPrimary,
      secondary: user?.preferences?.brandSecondary,
      accent: user?.preferences?.brandAccent,
    });
  }, [user?.preferences, applyUserBrandColors]);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-zinc-900">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-zinc-800 border-r border-gray-300 dark:border-zinc-700 transition-all duration-300 flex flex-col sticky top-0 h-screen shadow-lg`}
      >
        {/* Logo */}
        <div className="h-16 border-b border-gray-200 dark:border-zinc-600 flex items-center justify-center p-4">
          <h1 className={`${sidebarOpen ? 'text-lg' : 'text-xs'} font-bold text-purple-600 dark:text-purple-300`}>
            {sidebarOpen ? '👑 Admin' : '👑'}
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/admin/dashboard"
            className={`flex items-center gap-3 px-4 py-2 rounded-md hover:bg-purple-50 dark:hover:bg-zinc-600 transition-colors ${
              sidebarOpen ? '' : 'justify-center'
            }`}
          >
            <span className="text-xl">📊</span>
            {sidebarOpen && <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Dashboard</span>}
          </Link>
          <Link
            to="/admin/parties"
            className={`flex items-center gap-3 px-4 py-2 rounded-md hover:bg-purple-50 dark:hover:bg-zinc-600 transition-colors ${
              sidebarOpen ? '' : 'justify-center'
            }`}
          >
            <span className="text-xl">🎉</span>
            {sidebarOpen && <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Fiestas</span>}
          </Link>
          <Link
            to="/admin/users"
            className={`flex items-center gap-3 px-4 py-2 rounded-md hover:bg-purple-50 dark:hover:bg-zinc-600 transition-colors ${
              sidebarOpen ? '' : 'justify-center'
            }`}
          >
            <span className="text-xl">👥</span>
            {sidebarOpen && <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Usuarios</span>}
          </Link>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200 dark:border-zinc-600">
          {sidebarOpen ? (
            <div className="text-xs text-gray-600 dark:text-zinc-300 mb-3">
              <p className="font-medium text-gray-900 dark:text-zinc-100 truncate">{user?.name}</p>
              <p className="truncate">{user?.email}</p>
              <p className="text-purple-600 dark:text-purple-300 font-medium">Admin</p>
            </div>
          ) : null}
          <Button
            size="sm"
            variant="ghost"
            fullWidth={sidebarOpen}
            onClick={handleLogout}
            className="w-full"
          >
            {sidebarOpen ? 'Cerrar sesión' : '🚪'}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center px-6 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-900 dark:text-zinc-100 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-bold text-xl"
          >
            ☰
          </button>
          <div className="flex-1 flex items-center justify-end gap-4">
            <ThemeToggle />
            <span className="text-sm text-gray-900 dark:text-zinc-100 font-medium">{user?.name}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-zinc-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
