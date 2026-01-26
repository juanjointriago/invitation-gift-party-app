import { useState, useEffect } from 'react';
import { loadStaticInvitation } from '../services/invitationLoader.service';
import type { InvitationLoadState } from '../types/invitation.types';

/**
 * Hook personalizado para cargar invitaciones estáticas desde Storage
 * @param uuid_invitation - UUID de la invitación a cargar
 * @returns Estado de carga con data, loading y error
 */
export function useStaticInvitation(uuid_invitation: string | null): InvitationLoadState {
  const [state, setState] = useState<InvitationLoadState>({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    // Si no hay UUID, no intentar cargar
    if (!uuid_invitation) {
      setState({
        loading: false,
        error: 'No se proporcionó UUID de invitación',
        data: null,
      });
      return;
    }

    // Función para cargar la invitación
    const loadInvitation = async () => {
      setState({ loading: true, error: null, data: null });

      try {
        const invitation = await loadStaticInvitation(uuid_invitation);
        setState({ loading: false, error: null, data: invitation });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        
        // Mensajes de error amigables
        let friendlyError = 'Error al cargar la invitación';
        
        if (errorMessage === 'INVITATION_NOT_FOUND') {
          friendlyError = 'Esta invitación no existe o ha sido eliminada';
        } else if (errorMessage === 'INVITATION_CORRUPTED') {
          friendlyError = 'La invitación está corrupta. Contacta al anfitrión.';
        } else if (errorMessage === 'INVITATION_LOAD_ERROR') {
          friendlyError = 'No se pudo cargar la invitación. Intenta nuevamente.';
        }
        
        setState({ loading: false, error: friendlyError, data: null });
      }
    };

    loadInvitation();
  }, [uuid_invitation]);

  return state;
}
