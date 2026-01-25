import { useCallback } from 'react';
import { usePartyContextStore } from '../stores/partyContext.store';
import { getTranslation } from './translations';

/**
 * Hook para obtener traducciones en cualquier componente
 * Uso: const t = useTranslation()
 *      t('auth.login') -> 'Iniciar sesión'
 */
export const useTranslation = () => {
  const language = usePartyContextStore((state) => state.language);

  const t = useCallback(
    (key: string): string => {
      return getTranslation(key, language);
    },
    [language]
  );

  return t;
};
