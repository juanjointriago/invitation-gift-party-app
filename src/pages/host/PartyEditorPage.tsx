import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Card, CardBody, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { MultiStepForm, type MultiStepFormStep } from '../../components/ui';
import { PublicInvitationActions } from '../../components/PublicInvitationActions';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { GalleryUpload } from '../../components/ui/GalleryUpload';
import { usePartyLoader } from '../../hooks/usePartyLoader';
import { PartyService } from '../../services/party.service';
import { useNotificationStore } from '../../stores/notification.store';
import { toast } from 'sonner';
import type { Party, ThemeConfig } from '../../types/party';
import { usePartyContextStore } from '../../stores/partyContext.store';
import { isMapUrl, generateMapLinks } from '../../utils/map.utils';

const questionFormSchema = z.object({
  id: z.string().min(1),
  question: z
    .string()
    .min(5, 'La pregunta debe tener mínimo 5 caracteres')
    .max(500, 'La pregunta es demasiado larga (máximo 500 caracteres)')
    .trim()
    .refine((val) => val.trim().length >= 5, {
      message: 'La pregunta no puede ser solo espacios',
    }),
  type: z.enum(['single-choice', 'multi-choice', 'text']),
  options: z.array(z.string().min(1)).default([]),
  required: z.boolean().default(false),
  order: z.number().optional(),
});

const giftFormSchema = z.object({
  id: z.string().min(1),
  name: z
    .string()
    .min(3, 'El nombre del regalo debe tener mínimo 3 caracteres')
    .max(100, 'El nombre es demasiado largo (máximo 100 caracteres)')
    .trim()
    .refine((val) => val.trim().length >= 3, {
      message: 'El nombre no puede ser solo espacios',
    }),
  description: z
    .string()
    .max(500, 'La descripción es demasiado larga (máximo 500 caracteres)')
    .trim()
    .optional(),
  category: z.string().trim().optional(),
  maxQuantity: z.number().int().min(1, 'Mínimo 1 unidad').max(1000, 'Máximo 1000 unidades'),
  remainingQuantity: z.number().int().min(0, 'No puede ser negativo'),
  imageUrl: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'URL inválida' }
    )
    .optional(),
  order: z.number().optional(),
});

const themeFormSchema = z.object({
  primaryColor: z
    .string()
    .trim()
    .regex(/^#[0-9A-F]{6}$/i, 'Color hexadecimal inválido (ejemplo: #FF5733)')
    .optional(),
  secondaryColor: z
    .string()
    .trim()
    .regex(/^#[0-9A-F]{6}$/i, 'Color hexadecimal inválido (ejemplo: #FF5733)')
    .optional(),
  accentColor: z
    .string()
    .trim()
    .regex(/^#[0-9A-F]{6}$/i, 'Color hexadecimal inválido (ejemplo: #FF5733)')
    .optional(),
  backgroundColor: z
    .string()
    .trim()
    .regex(/^#[0-9A-F]{6}$/i, 'Color hexadecimal inválido (ejemplo: #FF5733)')
    .optional(),
  coverImageUrl: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'URL inválida' }
    )
    .optional(),
  loginBannerUrl: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'URL inválida' }
    )
    .optional(),
  homeGalleryImages: z
    .array(
      z.string().refine(
        (val) => {
          try {
            new URL(val);
            return true;
          } catch {
            return false;
          }
        },
        { message: 'URL inválida' }
      )
    )
    .optional(),
  giftCategoryIcons: z
    .record(
      z.string(),
      z.string().refine(
        (val) => {
          try {
            new URL(val);
            return true;
          } catch {
            return false;
          }
        },
        { message: 'URL inválida' }
      )
    )
    .optional(),
  customTexts: z
    .object({
      welcomeTitle: z.string().max(200, 'Máximo 200 caracteres').trim().optional(),
      welcomeSubtitle: z.string().max(500, 'Máximo 500 caracteres').trim().optional(),
      extraInfo: z.string().max(1000, 'Máximo 1000 caracteres').trim().optional(),
    })
    .optional(),
  filterGiftsByCategory: z.boolean().optional(),
  displayMode: z.enum(['invitation', 'seating', 'both']).optional(),
});

const dateStringSchema = z
  .string()
  .min(1, 'La fecha es requerida')
  .refine((val) => !Number.isNaN(new Date(val).getTime()), 'Fecha inválida');

const partyFormSchema = z
  .object({
    title: z
      .string()
      .min(3, 'El título debe tener mínimo 3 caracteres')
      .max(100, 'El título es demasiado largo (máximo 100 caracteres)')
      .trim()
      .refine((val) => val.trim().length >= 3, {
        message: 'El título no puede ser solo espacios',
      }),
    description: z
      .string()
      .max(1000, 'La descripción es demasiado larga (máximo 1000 caracteres)')
      .trim()
      .optional(),
    date: dateStringSchema,
    location: z
      .string()
      .min(3, 'La ubicación debe tener mínimo 3 caracteres')
      .max(200, 'La ubicación es demasiado larga (máximo 200 caracteres)')
      .trim()
      .refine((val) => val.trim().length >= 3, {
        message: 'La ubicación no puede ser solo espacios',
      }),
    status: z.enum(['draft', 'published', 'archived']),
    questions: z.array(questionFormSchema).max(20, 'Máximo 20 preguntas'),
    giftList: z.array(giftFormSchema).max(50, 'Máximo 50 regalos'),
    themeConfig: themeFormSchema.optional(),
    maxPhotosPerPerson: z.number().int().min(1, 'Mínimo 1').max(10, 'Máximo 10').optional(),
    allowCompanions: z.boolean().optional(),
    maxCompanionsPerGuest: z.number().int().min(1, 'Mínimo 1').max(5, 'Máximo 5').optional(),
  })
  .superRefine((data, ctx) => {
    data.giftList.forEach((g, idx) => {
      if (g.remainingQuantity > g.maxQuantity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['giftList', idx, 'remainingQuantity'],
          message: 'La cantidad restante no puede ser mayor que el máximo',
        });
      }
    });
  });

type PartyFormValues = {
  title: string;
  description?: string;
  date: string;
  location: string;
  status: 'draft' | 'published' | 'archived';
  questions: {
    id: string;
    question: string;
    type: 'single-choice' | 'multi-choice' | 'text';
    options?: string[];
    required?: boolean;
    order?: number;
  }[];
  giftList: {
    id: string;
    name: string;
    description?: string;
    category?: string;
    maxQuantity: number;
    remainingQuantity: number;
    imageUrl?: string;
    order?: number;
  }[];
  themeConfig?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    coverImageUrl?: string;
    loginBannerUrl?: string;
    homeGalleryImages?: string[];
    giftCategoryIcons?: Record<string, string>;
    customTexts?: {
      welcomeTitle?: string;
      welcomeSubtitle?: string;
      extraInfo?: string;
    };
    filterGiftsByCategory?: boolean;
    displayMode?: 'invitation' | 'seating' | 'both';
  };
  maxPhotosPerPerson?: number;
  allowCompanions?: boolean;
  maxCompanionsPerGuest?: number;
};

const formatDateInput = (timestamp?: number) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(timestamp - tzOffset).toISOString().slice(0, 16);
};

const parseDateToMs = (value: string) => new Date(value).getTime();

/** Location field with map URL detection and helper hints */
const LocationField: React.FC<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any; watch: any; errors: any;
}> = ({ register, watch, errors }) => {
  const loc: string = watch('location') || '';
  const isMap = loc.length > 3 && isMapUrl(loc);
  const mapLinks = isMap ? generateMapLinks(loc) : null;
  return (
    <div>
      <Input
        label="Ubicación"
        placeholder="Pega enlace de Google Maps o escribe coordenadas"
        {...register('location')}
        error={errors.location?.message}
      />
      <div className="mt-1.5">
        {isMap && mapLinks ? (
          <p className="text-xs text-green-600 dark:text-green-400">
            ✅ Mapa detectado — los invitados verán botones de Google Maps y Waze
          </p>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 Para navegación: en Google Maps busca el lugar → toca <strong>Compartir</strong> → copia el enlace. También puedes usar coordenadas: <code className="bg-gray-100 dark:bg-zinc-700 px-1 rounded text-xs">-0.1800,-78.4678</code>
          </p>
        )}
      </div>
    </div>
  );
};

/** Color picker field: shows a large swatch + hex value + native color input */
const ColorField: React.FC<{
  label: string;
  value?: string;
  defaultColor: string;
  onChange: (hex: string) => void;
}> = ({ label, value, defaultColor, onChange }) => {
  const displayColor = value && /^#[0-9A-F]{6}$/i.test(value) ? value : defaultColor;
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 hover:border-purple-400 dark:hover:border-purple-500 transition-colors">
      <label className="relative cursor-pointer shrink-0" title="Click para abrir selector de color">
        <div
          className="w-14 h-14 rounded-lg shadow-md ring-2 ring-white dark:ring-zinc-700 ring-offset-1"
          style={{ backgroundColor: displayColor }}
        />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-zinc-700 rounded-full border border-gray-200 dark:border-zinc-600 flex items-center justify-center shadow-sm">
          <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
          </svg>
        </div>
        <input
          type="color"
          value={displayColor}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        />
      </label>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="font-mono font-bold text-gray-900 dark:text-white text-sm">{displayColor.toUpperCase()}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Click para cambiar</p>
      </div>
    </div>
  );
};

export const PartyEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { partyUuid } = useParams();
  const [searchParams] = useSearchParams();
  const p_uuid = searchParams.get('p_uuid') || partyUuid || '';

  const { fullParty, loading: partyLoading, error } = usePartyLoader(p_uuid);

  const {
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<PartyFormValues>({
    resolver: zodResolver<PartyFormValues, any, PartyFormValues>(partyFormSchema),
    defaultValues: {
      title: '',
      description: '',
      date: '',
      location: '',
      status: 'draft',
      questions: [],
      giftList: [],
      themeConfig: {},
      maxPhotosPerPerson: 5,
      allowCompanions: false,
      maxCompanionsPerGuest: 1,
    },
  });

  const { applyPartyTheme } = usePartyContextStore();
  const { addNotification } = useNotificationStore();
  const originalThemeRef = useRef<ThemeConfig | undefined>(undefined);
  const [livePreview, setLivePreview] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'remove-question' | 'remove-gift';
    index: number;
    item: string;
  }>({
    isOpen: false,
    type: 'remove-question',
    index: -1,
    item: '',
  });
  const themePreview = watch('themeConfig') || {};

  const {
    fields: questionsFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({ control, name: 'questions' });

  const {
    fields: giftsFields,
    append: appendGift,
    remove: removeGift,
  } = useFieldArray({ control, name: 'giftList' });

  const paletteOptions = useMemo(
    () => [
      {
        name: 'Fiesta coral',
        colors: { primaryColor: '#F97316', secondaryColor: '#FDE68A', accentColor: '#EC4899', backgroundColor: '#FFF7ED' },
      },
      {
        name: 'Noches violeta',
        colors: { primaryColor: '#7C3AED', secondaryColor: '#A78BFA', accentColor: '#22D3EE', backgroundColor: '#F8FAFC' },
      },
      {
        name: 'Verde brisa',
        colors: { primaryColor: '#22C55E', secondaryColor: '#BBF7D0', accentColor: '#0EA5E9', backgroundColor: '#ECFEFF' },
      },
      {
        name: 'Noche dorada',
        colors: { primaryColor: '#D97706', secondaryColor: '#FBBF24', accentColor: '#F59E0B', backgroundColor: '#FFF8E1' },
      },
      {
        name: 'Cielo ártico',
        colors: { primaryColor: '#0EA5E9', secondaryColor: '#BAE6FD', accentColor: '#6366F1', backgroundColor: '#F0F9FF' },
      },
    ],
    []
  );

  const [selectedPalette, setSelectedPalette] = useState<string | null>(null);

  useEffect(() => {
    const match = paletteOptions.find((palette) => {
      const colors = palette.colors;
      return (
        colors.primaryColor === themePreview.primaryColor &&
        colors.secondaryColor === themePreview.secondaryColor &&
        colors.accentColor === themePreview.accentColor &&
        colors.backgroundColor === themePreview.backgroundColor
      );
    });

    setSelectedPalette(match ? match.name : null);
  }, [paletteOptions, themePreview]);

  useEffect(() => {
    if (fullParty) {
      reset({
        title: fullParty.title || '',
        description: fullParty.description || '',
        date: formatDateInput(fullParty.date),
        location: fullParty.location || '',
        status: fullParty.status || 'draft',
        questions: (fullParty.questions || []).map((q, idx) => ({
          id: q.id || uuidv4(),
          question: q.question,
          type: q.type,
          options: q.options || [],
          required: q.required ?? false,
          order: q.order ?? idx,
        })),
        giftList: (fullParty.giftList || []).map((g, idx) => ({
          id: g.id || uuidv4(),
          name: g.name,
          description: g.description,
          category: g.category,
          maxQuantity: g.maxQuantity,
          remainingQuantity: g.remainingQuantity,
          imageUrl: g.imageUrl,
          order: g.order ?? idx,
        })),
        themeConfig: fullParty.themeConfig || {},
        maxPhotosPerPerson: (fullParty as any).maxPhotosPerPerson ?? 5,
        allowCompanions: (fullParty as any).allowCompanions ?? false,
        maxCompanionsPerGuest: (fullParty as any).maxCompanionsPerGuest ?? 1,
      });
      originalThemeRef.current = fullParty.themeConfig;
    }
  }, [fullParty, reset]);

  useEffect(() => {
    if (livePreview) {
      applyPartyTheme(themePreview as ThemeConfig);
    } else if (originalThemeRef.current) {
      applyPartyTheme(originalThemeRef.current);
    }

    return () => {
      if (originalThemeRef.current) {
        applyPartyTheme(originalThemeRef.current);
      }
    };
  }, [applyPartyTheme, livePreview, themePreview]);

  const onSubmit = async (values: PartyFormValues) => {
    if (!p_uuid) return;
    const payload: Partial<Party> = {
      ...values,
      date: parseDateToMs(values.date),
      updatedAt: Date.now(),
      maxPhotosPerPerson: values.maxPhotosPerPerson ?? 5,
      allowCompanions: values.allowCompanions ?? false,
      maxCompanionsPerGuest: values.maxCompanionsPerGuest ?? 1,
    } as Partial<Party>;

    try {
      await PartyService.updateParty(p_uuid, payload);
      toast.success('Fiesta actualizada');
      navigate(-1);
    } catch (err) {
      toast.error('Error al guardar. Intenta de nuevo.');
    }
  };

  const steps: MultiStepFormStep[] = useMemo(
    () => [
      {
        id: 'basic',
        title: 'Datos básicos',
        description: 'Título, descripción, fecha y estado',
        content: (
          <div className="space-y-4">
            <Input
              label="Título"
              placeholder="Ej: Fiesta de cumpleaños"
              {...register('title')}
              error={errors.title?.message}
            />
            <Textarea
              label="Descripción"
              placeholder="Cuéntanos sobre tu fiesta"
              {...register('description')}
              error={errors.description?.message}
            />
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Fecha"
                type="datetime-local"
                {...register('date')}
                error={errors.date?.message}
              />
              <LocationField
                register={register}
                watch={watch}
                errors={errors}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Estado</label>
                <select
                  {...register('status')}
                  className="mt-1 w-full border border-gray-300 dark:border-zinc-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicada</option>
                  <option value="archived">Archivada</option>
                </select>
                {errors.status?.message && (
                  <p className="text-error text-xs mt-1">{errors.status.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">¿Qué ven los invitados?</label>
                <Controller
                  control={control}
                  name="themeConfig.displayMode"
                  render={({ field }) => (
                    <select
                      value={field.value || 'both'}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="mt-1 w-full border border-gray-300 dark:border-zinc-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="both">Invitación + Plano del salón</option>
                      <option value="invitation">Solo invitación</option>
                      <option value="seating">Solo plano del salón</option>
                    </select>
                  )}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Controla qué pantallas ven tus invitados al acceder al evento</p>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'questions',
        title: 'Preguntas',
        description: 'Personaliza preguntas para los invitados',
        content: (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 dark:text-white">Preguntas ({questionsFields.length})</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendQuestion({
                    id: uuidv4(),
                    question: '',
                    type: 'text',
                    required: false,
                    options: [],
                    order: questionsFields.length,
                  })
                }
              >
                + Pregunta
              </Button>
            </div>

            {questionsFields.length === 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">Sin preguntas aún. Añade la primera.</p>
            )}

            {questionsFields.map((field, idx) => (
              <Card key={field.id} className="border border-gray-300 dark:border-zinc-600">
                <CardBody className="space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <Input
                      label={`Pregunta ${idx + 1}`}
                      placeholder="¿Cuál es tu pregunta?"
                      {...register(`questions.${idx}.question` as const)}
                      error={errors.questions?.[idx]?.question?.message}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setConfirmDialog({
                          isOpen: true,
                          type: 'remove-question',
                          index: idx,
                          item: (watch(`questions.${idx}.question`) as string) || `Pregunta ${idx + 1}`,
                        });
                      }}
                    >
                      Eliminar
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Tipo</label>
                      <select
                        {...register(`questions.${idx}.type` as const)}
                        className="mt-1 w-full border border-gray-300 dark:border-zinc-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="text">Texto</option>
                        <option value="single-choice">Opción única</option>
                        <option value="multi-choice">Múltiple opción</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input type="checkbox" {...register(`questions.${idx}.required` as const)} />
                      <span className="text-sm text-gray-900 dark:text-gray-100">Requerida</span>
                    </div>
                    <Input
                      label="Orden"
                      type="number"
                      {...register(`questions.${idx}.order` as const, { valueAsNumber: true })}
                    />
                  </div>

                  <Controller
                    control={control}
                    name={`questions.${idx}.options` as const}
                    render={({ field }) => (
                      <Textarea
                        label="Opciones (separadas por coma)"
                        placeholder="Ej: Sí,No,Quizá"
                        value={(field.value || []).join(', ')}
                        onChange={(e) => {
                          const rawValue = e.target.value;
                          const options = rawValue.split(',').map((opt) => opt.trim());
                          field.onChange(options);
                        }}
                        onBlur={(e) => {
                          const cleanedOptions = e.target.value
                            .split(',')
                            .map((opt) => opt.trim())
                            .filter(Boolean);
                          field.onChange(cleanedOptions);
                        }}
                        disabled={watch(`questions.${idx}.type`) === 'text'}
                        helperText="Solo aplica para opción única o múltiple"
                      />
                    )}
                  />
                </CardBody>
              </Card>
            ))}
          </div>
        ),
      },
      {
        id: 'gifts',
        title: 'Regalos',
        description: 'Configura la lista de regalos disponibles',
        content: (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 dark:text-white">Regalos ({giftsFields.length})</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendGift({
                    id: uuidv4(),
                    name: '',
                    maxQuantity: 1,
                    remainingQuantity: 1,
                    order: giftsFields.length,
                  })
                }
              >
                + Regalo
              </Button>
            </div>

            {giftsFields.length === 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">Sin regalos aún. Añade el primero.</p>
            )}

            {giftsFields.map((field, idx) => (
              <Card key={field.id} className="border border-gray-300 dark:border-zinc-600">
                <CardBody className="space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <Input
                      label={`Regalo ${idx + 1}`}
                      placeholder="Ej: Pañitos húmedos"
                      {...register(`giftList.${idx}.name` as const)}
                      error={errors.giftList?.[idx]?.name?.message}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setConfirmDialog({
                          isOpen: true,
                          type: 'remove-gift',
                          index: idx,
                          item: (watch(`giftList.${idx}.name`) as string) || `Regalo ${idx + 1}`,
                        });
                      }}
                    >
                      Eliminar
                    </Button>
                  </div>
                  <Textarea
                    label="Descripción"
                    placeholder="Describe el regalo"
                    {...register(`giftList.${idx}.description` as const)}
                  />
                  <div className="grid md:grid-cols-3 gap-3">
                    <Input
                      label="Cantidad máxima"
                      type="number"
                      {...register(`giftList.${idx}.maxQuantity` as const, { valueAsNumber: true })}
                      error={errors.giftList?.[idx]?.maxQuantity?.message}
                    />
                    <Input
                      label="Cantidad disponible"
                      type="number"
                      {...register(`giftList.${idx}.remainingQuantity` as const, { valueAsNumber: true })}
                      error={errors.giftList?.[idx]?.remainingQuantity?.message}
                    />
                    <Input
                      label="Orden"
                      type="number"
                      {...register(`giftList.${idx}.order` as const, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <Input
                      label="Categoría"
                      placeholder="Ej: niño, niña, unisex"
                      {...register(`giftList.${idx}.category` as const)}
                    />
                    <Input
                      label="URL de imagen"
                      placeholder="https://..."
                      {...register(`giftList.${idx}.imageUrl` as const)}
                      error={errors.giftList?.[idx]?.imageUrl?.message}
                    />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ),
      },
      {
        id: 'theme',
        title: 'Tema y textos',
        description: 'Colores, portada y mensajes personalizados',
        content: (
          <Card>
            <CardBody className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Define los colores base y mira la vista previa.</p>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                  <input
                    type="checkbox"
                    checked={livePreview}
                    onChange={(e) => setLivePreview(e.target.checked)}
                  />
                  Previsualizar en la app
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <ColorField
                  label="Color primario"
                  value={themePreview.primaryColor}
                  defaultColor="#7C3AED"
                  onChange={(hex) => setValue('themeConfig.primaryColor', hex, { shouldDirty: true })}
                />
                <ColorField
                  label="Color secundario"
                  value={themePreview.secondaryColor}
                  defaultColor="#A78BFA"
                  onChange={(hex) => setValue('themeConfig.secondaryColor', hex, { shouldDirty: true })}
                />
                <ColorField
                  label="Color acento"
                  value={themePreview.accentColor}
                  defaultColor="#0EA5E9"
                  onChange={(hex) => setValue('themeConfig.accentColor', hex, { shouldDirty: true })}
                />
                <ColorField
                  label="Color de fondo"
                  value={themePreview.backgroundColor}
                  defaultColor="#F8FAFC"
                  onChange={(hex) => setValue('themeConfig.backgroundColor', hex, { shouldDirty: true })}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-gray-900 dark:text-white">Paleta seleccionada: {selectedPalette || 'Personalizada'}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setLivePreview(true)}
                >
                  Aplicar y previsualizar
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                {paletteOptions.map((palette) => {
                  const isActive = selectedPalette === palette.name;

                  return (
                    <button
                      key={palette.name}
                      type="button"
                      onClick={() => {
                        setValue('themeConfig.primaryColor', palette.colors.primaryColor);
                        setValue('themeConfig.secondaryColor', palette.colors.secondaryColor);
                        setValue('themeConfig.accentColor', palette.colors.accentColor);
                        setValue('themeConfig.backgroundColor', palette.colors.backgroundColor);
                        setSelectedPalette(palette.name);
                        setLivePreview(true);
                      }}
                      className={`rounded-lg border p-3 text-left transition hover:border-primary/60 ${isActive ? 'border-primary shadow-md' : 'border-gray-300 dark:border-zinc-600'}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {Object.entries(palette.colors).map(([key, color]) => (
                          <div key={`${palette.name}-${key}`} className="flex flex-col items-center gap-1">
                            <span
                              className="h-5 w-5 rounded-full border"
                              style={{ backgroundColor: color }}
                              title={`${key}: ${color}`}
                            />
                            <span className="text-[10px] text-gray-600 dark:text-gray-400">{color}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        {palette.name}
                        {isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-white">Seleccionada</span>}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Click para aplicar y luego ajusta los colores arriba si quieres personalizar.</p>
                    </button>
                  );
                })}
              </div>

              {/* Imagen de portada */}
              <Controller
                control={control}
                name="themeConfig.coverImageUrl"
                render={({ field }) => (
                  <ImageUpload
                    label="Imagen de portada"
                    description="Imagen principal que se mostrará en la invitación pública"
                    currentImageUrl={field.value}
                    onImageUploaded={(url) => field.onChange(url)}
                    onImageDeleted={() => field.onChange('')}
                    imageType="cover"
                    partyId={p_uuid}
                    aspectRatio="16/9"
                  />
                )}
              />

              {/* Banner de login */}
              <Controller
                control={control}
                name="themeConfig.loginBannerUrl"
                render={({ field }) => (
                  <ImageUpload
                    label="Banner de login"
                    description="Imagen que se mostrará en la página de inicio de sesión"
                    currentImageUrl={field.value}
                    onImageUploaded={(url) => field.onChange(url)}
                    onImageDeleted={() => field.onChange('')}
                    imageType="banner"
                    partyId={p_uuid}
                    aspectRatio="21/9"
                  />
                )}
              />

              {/* Galería de imágenes */}
              <Controller
                control={control}
                name="themeConfig.homeGalleryImages"
                render={({ field }) => (
                  <GalleryUpload
                    label="Galería de imágenes"
                    description="Imágenes que se mostrarán en la galería de la invitación"
                    currentImages={field.value || []}
                    onImagesUpdated={(urls) => {
                      console.log('📝 Actualizando galería de imágenes:', urls.length, 'imágenes');
                      field.onChange(urls);
                    }}
                    imageType="gallery"
                    partyId={p_uuid}
                    maxImages={10}
                  />
                )}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Título de bienvenida"
                  placeholder="¡Bienvenido a la fiesta!"
                  {...register('themeConfig.customTexts.welcomeTitle' as const)}
                />
                <Input
                  label="Subtítulo"
                  placeholder="Será un día especial"
                  {...register('themeConfig.customTexts.welcomeSubtitle' as const)}
                />
                <Textarea
                  label="Texto adicional"
                  placeholder="Notas o instrucciones"
                  {...register('themeConfig.customTexts.extraInfo' as const)}
                />
              </div>

              {/* Filtrado de regalos por categoría */}
              <Controller
                control={control}
                name="themeConfig.filterGiftsByCategory"
                render={({ field }) => (
                  <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <input
                      type="checkbox"
                      id="filterGiftsByCategory"
                      checked={field.value || false}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="filterGiftsByCategory" className="flex-1 cursor-pointer">
                      <span className="block text-sm font-semibold text-gray-900">
                        Filtrar regalos por categoría según respuestas
                      </span>
                      <span className="block text-xs text-gray-600 mt-1">
                        Si está habilitado, los invitados verán únicamente los regalos de la categoría que coincida con sus respuestas. 
                        Por ejemplo, si responden "Mago" en las preguntas, solo verán regalos de la categoría "Mago".
                      </span>
                    </label>
                  </div>
                )}
              />

              <div
                className="rounded-2xl border border-gray-300 dark:border-zinc-600 overflow-hidden"
                style={{
                  background: themePreview.backgroundColor || '#F8FAFC',
                  borderColor: themePreview.primaryColor || '#7C3AED',
                }}
              >
                {themePreview.coverImageUrl && (
                  <div className="h-40 w-full overflow-hidden">
                    <img src={themePreview.coverImageUrl} alt="Portada" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="p-6 space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: themePreview.secondaryColor || '#E0E7FF', color: themePreview.primaryColor || '#312E81' }}>
                    Invitación
                  </div>
                  <h3 className="text-2xl font-bold" style={{ color: themePreview.primaryColor || '#7C3AED' }}>
                    {themePreview.customTexts?.welcomeTitle || 'Título de bienvenida'}
                  </h3>
                  <p className="text-sm" style={{ color: themePreview.accentColor || '#0EA5E9' }}>
                    {themePreview.customTexts?.welcomeSubtitle || 'Subtítulo de ejemplo'}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100" style={{ color: '#0f172a' }}>
                    {themePreview.customTexts?.extraInfo || 'Comparte indicaciones o un mensaje especial para tus invitados.'}
                  </p>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" style={{ background: themePreview.primaryColor || '#7C3AED', borderColor: themePreview.primaryColor || '#7C3AED' }}>
                      Confirmar asistencia
                    </Button>
                    <Button type="button" variant="outline" style={{ borderColor: themePreview.accentColor || '#0EA5E9', color: themePreview.accentColor || '#0EA5E9' }}>
                      Ver regalos
                    </Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ),
      },
      {
        id: 'advanced',
        title: 'Configuración avanzada',
        description: 'Fotos de invitados y acompañantes',
        content: (
          <Card>
            <CardBody className="space-y-6">
              {/* Fotos */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Fotos del evento</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Configura cuántas fotos puede subir cada invitado.</p>
                <Input
                  label="Máximo de fotos por invitado"
                  type="number"
                  {...register('maxPhotosPerPerson', { valueAsNumber: true })}
                  error={errors.maxPhotosPerPerson?.message}
                  helperText="Entre 1 y 10 fotos (por defecto: 5)"
                />
              </div>

              {/* Acompañantes */}
              <div className="border-t border-gray-200 dark:border-zinc-700 pt-5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Acompañantes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Permite que los invitados traigan acompañantes al evento.</p>

                <Controller
                  control={control}
                  name="allowCompanions"
                  render={({ field }) => (
                    <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg mb-4">
                      <input
                        type="checkbox"
                        id="allowCompanions"
                        checked={field.value || false}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <label htmlFor="allowCompanions" className="flex-1 cursor-pointer">
                        <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                          Permitir acompañantes
                        </span>
                        <span className="block text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Los invitados podrán registrar el nombre de sus acompañantes al asignar asientos en el plano del salón.
                        </span>
                      </label>
                    </div>
                  )}
                />

                {watch('allowCompanions') && (
                  <Input
                    label="Máximo de acompañantes por invitado"
                    type="number"
                    {...register('maxCompanionsPerGuest', { valueAsNumber: true })}
                    error={errors.maxCompanionsPerGuest?.message}
                    helperText="Entre 1 y 5 acompañantes (por defecto: 1)"
                  />
                )}
              </div>
            </CardBody>
          </Card>
        ),
      },
    ],
    [appendGift, appendQuestion, control, errors, giftsFields.length, livePreview, paletteOptions, questionsFields.length, register, selectedPalette, setValue, themePreview, watch]
  );

  const submitForm = handleSubmit(onSubmit);

  const handleMultiStepSubmit = async (_currentStep?: number) => {
    await submitForm();
  };

  if (partyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">Cargando editor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-error">No se pudo cargar la fiesta.</p>
      </div>
    );
  }

  return (
    <div className="container-app py-10 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Editar fiesta</h1>
        <p className="text-gray-600 dark:text-gray-300">Actualiza datos, preguntas, regalos y tema.</p>
      </motion.div>

      {/* Sección de invitación pública */}
      <PublicInvitationActions 
        party_uuid={p_uuid} 
        partyStatus={watch('status')} 
      />

      <form onSubmit={submitForm}>
        <MultiStepForm
          steps={steps}
          onSubmit={handleMultiStepSubmit}
          showProgress
          allowSkip
          isLoading={isSubmitting}
        />
        <CardFooter className="flex justify-end gap-3 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </CardFooter>
      </form>

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.type === 'remove-question' ? 'Eliminar pregunta' : 'Eliminar regalo'}
        message={`¿Está seguro que desea eliminar "${confirmDialog.item}"?`}
        description="Esta acción no se puede deshacer"
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDangerous={true}
        onConfirm={async () => {
          if (confirmDialog.type === 'remove-question') {
            removeQuestion(confirmDialog.index);
            addNotification({
              type: 'success',
              title: 'Pregunta eliminada',
              message: 'La pregunta ha sido removida correctamente',
              duration: 3000,
            });
          } else {
            removeGift(confirmDialog.index);
            addNotification({
              type: 'success',
              title: 'Regalo eliminado',
              message: 'El regalo ha sido removido correctamente',
              duration: 3000,
            });
          }
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </div>
  );
};
