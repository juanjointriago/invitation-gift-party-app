import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../db/initialize';
import type { Party, PartyAssistanceGift } from '../types/party';

/**
 * Servicio de analítica para dashboards
 */
export const AnalyticsService = {
  /**
   * Obtiene estadísticas generales del sistema
   */
  async getSystemStats() {
    try {
      // Total de fiestas
      const partiesSnap = await getDocs(collection(db, 'parties'));
      const totalParties = partiesSnap.size;
      const publishedParties = partiesSnap.docs.filter((doc) => doc.data().status === 'published').length;

      // Total de asistencias
      const assistancesSnap = await getDocs(collection(db, 'partyAssistances'));
      const totalAssistances = assistancesSnap.size;

      // Total de preguntas
      let totalQuestions = 0;
      partiesSnap.docs.forEach((doc) => {
        const party = doc.data() as Party;
        totalQuestions += party.questions?.length || 0;
      });

      // Total de regalos
      let totalGifts = 0;
      partiesSnap.docs.forEach((doc) => {
        const party = doc.data() as Party;
        totalGifts += party.giftList?.length || 0;
      });

      return {
        totalParties,
        publishedParties,
        draftParties: totalParties - publishedParties,
        totalAssistances,
        totalQuestions,
        totalGifts,
        avgAssistancesPerParty: totalParties > 0 ? (totalAssistances / totalParties).toFixed(1) : 0,
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      throw error;
    }
  },

  /**
   * Obtiene estadísticas por rango de fechas
   */
  async getStatsByDateRange(startDate: Date, endDate: Date) {
    try {
      const partiesSnap = await getDocs(
        query(
          collection(db, 'parties'),
          where('createdAt', '>=', startDate),
          where('createdAt', '<=', endDate)
        )
      );

      const assistancesSnap = await getDocs(
        query(
          collection(db, 'partyAssistances'),
          where('createdAt', '>=', startDate),
          where('createdAt', '<=', endDate)
        )
      );

      return {
        partiesCreated: partiesSnap.size,
        assistancesRecorded: assistancesSnap.size,
        dateRange: { start: startDate, end: endDate },
      };
    } catch (error) {
      console.error('Error getting stats by date range:', error);
      throw error;
    }
  },

  /**
   * Obtiene los regalos más populares del sistema
   */
  async getMostPopularGifts(limit_count = 10) {
    try {
      const assistancesSnap = await getDocs(collection(db, 'partyAssistances'));
      
      const giftCounts: Record<string, { name: string; count: number }> = {};
      
      assistancesSnap.docs.forEach((doc) => {
        const assistance = doc.data() as PartyAssistanceGift;
        const giftId = assistance.selectedGiftId;
        const giftName = assistance.selectedGiftNameSnapshot || 'Desconocido';
        
        if (giftCounts[giftId]) {
          giftCounts[giftId].count += 1;
        } else {
          giftCounts[giftId] = { name: giftName, count: 1 };
        }
      });

      return Object.entries(giftCounts)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit_count);
    } catch (error) {
      console.error('Error getting most popular gifts:', error);
      throw error;
    }
  },

  /**
   * Obtiene las respuestas más comunes a una pregunta
   */
  async getQuestionAnswerStats() {
    try {
      // TODO: Implementar cuando tengamos estructura de respuestas
      return {};
    } catch (error) {
      console.error('Error getting question answer stats:', error);
      throw error;
    }
  },

  /**
   * Obtiene fiestas por estado
   */
  async getPartiesByStatus() {
    try {
      const partiesSnap = await getDocs(collection(db, 'parties'));
      
      const stats = {
        published: 0,
        draft: 0,
        archived: 0,
      };

      partiesSnap.docs.forEach((doc) => {
        const party = doc.data() as Party;
        if (party.status === 'published') stats.published += 1;
        else if (party.status === 'draft') stats.draft += 1;
        else if (party.status === 'archived') stats.archived += 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting parties by status:', error);
      throw error;
    }
  },

  /**
   * Obtiene tasa de respuesta (assist/total)
   */
  async getResponseRate() {
    try {
      const partiesSnap = await getDocs(collection(db, 'parties'));
      const assistancesSnap = await getDocs(collection(db, 'partyAssistances'));

      const totalParties = partiesSnap.size;
      const totalAssistances = assistancesSnap.size;

      // Aproximadamente: si hay ~10 invitaciones por fiesta
      const estimatedInvitations = totalParties * 10;
      const responseRate = estimatedInvitations > 0 ? ((totalAssistances / estimatedInvitations) * 100).toFixed(1) : 0;

      return {
        totalAssistances,
        estimatedInvitations,
        responseRatePercent: responseRate,
      };
    } catch (error) {
      console.error('Error getting response rate:', error);
      throw error;
    }
  },
};
