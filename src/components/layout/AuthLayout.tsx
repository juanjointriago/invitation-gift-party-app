import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Layout para páginas de autenticación (login, register, reset-password)
 * Sin navbar, centrado, para mejor UX de auth
 */
export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      {/* Logo/Brand */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">🎉 PartyGifts</h1>
        <p className="text-text-muted">Gestiona tus fiestas y regalos de forma fácil</p>
      </div>

      {/* Content */}
      <div className="w-full max-w-md">
        <Outlet />
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-center text-text-muted text-sm">
        <p>&copy; 2026 PartyGifts. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};
