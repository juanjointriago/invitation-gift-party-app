import { doc, getDoc } from 'firebase/firestore';
import { db } from '../db/initialize';
import type { StaticInvitation } from '../types/invitation.types';

/**
 * Carga una invitación estática desde Firestore
 * @param uuid_invitation - UUID de la invitación
 * @returns Objeto StaticInvitation o lanza error
 */
export async function loadStaticInvitation(
  uuid_invitation: string
): Promise<StaticInvitation> {
  try {
    console.log('📥 Cargando invitación:', uuid_invitation);

    // 1. Obtener documento de Firestore
    const invitationRef = doc(db, 'publicInvitations', uuid_invitation);
    const invitationSnap = await getDoc(invitationRef);

    // 2. Verificar que existe
    if (!invitationSnap.exists()) {
      throw new Error('INVITATION_NOT_FOUND');
    }

    // 3. Obtener datos
    const invitation = invitationSnap.data() as StaticInvitation;

    // 4. Validación básica
    if (!invitation.uuid_invitation || !invitation.party_uuid) {
      throw new Error('INVITATION_CORRUPTED');
    }

    console.log('✅ Invitación cargada exitosamente:', invitation.title);

    return invitation;

  } catch (error) {
    console.error('❌ Error cargando invitación:', error);
    
    // Mensajes de error específicos
    if (error instanceof Error) {
      if (error.message === 'INVITATION_NOT_FOUND') {
        throw error;
      }
      if (error.message === 'INVITATION_CORRUPTED') {
        throw error;
      }
    }
    
    throw new Error('INVITATION_LOAD_ERROR');
  }
}

/**
 * Verifica si existe una invitación en Firestore
 * @param uuid_invitation - UUID de la invitación
 * @returns true si existe, false si no
 */
export async function invitationExists(uuid_invitation: string): Promise<boolean> {
  try {
    const invitationRef = doc(db, 'publicInvitations', uuid_invitation);
    const invitationSnap = await getDoc(invitationRef);
    return invitationSnap.exists();
  } catch {
    return false;
  }
}
