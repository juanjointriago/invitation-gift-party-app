import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Layout para páginas de autenticación (login, register, reset-password)
 * Sin navbar, centrado, para mejor UX de auth
 */
export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 dark:from-gray-900 dark:to-purple-950/30 p-4 pb-24 sm:pb-8">
      {/* Logo/Brand */}
      <motion.div 
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h1 className="text-4xl font-bold text-primary mb-2">🎉 PartyGifts</h1>
        <p className="text-text-muted">Gestiona tus fiestas y regalos de forma fácil</p>
      </motion.div>

      {/* Content */}
      <div className="w-full max-w-md flex-shrink-0">
        <Outlet />
      </div>

      {/* Footer */}
      <footer className="mt-8 sm:mt-12 text-center text-text-muted text-xs sm:text-sm px-4">
        <p>&copy; 2026 PartyGifts. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};
