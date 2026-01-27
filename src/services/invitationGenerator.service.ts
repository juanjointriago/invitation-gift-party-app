import { doc, getDoc, collection, getDocs, query, where, setDoc } from 'firebase/firestore';
import { db } from '../db/initialize';
import type { StaticInvitation, GeneratedInvitationResult } from '../types/invitation.types';

const BASE_URL = 'https://purple-party-invitation.web.app';

/**
 * Genera un UUID v4 aleatorio
 */
function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Obtiene una invitación existente para una fiesta
 * @param party_uuid - ID de la fiesta
 * @returns Invitación existente o null
 */
export async function getExistingInvitation(
  party_uuid: string
): Promise<GeneratedInvitationResult | null> {
  try {
    // Buscar en publicInvitations por party_uuid
    const invitationsRef = collection(db, 'publicInvitations');
    const q = query(invitationsRef, where('party_uuid', '==', party_uuid));
    const querySnap = await getDocs(q);

    if (!querySnap.empty) {
      const invDoc = querySnap.docs[0];
      const invitation = invDoc.data() as StaticInvitation;
      
      return {
        success: true,
        uuid_invitation: invitation.uuid_invitation,
        storageUrl: `firestore://publicInvitations/${invitation.uuid_invitation}`,
        publicUrl: invitation.invitationUrl,
      };
    }

    return null;
  } catch (error) {
    console.error('Error buscando invitación existente:', error);
    return null;
  }
}

/**
 * Genera el JSON estático de invitación pública
 * @param party_uuid - ID del documento en Firestore parties/{uuid}
 * @param forceRegenerate - Si es true, genera una nueva aunque exista una
 * @returns Resultado con URLs y datos generados
 */
export async function generateStaticInvitation(
  party_uuid: string,
  forceRegenerate: boolean = false
): Promise<GeneratedInvitationResult> {
  try {
    console.log('🎨 Generando invitación estática para party:', party_uuid);

    // Verificar si ya existe una invitación (a menos que se fuerce regeneración)
    if (!forceRegenerate) {
      const existing = await getExistingInvitation(party_uuid);
      if (existing) {
        console.log('✅ Invitación existente encontrada:', existing.uuid_invitation);
        return existing;
      }
    }

    // 1. Obtener datos de la fiesta
    const partyRef = doc(db, 'parties', party_uuid);
    const partySnap = await getDoc(partyRef);

    if (!partySnap.exists()) {
      throw new Error('La fiesta no existe');
    }

    const partyData = partySnap.data();

    // 2. Verificar que la fiesta esté publicada
    if (partyData.status !== 'published') {
      throw new Error('La fiesta debe estar publicada para generar invitación');
    }

    // 3. Obtener datos del anfitrión (host)
    let hostName = 'Anfitrión';
    if (partyData.userId) {
      try {
        const hostRef = doc(db, 'users', partyData.userId);
        const hostSnap = await getDoc(hostRef);
        if (hostSnap.exists()) {
          const hostData = hostSnap.data();
          hostName = hostData.displayName || hostData.email || 'Anfitrión';
        }
      } catch (error) {
        console.warn('⚠️ No se pudo obtener datos del anfitrión:', error);
      }
    }

    // 4. Obtener regalos de la fiesta
    const giftsQuery = query(collection(db, 'partyAssistanceGift'));
    const giftsSnap = await getDocs(giftsQuery);
    
    const giftList = giftsSnap.docs
      .filter(doc => doc.data().partyId === party_uuid)
      .map(doc => {
        const gift = doc.data();
        return {
          id: doc.id,
          name: gift.name || 'Sin nombre',
          description: gift.description || '',
          category: gift.category || 'default',
          maxQuantity: gift.maxQuantity || 1,
          remainingQuantity: gift.remainingQuantity ?? gift.maxQuantity ?? 1,
          imageUrl: gift.imageUrl,
        };
      });

    // 5. Extraer categorías únicas
    const categories = Array.from(new Set(giftList.map(g => g.category)));
    if (categories.length === 0) {
      categories.push('default');
    }

    // 8. Generar UUID único para la invitación
    const uuid_invitation = generateUUID();
    const publicUrl = `${BASE_URL}/public-invitation?uuid_invitation=${uuid_invitation}`;

    // 9. Construir objeto StaticInvitation
    const invitation: StaticInvitation = {
      uuid_invitation,
      party_uuid,
      title: partyData.title || 'Fiesta sin título',
      description: partyData.description || '',
      date: partyData.date || new Date().toISOString(),
      location: partyData.location || 'Por confirmar',
      hostName,
      
      themeConfig: {
        primaryColor: partyData.themeConfig?.primaryColor || '#9333EA',
        secondaryColor: partyData.themeConfig?.secondaryColor || '#EC4899',
        accentColor: partyData.themeConfig?.accentColor || '#F59E0B',
        backgroundColor: partyData.themeConfig?.backgroundColor || '#FFFFFF',
        coverImageUrl: partyData.themeConfig?.coverImageUrl || '',
        loginBannerUrl: partyData.themeConfig?.loginBannerUrl,
        giftCategoryIcons: partyData.themeConfig?.giftCategoryIcons || {},
        homeGalleryImages: partyData.themeConfig?.homeGalleryImages || [],
        customTexts: {
          welcomeTitle: partyData.themeConfig?.customTexts?.welcomeTitle || '¡Estás invitado!',
          welcomeSubtitle: partyData.themeConfig?.customTexts?.welcomeSubtitle || 'Únete a nuestra celebración',
          extraInfo: partyData.themeConfig?.customTexts?.extraInfo,
        },
      },
      
      questions: partyData.questions || [],
      giftList,
      categories,
      invitationUrl: publicUrl,
      
      generatedAt: new Date().toISOString(),
      version: '1.0',
    };

    // 10. Guardar en Firestore (colección pública)
    const invitationRef = doc(db, 'publicInvitations', uuid_invitation);
    await setDoc(invitationRef, invitation);

    console.log('✅ Invitación generada exitosamente:', {
      uuid_invitation,
      publicUrl,
    });

    return {
      success: true,
      uuid_invitation,
      storageUrl: `firestore://publicInvitations/${uuid_invitation}`,
      publicUrl,
    };

  } catch (error) {
    console.error('❌ Error generando invitación:', error);
    return {
      success: false,
      uuid_invitation: '',
      storageUrl: '',
      publicUrl: '',
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Regenera la invitación estática (útil cuando el anfitrión actualiza datos)
 * @param party_uuid - ID del documento en Firestore
 */
export async function regenerateStaticInvitation(
  party_uuid: string
): Promise<GeneratedInvitationResult> {
  console.log('🔄 Regenerando invitación para party:', party_uuid);
  
  // Forzar generación nueva
  return generateStaticInvitation(party_uuid, true);
}
