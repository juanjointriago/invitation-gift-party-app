import type { BaseEntity } from './common';

/**
 * Configuración temática de una fiesta
 * Permite personalizar colores, imágenes y textos por fiesta
 */
export interface ThemeConfig {
  // Colores (overrides opcionales sobre la paleta global)
  primaryColor?: string;          // ej: #123456
  secondaryColor?: string;        // ej: #ABCDEF
  accentColor?: string;           // ej: #FF6600
  backgroundColor?: string;       // ej: #F5F5F5

  // Imágenes
  coverImageUrl?: string;         // Portada/carátula de la fiesta
  loginBannerUrl?: string;        // Banner del login
  homeGalleryImages?: string[];   // Fotos dentro del home de la fiesta

  // Iconos de categorías de regalos
  giftCategoryIcons?: Record<string, string>; // { "niña": "url", "niño": "url" }

  // Textos personalizados
  customTexts?: {
    welcomeTitle?: string;
    welcomeSubtitle?: string;
    extraInfo?: string;
  };

  // Filtrado de regalos
  filterGiftsByCategory?: boolean;  // Si está habilitado, filtra regalos según las respuestas del usuario
}

/**
 * Pregunta personalizada para una fiesta
 */
export interface Question {
  id: string;
  question: string;
  type: 'single-choice' | 'multi-choice' | 'text';
  options?: string[];             // Para preguntas de tipo choice
  required: boolean;              // Si la pregunta es obligatoria
  order?: number;                 // Orden de presentación
}

/**
 * Regalo en la lista de una fiesta
 */
export interface Gift {
  id: string;
  name: string;
  description?: string;
  category?: string;              // ej: "default", "niña", "niño", "unisex"
  maxQuantity: number;            // Máximo de unidades que pueden reservarse
  remainingQuantity: number;      // Calculado según reservas (maxQuantity - reserved)
  imageUrl?: string;
  order?: number;
}

/**
 * Entidad principal: Fiesta
 */
export interface Party extends BaseEntity {
  party_uuid: string;             // UUID único de la fiesta
  host_user_id: string;           // ID del usuario anfitrión
  
  // Datos básicos
  title: string;
  description: string;
  date: number;                   // Timestamp en ms
  location: string;
  
  // Configuración temática
  themeConfig?: ThemeConfig;
  
  // Datos de la fiesta
  questions: Question[];
  giftList: Gift[];
  categories?: string[];          // Categorías disponibles de regalos
  
  // Estado
  status: 'draft' | 'published' | 'archived';
  
  // Metadata
  totalGuestsConfirmed?: number;
  totalGiftsSelected?: number;
}

/**
 * Respuesta de un invitado a una pregunta
 */
export interface AnswerToQuestion {
  questionId: string;
  questionTextSnapshot: string;   // Snapshot del texto de la pregunta al momento
  answer: string | string[];      // Respuesta del invitado
}

/**
 * Registro de asistencia y regalo seleccionado por un invitado
 * Colección: partyAssistanceGift (o similar en Firestore)
 */
export interface PartyAssistanceGift extends BaseEntity {
  party_uuid: string;
  guest_user_id: string;
  
  // Regalo seleccionado
  selectedGiftId: string;
  selectedGiftNameSnapshot: string;
  quantity: number;               // Cantidad seleccionada (típicamente 1)
  
  // Respuestas a preguntas
  answersToQuestions: AnswerToQuestion[];
  
  // Confirmación de asistencia
  attendanceConfirmed: boolean;
}

/**
 * Datos mínimos de una fiesta que viajan en el contexto del invitado
 */
export interface PartyContextData {
  party_uuid: string;
  title: string;
  description?: string;
  date?: number;
  location?: string;
  themeConfig?: ThemeConfig;
  status: 'draft' | 'published' | 'archived';
}

/**
 * Estado de regalo desde la perspectiva del invitado
 * Combina info del regalo + info de disponibilidad
 */
export interface GiftWithAvailability extends Gift {
  isAvailable: boolean;           // remainingQuantity > 0
  isSelected?: boolean;           // Seleccionado por este invitado
}
