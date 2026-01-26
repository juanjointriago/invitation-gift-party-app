import { doc, getDoc, collection, getDocs, query } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../db/initialize';
import type { StaticInvitation, GeneratedInvitationResult } from '../types/invitation.types';

const BASE_URL = 'https://purple-party-invitation.web.app';
const STORAGE_INVITATIONS_PATH = 'invitations';

/**
 * Genera un UUID v4 aleatorio
 */
function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Genera el JSON estático de invitación pública
 * @param party_uuid - ID del documento en Firestore parties/{uuid}
 * @returns Resultado con URLs y datos generados
 */
export async function generateStaticInvitation(
  party_uuid: string
): Promise<GeneratedInvitationResult> {
  try {
    console.log('🎨 Generando invitación estática para party:', party_uuid);

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
    const hostRef = doc(db, 'users', partyData.userId);
    const hostSnap = await getDoc(hostRef);
    const hostName = hostSnap.exists() 
      ? (hostSnap.data().displayName || hostSnap.data().email || 'Anfitrión')
      : 'Anfitrión';

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

    // 6. Generar UUID único para la invitación
    const uuid_invitation = generateUUID();
    const publicUrl = `${BASE_URL}/public-invitation?uuid_invitation=${uuid_invitation}`;

    // 7. Construir objeto StaticInvitation
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

    // 8. Convertir a JSON string
    const jsonContent = JSON.stringify(invitation, null, 2);

    // 9. Subir a Firebase Storage
    const storageRef = ref(storage, `${STORAGE_INVITATIONS_PATH}/${uuid_invitation}.json`);
    await uploadString(storageRef, jsonContent, 'raw', {
      contentType: 'application/json',
      cacheControl: 'public, max-age=300', // Cache de 5 minutos
    });

    // 10. Obtener URL pública del archivo
    const storageUrl = await getDownloadURL(storageRef);

    console.log('✅ Invitación generada exitosamente:', {
      uuid_invitation,
      storageUrl,
      publicUrl,
    });

    // 11. Opcional: Guardar referencia en Firestore
    // await updateDoc(partyRef, {
    //   'invitation.uuid': uuid_invitation,
    //   'invitation.url': publicUrl,
    //   'invitation.storageUrl': storageUrl,
    //   'invitation.generatedAt': new Date(),
    // });

    return {
      success: true,
      uuid_invitation,
      storageUrl,
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
  
  // Simplemente genera una nueva (sobrescribirá la anterior si existe)
  return generateStaticInvitation(party_uuid);
}
