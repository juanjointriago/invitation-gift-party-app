import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { usePartyContextStore } from '../../stores/partyContext.store';
import { useAuthStore } from '../../stores/auth.store';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/button';
import { Home, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';

/**
 * Layout para páginas del invitado en una fiesta
 * Aplica el branding temático de la fiesta
 */
export const PartyGuestLayout: React.FC = () => {
  const currentParty = usePartyContextStore((state) => state.currentParty);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  // Evitar hidratación incorrecta esperando al montaje
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-zinc-800">
      {/* Header temático */}
      {mounted && currentParty?.themeConfig?.loginBannerUrl && (
        <div
          className="h-48 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${currentParty.themeConfig.loginBannerUrl})` }}
        >
          <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />
        </div>
      )}

      {/* Navbar del invitado */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 shadow-sm">
        <div className="container-app h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mounted && currentParty?.themeConfig?.coverImageUrl && (
              <img
                src={currentParty.themeConfig.coverImageUrl}
                alt="Party"
                className="h-8 w-8 rounded-full object-cover"
              />
            )}
            <h1 className="text-lg font-bold text-purple-600 dark:text-purple-300">
              {mounted && currentParty?.title ? currentParty.title : 'Mi Fiesta'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoHome}
              className="gap-2"
              title="Ir al inicio"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Inicio</span>
            </Button>

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-600 dark:bg-purple-500 text-white flex items-center justify-center text-sm font-bold">
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-sm">{user.name || user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem disabled className="text-xs text-gray-500 dark:text-zinc-400">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleGoHome}>
                    Ir al Inicio
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Mi Perfil
                  </DropdownMenuItem>
                  {user.role === 'anfitrion' && (
                    <DropdownMenuItem onClick={() => navigate('/host')}>
                      Mis Fiestas
                    </DropdownMenuItem>
                  )}
                  {user.role === 'administrator' && (
                    <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                      Panel Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                onClick={() => navigate('/auth/login')}
              >
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
      <footer className="border-t border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 py-6">
        <div className="container-app text-center text-gray-600 dark:text-zinc-400 text-sm">
          <p>&copy; 2026 PartyGifts. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
