import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/ThemeToggle';

/**
 * Layout para el dashboard del anfitrión
 * Sidebar + Header para navegación
 */
export const HostDashboardLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen flex bg-background dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-gray-800 border-r border-border dark:border-gray-700 transition-all duration-300 flex flex-col sticky top-0 h-screen`}
      >
        {/* Logo */}
        <div className="h-16 border-b border-border dark:border-gray-700 flex items-center justify-center p-4">
          <h1 className={`${sidebarOpen ? 'text-lg' : 'text-xs'} font-bold text-primary dark:text-purple-400`}>
            {sidebarOpen ? '🎉 PartyGifts' : '🎉'}
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/host"
            className={`flex items-center gap-3 px-4 py-2 rounded-md hover:bg-primary/10 dark:hover:bg-purple-900/30 transition-colors ${
              sidebarOpen ? '' : 'justify-center'
            }`}
          >
            <span className="text-xl">📊</span>
            {sidebarOpen && <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Dashboard</span>}
          </Link>
          <Link
            to="/host/create"
            className={`flex items-center gap-3 px-4 py-2 rounded-md hover:bg-primary/10 dark:hover:bg-purple-900/30 transition-colors ${
              sidebarOpen ? '' : 'justify-center'
            }`}
          >
            <span className="text-xl">➕</span>
            {sidebarOpen && <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Nueva Fiesta</span>}
          </Link>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-border dark:border-gray-700">
          {sidebarOpen ? (
            <div className="text-xs text-text-muted dark:text-gray-400 mb-3">
              <p className="font-medium text-text dark:text-gray-100 truncate">{user?.name}</p>
              <p className="truncate">{user?.email}</p>
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
        <header className="h-16 border-b border-border dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center px-6 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-text dark:text-gray-100 hover:text-primary dark:hover:text-purple-400 transition-colors"
          >
            ☺
          </button>
          <div className="flex-1 flex items-center justify-end gap-4">
            <ThemeToggle />
            <span className="text-sm text-text-muted dark:text-gray-400">{user?.name}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
