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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-white shadow-sm">
        <div className="container-app h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <h1 className="text-2xl font-bold text-primary">🎉 PartyGifts</h1>
          </a>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="text-text hover:text-primary transition-colors">
              Inicio
            </a>
            {user?.role === 'anfitrion' && (
              <a href="/host" className="text-text hover:text-primary transition-colors">
                Mis Fiestas
              </a>
            )}
            {user?.role === 'administrator' && (
              <a href="/admin/dashboard" className="text-text hover:text-primary transition-colors">
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
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-sm text-text">{user.name || user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem disabled className="text-xs text-text-muted">
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
                  <DropdownMenuItem onClick={handleLogout}>
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
      <footer className="border-t border-border bg-white py-8">
        <div className="container-app text-center text-text-muted text-sm">
          <p>&copy; 2026 PartyGifts. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
