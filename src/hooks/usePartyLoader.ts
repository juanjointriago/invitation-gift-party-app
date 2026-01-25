import { useEffect, useRef, useState } from 'react';
import { PartyService } from '../services/party.service';
import { usePartyContextStore } from '../stores/partyContext.store';
import type { Party, PartyContextData } from '../types/party';

interface PartyLoaderResult {
  party: PartyContextData | null;
  fullParty: Party | null;
  loading: boolean;
  error: string | null;
}

export const usePartyLoader = (p_uuid?: string | null): PartyLoaderResult => {
  const party = usePartyContextStore((s) => s.currentParty);
  const setPartyUuid = usePartyContextStore((s) => s.setPartyUuid);
  const setPartyData = usePartyContextStore((s) => s.setPartyData);

  const [fullParty, setFullParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const targetUuid = p_uuid || null;
    if (!targetUuid) return;

    // Limpia suscripciones previas al cambiar de fiesta
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    setLoading(true);
    setError(null);
    setPartyUuid(targetUuid);

    const unsubscribe = PartyService.listenPartyByUuid(
      targetUuid,
      (fetched) => {
        if (fetched) {
          const minimal: PartyContextData = {
            party_uuid: fetched.party_uuid,
            title: fetched.title,
            status: fetched.status,
            themeConfig: fetched.themeConfig,
            description: fetched.description,
            date: fetched.date,
            location: fetched.location,
          };
          setPartyData(minimal);
          setFullParty(fetched);
          setError(null);
        } else {
          setFullParty(null);
          setError('No encontramos esta fiesta. Verifica el enlace.');
        }
        setLoading(false);
      },
      () => {
        setError('Error en tiempo real. Intenta de nuevo.');
        setLoading(false);
      }
    );

    unsubscribeRef.current = unsubscribe || null;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [p_uuid, setPartyData, setPartyUuid]);

  return { party: party || null, fullParty, loading, error };
};
