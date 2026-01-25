import React from 'react';
import { Outlet } from 'react-router-dom';
import { usePartyContextStore } from '../../stores/partyContext.store';

/**
 * Layout para páginas del invitado en una fiesta
 * Aplica el branding temático de la fiesta
 */
export const PartyGuestLayout: React.FC = () => {
  const currentParty = usePartyContextStore((state) => state.currentParty);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header temático */}
      {currentParty?.themeConfig?.loginBannerUrl && (
        <div
          className="h-48 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${currentParty.themeConfig.loginBannerUrl})` }}
        >
          <div className="absolute inset-0 bg-black/30" />
        </div>
      )}

      {/* Navbar del invitado */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-white shadow-sm">
        <div className="container-app h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentParty?.themeConfig?.coverImageUrl && (
              <img
                src={currentParty.themeConfig.coverImageUrl}
                alt="Party"
                className="h-8 w-8 rounded-full object-cover"
              />
            )}
            <h1 className="text-lg font-bold text-primary">
              {currentParty?.title || 'Mi Fiesta'}
            </h1>
          </div>
          <div className="text-sm text-text-muted">
            {currentParty?.status === 'published' && (
              <span className="text-success">✓ Fiesta Activa</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-6">
        <div className="container-app text-center text-text-muted text-sm">
          <p>&copy; 2026 PartyGifts. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
