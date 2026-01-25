import { z } from 'zod';

/**
 * Esquemas Zod para validación de entidades del dominio
 */

// ============================================
// Schemas para Party
// ============================================

export const themeConfigSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color inválido').optional(),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color inválido').optional(),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color inválido').optional(),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color inválido').optional(),
  coverImageUrl: z.string().url('URL inválida').optional(),
  loginBannerUrl: z.string().url('URL inválida').optional(),
  homeGalleryImages: z.array(z.string().url('URL inválida')).optional(),
  giftCategoryIcons: z.record(z.string(), z.string().url('URL inválida')).optional(),
  customTexts: z.object({
    welcomeTitle: z.string().max(200, 'Máximo 200 caracteres').optional(),
    welcomeSubtitle: z.string().max(500, 'Máximo 500 caracteres').optional(),
    extraInfo: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
  }).optional(),
});

export const questionSchema = z.object({
  id: z.string().uuid(),
  question: z.string().min(5, 'Mínimo 5 caracteres').max(500, 'Máximo 500 caracteres'),
  type: z.enum(['single-choice', 'multi-choice', 'text']),
  options: z.array(z.string().min(1, 'Opción no puede estar vacía')).optional(),
  required: z.boolean().default(false),
  order: z.number().optional(),
});

export const giftSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
  category: z.string().optional(),
  maxQuantity: z.number().int().min(1, 'Mínimo 1').max(1000, 'Máximo 1000'),
  remainingQuantity: z.number().int().min(0),
  imageUrl: z.string().url('URL inválida').optional(),
  order: z.number().optional(),
});

export const partyCreateSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
  description: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
  date: z.number().min(Date.now(), 'La fecha debe ser en el futuro'),
  location: z.string().min(3, 'Mínimo 3 caracteres').max(200, 'Máximo 200 caracteres'),
  themeConfig: themeConfigSchema.optional(),
  questions: z.array(questionSchema).max(20, 'Máximo 20 preguntas').default([]),
  giftList: z.array(giftSchema).max(50, 'Máximo 50 regalos').default([]),
  categories: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

export const partyEditSchema = partyCreateSchema.partial().extend({
  party_uuid: z.string().uuid(),
});

export type PartyCreateInput = z.infer<typeof partyCreateSchema>;
export type PartyEditInput = z.infer<typeof partyEditSchema>;

// ============================================
// Schemas para Question Forms
// ============================================

export const answerToQuestionSchema = z.object({
  questionId: z.string(),
  questionTextSnapshot: z.string(),
  answer: z.union([z.string(), z.array(z.string())]),
});

// ============================================
// Schemas para Party Assistance Gift
// ============================================

export const partyAssistanceGiftSchema = z.object({
  party_uuid: z.string().uuid(),
  guest_user_id: z.string(),
  selectedGiftId: z.string().uuid(),
  selectedGiftNameSnapshot: z.string(),
  quantity: z.number().int().min(1).default(1),
  answersToQuestions: z.array(answerToQuestionSchema).default([]),
  attendanceConfirmed: z.boolean(),
});

export type PartyAssistanceGiftInput = z.infer<typeof partyAssistanceGiftSchema>;
