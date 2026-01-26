import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { AuthService } from '../../services/auth.service';
import { useNotificationStore } from '../../stores/notification.store';

const resetSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es requerido')
    .email('Correo inválido')
    .trim()
    .toLowerCase()
    .refine((val) => val.includes('@') && val.includes('.'), {
      message: 'El correo debe tener un formato válido',
    }),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const p_uuid = searchParams.get('p_uuid');
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotificationStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ResetFormValues) => {
    setLoading(true);
    
    try {
      await AuthService.resetPassword(data.email);
      
      addNotification({
        type: 'success',
        message: 'Correo enviado',
        description: 'Revisa tu correo para restablecer tu contraseña',
      });
      
      setTimeout(() => {
        navigate(`/auth/login${p_uuid ? `?p_uuid=${p_uuid}` : ''}`);
      }, 2000);
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Error al enviar correo',
        description: err instanceof Error ? err.message : 'Intenta nuevamente',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-custom-lg">
      <CardHeader>
        <h2 className="text-2xl font-bold text-primary">Recuperar contraseña</h2>
        <p className="text-text-muted text-sm mt-1">Ingresa tu correo y te enviaremos un enlace</p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Correo"
            type="email"
            placeholder="tu@email.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" fullWidth isLoading={loading}>
            Enviar enlace
          </Button>
        </form>
      </CardBody>
      <CardFooter className="flex justify-center">
        <button
          className="text-primary hover:underline text-sm"
          onClick={() => navigate(`/auth/login${p_uuid ? `?p_uuid=${p_uuid}` : ''}`)}
        >
          Volver a login
        </button>
      </CardFooter>
    </Card>
  );
};
