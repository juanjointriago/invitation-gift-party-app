import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { usePartyContextStore } from '../../stores/partyContext.store';
import { usePartyLoader } from '../../hooks/usePartyLoader';

export const PartyLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { partyUuid } = useParams();
  const [searchParams] = useSearchParams();
  const p_uuid = searchParams.get('p_uuid') || partyUuid || '';
  const currentParty = usePartyContextStore((s) => s.currentParty);
  const { fullParty, loading, error } = usePartyLoader(p_uuid);
  const formattedDate = (currentParty?.date || fullParty?.date)
    ? new Date(currentParty?.date || fullParty?.date || 0).toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : null;

  const goToAuth = (path: 'login' | 'register') => {
    navigate(`/auth/${path}?p_uuid=${p_uuid}`);
  };

  const cover =
    currentParty?.themeConfig?.coverImageUrl ||
    fullParty?.themeConfig?.coverImageUrl ||
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=60';

  return (
    <div className="container-app py-10">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <p className="text-sm text-primary font-semibold">Invitación</p>
          <h1 className="text-4xl font-bold text-text">
            {currentParty?.title || '¡Te invitamos a celebrar!'}
          </h1>
          <p className="text-text-muted">
            Ingresa para confirmar tu asistencia, responder preguntas y elegir un regalo de la lista.
          </p>
          <div className="text-sm text-text-muted space-y-1">
            {formattedDate && <p>Fecha: {formattedDate}</p>}
            {currentParty?.location && <p>Ubicación: {currentParty.location}</p>}
          </div>
          {error && <p className="text-error text-sm">{error}</p>}
          <div className="flex gap-3">
            <Button size="lg" onClick={() => goToAuth('login')} disabled={loading}>
              {loading ? 'Cargando...' : 'Iniciar sesión'}
            </Button>
            <Button size="lg" variant="outline" onClick={() => goToAuth('register')} disabled={loading}>
              {loading ? 'Cargando...' : 'Crear cuenta'}
            </Button>
          </div>
          {p_uuid && <p className="text-xs text-text-muted">Código de fiesta: {p_uuid}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="p-0 overflow-hidden">
            <div className="h-64 bg-gray-100">
              <img
                src={cover}
                alt="Fiesta"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 space-y-2">
              <h3 className="text-xl font-bold">{currentParty?.title || 'Fiesta especial'}</h3>
              <p className="text-text-muted">Fecha: Próximamente · Lugar: Por definir</p>
              <p className="text-text-muted text-sm">
                El anfitrión te ha invitado. Ingresa para ver los detalles completos.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
