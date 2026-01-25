import { v4 as uuidv4 } from 'uuid';
import type { Party } from '../types/party';
import { setItem, updateItem, deleteItem, getDocsFromCollection, getDocsFromCollectionQuery, getItemById, listenItemById } from '../db/fb.helper';

const COLLECTION_PARTIES = import.meta.env.VITE_COLLECTION_PARTIES || 'parties';

/**
 * Servicio para operaciones CRUD de fiestas (Party)
 */
export class PartyService {
  /**
   * Obtener una fiesta por UUID
   */
  static async getPartyByUuid(partyUuid: string): Promise<Party | null> {
    try {
      const party = await getItemById<Party>(COLLECTION_PARTIES, partyUuid);
      return party && party.id ? party : null;
    } catch (error) {
      console.error('Error fetching party:', error);
      throw error;
    }
  }

  /**
   * Suscribirse en tiempo real a una fiesta por UUID
   */
  static listenPartyByUuid(
    partyUuid: string,
    onData: (party: Party | null) => void,
    onError?: (error: unknown) => void
  ) {
    return listenItemById<Party>(COLLECTION_PARTIES, partyUuid, (party) => {
      onData(party && party.id ? party : null);
    }, onError);
  }

  /**
   * Obtener todas las fiestas de un anfitrión
   */
  static async getPartiesByHost(hostUserId: string): Promise<Party[]> {
    try {
      const parties = await getDocsFromCollectionQuery<Party>(
        COLLECTION_PARTIES,
        'host_user_id',
        '==',
        hostUserId
      );
      return parties;
    } catch (error) {
      console.error('Error fetching host parties:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las fiestas (solo admin)
   */
  static async getAllParties(): Promise<Party[]> {
    try {
      const parties = await getDocsFromCollection<Party>(COLLECTION_PARTIES);
      return parties;
    } catch (error) {
      console.error('Error fetching all parties:', error);
      throw error;
    }
  }

  /**
   * Crear una nueva fiesta
   */
  static async createParty(data: Omit<Party, 'id' | 'party_uuid' | 'createdAt' | 'updatedAt'>): Promise<Party> {
    try {
      const partyUuid = uuidv4();
      const now = Date.now();

      const newParty: Party = {
        id: partyUuid, // Usar UUID como ID en Firestore
        party_uuid: partyUuid,
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      await setItem(COLLECTION_PARTIES, newParty);
      console.debug('Party created:', partyUuid);
      return newParty;
    } catch (error) {
      console.error('Error creating party:', error);
      throw error;
    }
  }

  /**
   * Actualizar una fiesta
   */
  static async updateParty(partyUuid: string, updates: Partial<Party>): Promise<void> {
    try {
      await updateItem(COLLECTION_PARTIES, {
        id: partyUuid,
        ...updates,
        updatedAt: Date.now(),
      });
      console.debug('Party updated:', partyUuid);
    } catch (error) {
      console.error('Error updating party:', error);
      throw error;
    }
  }

  /**
   * Eliminar una fiesta
   */
  static async deleteParty(partyUuid: string): Promise<void> {
    try {
      await deleteItem(COLLECTION_PARTIES, partyUuid);
      console.debug('Party deleted:', partyUuid);
    } catch (error) {
      console.error('Error deleting party:', error);
      throw error;
    }
  }

  /**
   * Publicar una fiesta (cambiar estado a 'published')
   */
  static async publishParty(partyUuid: string): Promise<void> {
    try {
      await this.updateParty(partyUuid, { status: 'published' });
    } catch (error) {
      console.error('Error publishing party:', error);
      throw error;
    }
  }

  /**
   * Archivar una fiesta
   */
  static async archiveParty(partyUuid: string): Promise<void> {
    try {
      await this.updateParty(partyUuid, { status: 'archived' });
    } catch (error) {
      console.error('Error archiving party:', error);
      throw error;
    }
  }

  /**
   * Decrementar cantidad disponible de un regalo
   * Se usa después de confirmar asistencia del invitado
   */
  static async decrementGiftQuantity(partyUuid: string, giftId: string): Promise<void> {
    try {
      const party = await this.getPartyByUuid(partyUuid);
      if (!party || !party.giftList) return;

      const updatedGiftList = party.giftList.map((gift) =>
        gift.id === giftId
          ? {
              ...gift,
              remainingQuantity: Math.max((gift.remainingQuantity || 0) - 1, 0),
            }
          : gift
      );

      await this.updateParty(partyUuid, {
        giftList: updatedGiftList,
      });

      console.debug('Gift quantity decremented:', giftId);
    } catch (error) {
      console.error('Error decrementing gift quantity:', error);
      throw error;
    }
  }
}
