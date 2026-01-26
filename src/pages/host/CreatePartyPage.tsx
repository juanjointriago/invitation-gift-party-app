import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { PartyService } from '../../services/party.service';
import { useAuthStore } from '../../stores/auth.store';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const partyCreationSchema = z.object({
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
    .min(10, 'La descripción debe tener mínimo 10 caracteres')
    .max(1000, 'La descripción es demasiado larga (máximo 1000 caracteres)')
    .trim()
    .refine((val) => val.trim().length >= 10, {
      message: 'La descripción no puede ser solo espacios',
    }),
  date: z.string().min(1, 'La fecha es requerida'),
  location: z
    .string()
    .min(3, 'La ubicación debe tener mínimo 3 caracteres')
    .max(200, 'La ubicación es demasiado larga (máximo 200 caracteres)')
    .trim()
    .refine((val) => val.trim().length >= 3, {
      message: 'La ubicación no puede ser solo espacios',
    }),
});

type PartyCreationFormValues = z.infer<typeof partyCreationSchema>;

export const CreatePartyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PartyCreationFormValues>({
    resolver: zodResolver(partyCreationSchema),
    defaultValues: {
      title: '',
      description: '',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Formato datetime-local
      location: '',
    },
  });

  const onSubmit = async (data: PartyCreationFormValues) => {
    if (!user?.id) {
      toast.error('Debes estar autenticado');
      return;
    }

    setSubmitting(true);
    try {
      // Convertir fecha string a timestamp
      const dateTimestamp = new Date(data.date).getTime();
      
      const newParty = await PartyService.createParty({
        host_user_id: user.id,
        title: data.title,
        description: data.description,
        date: dateTimestamp,
        location: data.location,
        questions: [],
        giftList: [],
        status: 'draft',
        isActive: true,
      });

      toast.success('Fiesta creada correctamente');
      reset();
      navigate(`/host/party/${newParty.party_uuid}/editor?p_uuid=${newParty.party_uuid}`);
    } catch (err) {
      console.error('Error creating party:', err);
      toast.error('Error al crear la fiesta. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-bg py-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="container-app max-w-2xl"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">Crear nueva fiesta</h1>
          <p className="text-text-muted mt-2">Llena los detalles básicos y personaliza después.</p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-text">Información de la fiesta</h2>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardBody className="space-y-4">
              <Input
                label="Título de la fiesta"
                placeholder="Ej: Fiesta de cumpleaños de María"
                {...register('title')}
                error={errors.title?.message}
              />

              <Textarea
                label="Descripción"
                placeholder="Cuéntanos sobre tu fiesta, qué se celebra, dónde es, etc."
                {...register('description')}
                error={errors.description?.message}
              />

              <Input
                label="Fecha y hora"
                type="datetime-local"
                {...register('date')}
                error={errors.date?.message}
              />

              <Input
                label="Ubicación"
                placeholder="Ej: Calle Principal 123, Ciudad"
                {...register('location')}
                error={errors.location?.message}
              />

              <div className="bg-info/10 border border-info p-4 rounded-md">
                <p className="text-sm text-info">
                  💡 Después de crear la fiesta, podrás añadir preguntas, regalos y personalizar el tema.
                </p>
              </div>
            </CardBody>
            <CardFooter className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/host')}
                type="button"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creando...' : 'Crear fiesta'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};
