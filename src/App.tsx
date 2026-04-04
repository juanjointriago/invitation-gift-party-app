import { useEffect } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from './stores/auth.store';
import { useThemeStore } from './stores/theme.store';
import { routeConfig } from './routes/routes.config';
import { NotificationCenter } from './components/NotificationCenter';
import { SyncStatusIndicator } from './components/SyncStatusIndicator';

// Crear el router
const router = createBrowserRouter(routeConfig);

function App() {
  const { initializeAuthListener, loading, user } = useAuthStore();
  const { initializeTheme, setTheme, applyUserBrandColors } = useThemeStore();

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // When a user logs in and has saved preferences, apply them
  useEffect(() => {
    if (!user) return;
    if (user.preferences?.theme) setTheme(user.preferences.theme);
    if (user.role === 'administrator' || user.role === 'anfitrion') {
      applyUserBrandColors({
        primary: user.preferences?.brandPrimary,
        secondary: user.preferences?.brandSecondary,
        accent: user.preferences?.brandAccent,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // only on user change (login/logout)

  useEffect(() => {
    const unsubscribe = initializeAuthListener();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [initializeAuthListener]);

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-300 mb-4">🎉 PartyGifts</h1>
          <p className="text-gray-600 dark:text-zinc-200">Cargando...</p>
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
