/**
 * Estructura del JSON estático de invitación pública
 * Este JSON se guarda en Firebase Storage y se consume sin autenticación
 */
export interface StaticInvitation {
  // Identificadores
  uuid_invitation: string;      // UUID único del archivo JSON (mismo que el nombre del archivo)
  party_uuid: string;            // ID del documento en Firestore parties/{uuid}
  
  // Información básica
  title: string;
  description: string;
  date: string;                  // ISO string format
  location: string;
  hostName: string;              // Nombre del anfitrión
  
  // Configuración de tema
  themeConfig: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    coverImageUrl: string;
    loginBannerUrl?: string;
    
    // Iconos por categoría de regalo
    giftCategoryIcons: {
      [category: string]: string;
    };
    
    // Galería de imágenes
    homeGalleryImages: string[];
    
    // Textos personalizados
    customTexts: {
      welcomeTitle: string;
      welcomeSubtitle: string;
      extraInfo?: string;
    };
  };
  
  // Preguntas de confirmación
  questions: InvitationQuestion[];
  
  // Lista de regalos (preview)
  giftList: InvitationGift[];
  
  // Categorías disponibles
  categories: string[];
  
  // URL pública completa
  invitationUrl: string;
  
  // Metadata
  generatedAt: string;           // Timestamp de generación
  version: string;               // Versión del formato (para futuras migraciones)
}

export interface InvitationQuestion {
  id: string;
  question: string;
  type: 'text' | 'select' | 'multiselect' | 'number';
  options?: string[];
  required: boolean;
}

export interface InvitationGift {
  id: string;
  name: string;
  description: string;
  category: string;
  maxQuantity: number;
  remainingQuantity: number;
  imageUrl?: string;
}

/**
 * Respuesta del servicio al generar/subir invitación
 */
export interface GeneratedInvitationResult {
  success: boolean;
  uuid_invitation: string;
  storageUrl: string;            // URL de Firebase Storage
  publicUrl: string;             // URL de la página pública
  error?: string;
}

/**
 * Estado de carga de la invitación pública
 */
export interface InvitationLoadState {
  loading: boolean;
  error: string | null;
  data: StaticInvitation | null;
}
