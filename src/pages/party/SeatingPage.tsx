import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { VenueService } from '../../services/venue.service';
import { VenueViewer } from '../../components/venue';
import type { VenueLayout, SeatSearchResult } from '../../types/venue.types';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin } from 'lucide-react';
import { usePartyLoader } from '../../hooks/usePartyLoader';
import { usePartyContextStore } from '../../stores/partyContext.store';

export const SeatingPage: React.FC = () => {
  const { partyUuid } = useParams<{ partyUuid: string }>();
  const [searchParams] = useSearchParams();
  const p_uuid = searchParams.get('p_uuid') || partyUuid || '';
  const [layout, setLayout] = useState<VenueLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SeatSearchResult | null>(null);
  const [searched, setSearched] = useState(false);

  const { fullParty } = usePartyLoader(p_uuid);
  const setPartyData = usePartyContextStore((s) => s.setPartyData);
  const setPartyUuid = usePartyContextStore((s) => s.setPartyUuid);

  // Cargar contexto para aplicar colores del tema
  useEffect(() => {
    if (!fullParty) return;
    setPartyUuid(p_uuid);
    setPartyData({
      party_uuid: fullParty.party_uuid,
      title: fullParty.title,
      description: fullParty.description,
      date: fullParty.date,
      location: fullParty.location,
      themeConfig: fullParty.themeConfig,
      status: fullParty.status,
    });
  }, [fullParty, p_uuid, setPartyUuid, setPartyData]);

  useEffect(() => {
    if (!p_uuid) return;
    VenueService.getLayout(p_uuid)
      .then((l) => setLayout(l && l.isPublished ? l : null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [p_uuid]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!layout || !query.trim()) return;
    setResult(VenueService.searchGuest(layout, query));
    setSearched(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-60">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  if (!layout) return (
    <div className="text-center py-16 px-4">
      <p className="text-3xl mb-3">🏛️</p>
      <p className="text-gray-500 dark:text-gray-400">El anfitrión aún no ha publicado el plano del salón.</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 py-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">¿Dónde me siento?</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Escribe tu nombre para encontrar tu lugar</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="Tu nombre..." value={query}
            onChange={(e) => { setQuery(e.target.value); setSearched(false); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
        </div>
        <button type="submit" className="px-5 py-2.5 bg-primary hover:opacity-90 text-white font-medium rounded-lg transition-opacity">Buscar</button>
      </form>

      <AnimatePresence mode="wait">
        {searched && result && (
          <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {result.found ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-5 rounded-xl bg-primary/5 border border-primary/30">
                  <MapPin className="w-6 h-6 text-primary mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    {result.guestName && (
                      <p className="text-2xl font-extrabold text-gray-900 dark:text-white uppercase tracking-wide">
                        {result.guestName}
                      </p>
                    )}
                    <p className="text-base text-gray-700 dark:text-gray-200">
                      Tu lugar asignado es{' '}
                      <span className="font-bold text-primary">{result.tableLabel}</span>
                      {' '}asiento #{' '}
                      <span className="font-bold text-primary">{result.seatNumber}</span>
                    </p>
                  </div>
                </div>
                <VenueViewer layout={layout} highlightItemId={result.item?.id} highlightSeatId={result.seat?.id} title="Plano del salón" />
              </div>
            ) : (
              <div className="text-center py-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                <p className="text-yellow-700 dark:text-yellow-400 font-medium">No encontramos tu nombre en el plano</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">Verifica la ortografía o consulta con el anfitrión</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!searched && <VenueViewer layout={layout} title="Plano del salón" />}
    </div>
  );
};
