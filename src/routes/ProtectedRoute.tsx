import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import type { Role } from '../interfaces/users.interface';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Role[];
  fallbackPath?: string;
}

/**
 * Componente para proteger rutas basado en autenticación y rol
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  fallbackPath = '/auth/login',
}) => {
  const { isAuthenticated, user, loading } = useAuthStore();

  // Mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted">Cargando...</p>
        </div>
      </div>
    );
  }

  // No autenticado
  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Verificar rol si es requerido
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
