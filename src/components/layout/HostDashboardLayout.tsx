import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { Button } from '../ui/button';

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
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-border transition-all duration-300 flex flex-col sticky top-0 h-screen`}
      >
        {/* Logo */}
        <div className="h-16 border-b border-border flex items-center justify-center p-4">
          <h1 className={`${sidebarOpen ? 'text-lg' : 'text-xs'} font-bold text-primary`}>
            {sidebarOpen ? '🎉 PartyGifts' : '🎉'}
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/host"
            className={`flex items-center gap-3 px-4 py-2 rounded-md hover:bg-primary/10 transition-colors ${
              sidebarOpen ? '' : 'justify-center'
            }`}
          >
            <span className="text-xl">📊</span>
            {sidebarOpen && <span className="text-sm font-medium">Dashboard</span>}
          </Link>
          <Link
            to="/host/create"
            className={`flex items-center gap-3 px-4 py-2 rounded-md hover:bg-primary/10 transition-colors ${
              sidebarOpen ? '' : 'justify-center'
            }`}
          >
            <span className="text-xl">➕</span>
            {sidebarOpen && <span className="text-sm font-medium">Nueva Fiesta</span>}
          </Link>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-border">
          {sidebarOpen ? (
            <div className="text-xs text-text-muted mb-3">
              <p className="font-medium text-text truncate">{user?.name}</p>
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
        <header className="h-16 border-b border-border bg-white flex items-center px-6 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-text hover:text-primary transition-colors"
          >
            ☰
          </button>
          <div className="flex-1 flex items-center justify-end gap-4">
            <span className="text-sm text-text-muted">{user?.name}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
