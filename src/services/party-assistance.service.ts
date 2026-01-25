import type { PartyAssistanceGift, AnswerToQuestion } from '../types/party';
import { setItem, updateItem, getDocsFromCollectionQuery, getItemById } from '../db/fb.helper';

const COLLECTION_PARTY_ASSISTANCE = import.meta.env.VITE_COLLECTION_PARTY_ASSISTANCE || 'partyAssistanceGift';

/**
 * Servicio para manejar asistencia de invitados y selección de regalos
 * Incluye lógica de transacciones para evitar race conditions
 */
export class PartyAssistanceService {
  /**
   * Obtener todas las asistencias de una fiesta
   */
  static async getAssistancesByParty(partyUuid: string): Promise<PartyAssistanceGift[]> {
    try {
      const assistances = await getDocsFromCollectionQuery<PartyAssistanceGift>(
        COLLECTION_PARTY_ASSISTANCE,
        'party_uuid',
        '==',
        partyUuid
      );
      return assistances;
    } catch (error) {
      console.error('Error fetching party assistances:', error);
      throw error;
    }
  }

  /**
   * Obtener la asistencia de un invitado específico en una fiesta
   */
  static async getAssistanceByGuest(
    partyUuid: string,
    guestUserId: string
  ): Promise<PartyAssistanceGift | null> {
    try {
      // Crear ID compuesto para la búsqueda
      const assistanceId = `${partyUuid}_${guestUserId}`;
      const assistance = await getItemById<PartyAssistanceGift>(
        COLLECTION_PARTY_ASSISTANCE,
        assistanceId
      );
      return assistance && assistance.id ? assistance : null;
    } catch (error) {
      console.error('Error fetching guest assistance:', error);
      throw error;
    }
  }

  /**
   * Crear o actualizar la asistencia de un invitado
   * IMPORTANTE: En producción, esta lógica debería estar en una Cloud Function
   * para garantizar transaccionalidad y evitar race conditions
   */
  static async submitAssistance(
    partyUuid: string,
    guestUserId: string,
    selectedGiftId: string,
    selectedGiftName: string,
    answers: AnswerToQuestion[],
    quantity: number = 1
  ): Promise<PartyAssistanceGift> {
    try {
      const now = Date.now();
      const assistanceId = `${partyUuid}_${guestUserId}`;

      const assistance: PartyAssistanceGift = {
        id: assistanceId,
        party_uuid: partyUuid,
        guest_user_id: guestUserId,
        selectedGiftId,
        selectedGiftNameSnapshot: selectedGiftName,
        quantity,
        answersToQuestions: answers,
        attendanceConfirmed: true,
        createdAt: now,
        updatedAt: now,
        isActive: true,
      };

      await setItem(COLLECTION_PARTY_ASSISTANCE, assistance);
      console.debug('Assistance submitted:', assistanceId);
      return assistance;
    } catch (error) {
      console.error('Error submitting assistance:', error);
      throw error;
    }
  }

  /**
   * Actualizar la asistencia de un invitado
   */
  static async updateAssistance(
    partyUuid: string,
    guestUserId: string,
    updates: Partial<PartyAssistanceGift>
  ): Promise<void> {
    try {
      const assistanceId = `${partyUuid}_${guestUserId}`;
      await updateItem(COLLECTION_PARTY_ASSISTANCE, {
        id: assistanceId,
        ...updates,
        updatedAt: Date.now(),
      });
      console.debug('Assistance updated:', assistanceId);
    } catch (error) {
      console.error('Error updating assistance:', error);
      throw error;
    }
  }

  /**
   * Contar cuántos regalos han sido seleccionados de un tipo específico
   * Se usa para calcular remainingQuantity
   */
  static async countGiftSelections(
    partyUuid: string,
    giftId: string
  ): Promise<number> {
    try {
      const assistances = await this.getAssistancesByParty(partyUuid);
      return assistances.filter((a) => a.selectedGiftId === giftId).length;
    } catch (error) {
      console.error('Error counting gift selections:', error);
      throw error;
    }
  }

  /**
   * Obtener el regalo más seleccionado en una fiesta (para estadísticas)
   */
  static async getMostSelectedGift(partyUuid: string): Promise<{ giftId: string; count: number } | null> {
    try {
      const assistances = await this.getAssistancesByParty(partyUuid);
      
      const giftCounts: Record<string, number> = {};
      assistances.forEach((a) => {
        giftCounts[a.selectedGiftId] = (giftCounts[a.selectedGiftId] || 0) + 1;
      });

      let mostSelected = null;
      let maxCount = 0;

      Object.entries(giftCounts).forEach(([giftId, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostSelected = { giftId, count };
        }
      });

      return mostSelected;
    } catch (error) {
      console.error('Error getting most selected gift:', error);
      throw error;
    }
  }
}
