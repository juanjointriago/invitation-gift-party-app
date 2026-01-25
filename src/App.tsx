import { useEffect } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from './stores/auth.store';
import { routeConfig } from './routes/routes.config';
import { NotificationCenter } from './components/NotificationCenter';
import { SyncStatusIndicator } from './components/SyncStatusIndicator';

// Crear el router
const router = createBrowserRouter(routeConfig);

function App() {
  const { initializeAuthListener, loading } = useAuthStore();

  // Inicializar listener de autenticación al montar el componente
  useEffect(() => {
    const unsubscribe = initializeAuthListener();

    // Limpiar suscripción al desmontar
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [initializeAuthListener]);

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">🎉 PartyGifts</h1>
          <p className="text-text-muted">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" theme="system" />
      <NotificationCenter />
      <SyncStatusIndicator />
    </>
  );
}

export default App;
