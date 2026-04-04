import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { toast } from 'sonner';

/**
 * Layout principal para la app
 * Envuelve la mayoría de páginas con navbar y estructura base
 */
export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-900">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-300 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm shadow-sm">
        <div className="container-app h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">🎉 PartyGifts</h1>
          </a>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors">
              Inicio
            </a>
            {user?.role === 'anfitrion' && (
              <a href="/host" className="text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors">
                Mis Fiestas
              </a>
            )}
            {user?.role === 'administrator' && (
              <a href="/admin/dashboard" className="text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors">
                Admin
              </a>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-600 dark:bg-purple-500 text-white flex items-center justify-center text-sm font-bold shadow-md">
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-sm text-gray-900 dark:text-gray-100 font-medium">{user.name || user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem disabled className="text-xs text-gray-600 dark:text-zinc-300">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Mi Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/auth/reset-password')}>
                    Cambiar Contraseña
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate('/auth/login')} size="sm">
                Ingresar
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white dark:bg-zinc-900 py-8">
        <div className="container-app text-center text-text-muted text-sm">
          <p>&copy; 2026 PartyGifts - Tool by Purple-Widget. All rights reserved.</p>
          <p className="mt-1 text-xs">
            <a href="https://purple-widget.com/" target="_blank" rel="noopener noreferrer" className="hover:text-purple-600">purple-widget.com</a>
            {' | '}
            <a href="tel:+593987357965" className="hover:text-purple-600">+593 98 735 7965</a>
          </p>
        </div>
      </footer>
    </div>
  );
};
