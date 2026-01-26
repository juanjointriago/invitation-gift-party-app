import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../db/initialize';
import type { StaticInvitation } from '../types/invitation.types';

const STORAGE_INVITATIONS_PATH = 'invitations';

/**
 * Carga una invitación estática desde Firebase Storage
 * @param uuid_invitation - UUID de la invitación
 * @returns Objeto StaticInvitation o lanza error
 */
export async function loadStaticInvitation(
  uuid_invitation: string
): Promise<StaticInvitation> {
  try {
    console.log('📥 Cargando invitación:', uuid_invitation);

    // 1. Obtener referencia al archivo
    const storageRef = ref(storage, `${STORAGE_INVITATIONS_PATH}/${uuid_invitation}.json`);

    // 2. Obtener URL pública de descarga
    const downloadUrl = await getDownloadURL(storageRef);

    // 3. Descargar y parsear JSON
    const response = await fetch(downloadUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const invitation: StaticInvitation = await response.json();

    // 4. Validación básica
    if (!invitation.uuid_invitation || !invitation.party_uuid) {
      throw new Error('JSON de invitación inválido');
    }

    console.log('✅ Invitación cargada exitosamente:', invitation.title);

    return invitation;

  } catch (error) {
    console.error('❌ Error cargando invitación:', error);
    
    // Mensajes de error específicos
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('404')) {
        throw new Error('INVITATION_NOT_FOUND');
      }
      if (error.message.includes('JSON')) {
        throw new Error('INVITATION_CORRUPTED');
      }
    }
    
    throw new Error('INVITATION_LOAD_ERROR');
  }
}

/**
 * Verifica si existe una invitación en Storage
 * @param uuid_invitation - UUID de la invitación
 * @returns true si existe, false si no
 */
export async function invitationExists(uuid_invitation: string): Promise<boolean> {
  try {
    const storageRef = ref(storage, `${STORAGE_INVITATIONS_PATH}/${uuid_invitation}.json`);
    await getDownloadURL(storageRef);
    return true;
  } catch {
    return false;
  }
}
