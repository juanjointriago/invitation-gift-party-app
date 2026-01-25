import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { usePartyLoader } from '../../hooks/usePartyLoader';
import { PartyService } from '../../services/party.service';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import type { Party } from '../../types/party';

const questionSchema = z.object({
  id: z.string(),
  question: z.string().min(1, 'La pregunta es requerida'),
  type: z.enum(['text', 'single-choice', 'multi-choice']),
  options: z.array(z.string()).optional(),
  required: z.boolean(),
  order: z.number().optional(),
});

const giftSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  category: z.string().optional(),
  maxQuantity: z.number().min(1, 'Mínimo 1'),
  remainingQuantity: z.number(),
  imageUrl: z.string().optional(),
  order: z.number().optional(),
});

const partyEditorSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  date: z.number(),
  location: z.string().min(1, 'La ubicación es requerida'),
  questions: z.array(questionSchema),
  giftList: z.array(giftSchema),
});

type PartyEditorFormValues = z.infer<typeof partyEditorSchema>;

export const PartyEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { partyUuid } = useParams();
  const [searchParams] = useSearchParams();
  const p_uuid = searchParams.get('p_uuid') || partyUuid || '';

  const { fullParty, loading: partyLoading } = usePartyLoader(p_uuid);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PartyEditorFormValues>({
    resolver: zodResolver(partyEditorSchema),
    defaultValues: {
      title: '',
      description: '',
      date: Date.now(),
      location: '',
      questions: [],
      giftList: [],
    },
  });

  const {
    fields: questionsFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control,
    name: 'questions',
  });

  const {
    fields: giftsFields,
    append: appendGift,
    remove: removeGift,
  } = useFieldArray({
    control,
    name: 'giftList',
  });

  useEffect(() => {
    if (fullParty) {
      reset({
        title: fullParty.title,
        description: fullParty.description,
        date: fullParty.date,
        location: fullParty.location,
        questions: fullParty.questions || [],
        giftList: fullParty.giftList || [],
      });
    }
  }, [fullParty, reset]);

  const onSubmit = async (data: PartyEditorFormValues) => {
    if (!p_uuid) return;
    setSubmitting(true);
    try {
      await PartyService.updateParty(p_uuid, {
        ...data,
        updatedAt: Date.now(),
      } as Partial<Party>);
      toast.success('Fiesta actualizada correctamente');
      navigate(`/host/party/${p_uuid}?p_uuid=${p_uuid}`);
    } catch (err) {
      toast.error('Error al guardar. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (partyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-text-muted">Cargando editor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-text">Editar fiesta</h1>
        <p className="text-text-muted">Personaliza preguntas, regalos y detalles de tu fiesta.</p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información básica */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-text">Información básica</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label="Título"
              placeholder="Ej: Fiesta de cumpleaños"
              {...register('title')}
              error={errors.title?.message}
            />
            <Textarea
              label="Descripción"
              placeholder="Cuéntanos sobre tu fiesta..."
              {...register('description')}
              error={errors.description?.message}
            />
            <Input
              label="Ubicación"
              placeholder="Ej: Calle Principal 123, Ciudad"
              {...register('location')}
              error={errors.location?.message}
            />
            <Input
              label="Fecha"
              type="datetime-local"
              {...register('date', { valueAsNumber: true })}
              error={errors.date?.message}
            />
          </CardBody>
        </Card>

        {/* Preguntas */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-text">Preguntas para invitados</h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                appendQuestion({
                  id: `q-${Date.now()}`,
                  question: '',
                  type: 'text',
                  required: false,
                })
              }
              type="button"
            >
              + Pregunta
            </Button>
          </CardHeader>
          <CardBody className="space-y-4">
            {questionsFields.length === 0 ? (
              <p className="text-text-muted text-sm">Sin preguntas aún. Añade una para comenzar.</p>
            ) : (
              questionsFields.map((field, idx) => (
                <div key={field.id} className="border border-border p-4 rounded-md space-y-3">
                  <Input
                    label={`Pregunta ${idx + 1}`}
                    placeholder="¿Cuál es tu pregunta?"
                    {...register(`questions.${idx}.question`)}
                    error={errors.questions?.[idx]?.question?.message}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      {...register(`questions.${idx}.type`)}
                      className="border border-border rounded-md px-3 py-2 text-sm"
                    >
                      <option value="text">Texto libre</option>
                      <option value="single-choice">Opción única</option>
                      <option value="multi-choice">Múltiple opción</option>
                    </select>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" {...register(`questions.${idx}.required`)} />
                      <span className="text-sm text-text">Requerida</span>
                    </label>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => removeQuestion(idx)} type="button">
                    Eliminar
                  </Button>
                </div>
              ))
            )}
          </CardBody>
        </Card>

        {/* Regalos */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-text">Lista de regalos</h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                appendGift({
                  id: `g-${Date.now()}`,
                  name: '',
                  maxQuantity: 1,
                  remainingQuantity: 1,
                })
              }
              type="button"
            >
              + Regalo
            </Button>
          </CardHeader>
          <CardBody className="space-y-4">
            {giftsFields.length === 0 ? (
              <p className="text-text-muted text-sm">Sin regalos aún. Añade uno para comenzar.</p>
            ) : (
              giftsFields.map((field, idx) => (
                <div key={field.id} className="border border-border p-4 rounded-md space-y-3">
                  <Input
                    label={`Nombre del regalo ${idx + 1}`}
                    placeholder="Ej: Pañitos húmedos"
                    {...register(`giftList.${idx}.name`)}
                    error={errors.giftList?.[idx]?.name?.message}
                  />
                  <Textarea
                    label="Descripción"
                    placeholder="Describe el regalo..."
                    {...register(`giftList.${idx}.description`)}
                  />
                  <Input
                    label="Cantidad máxima"
                    type="number"
                    {...register(`giftList.${idx}.maxQuantity`, { valueAsNumber: true })}
                    error={errors.giftList?.[idx]?.maxQuantity?.message}
                  />
                  <Button size="sm" variant="ghost" onClick={() => removeGift(idx)} type="button">
                    Eliminar
                  </Button>
                </div>
              ))
            )}
          </CardBody>
        </Card>

        <CardFooter className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate(`/host/party/${p_uuid}?p_uuid=${p_uuid}`)} type="button">
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
};
