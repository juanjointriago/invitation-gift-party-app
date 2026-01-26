import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../../stores/auth.store';
import { useNotificationStore } from '../../stores/notification.store';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es requerido')
    .email('Correo inválido')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(6, 'La contraseña debe tener mínimo 6 caracteres')
    .max(100, 'La contraseña es demasiado larga')
    .refine((val) => val.trim().length >= 6, {
      message: 'La contraseña no puede ser solo espacios',
    }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const p_uuid = searchParams.get('p_uuid');
  const { login, loading, error, clearError } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    clearError();
    
    try {
      await login({ email: data.email, password: data.password });
      
      addNotification({
        type: 'success',
        message: '¡Bienvenido!',
        description: 'Sesión iniciada correctamente',
      });
      
      // Pequeño delay para mostrar la notificación antes de navegar
      setTimeout(() => {
        if (p_uuid) {
          navigate(`/party/${p_uuid}`);
        } else {
          navigate('/');
        }
      }, 500);
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Error al iniciar sesión',
        description: err instanceof Error ? err.message : 'Credenciales inválidas',
      });
    }
  };

  return (
    <Card className="shadow-custom-lg">
      <CardHeader>
        <h2 className="text-2xl font-bold text-primary">Iniciar sesión</h2>
        <p className="text-text-muted text-sm mt-1">Accede a tu cuenta para gestionar tus fiestas</p>
      </CardHeader>
      <CardBody className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Correo"
            type="email"
            placeholder="tu@email.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          {error && <p className="text-error text-sm">{error}</p>}
          <Button type="submit" fullWidth isLoading={loading}>
            Entrar
          </Button>
        </form>
        <div className="text-sm text-text-muted flex flex-col gap-2">
          <button
            className="text-primary text-left hover:underline"
            onClick={() => navigate(`/auth/reset-password${p_uuid ? `?p_uuid=${p_uuid}` : ''}`)}
          >
            Olvidé mi contraseña
          </button>
          <div>
            ¿No tienes cuenta?{' '}
            <button
              className="text-primary hover:underline"
              onClick={() => navigate(`/auth/register${p_uuid ? `?p_uuid=${p_uuid}` : ''}`)}
            >
              Crea una cuenta
            </button>
          </div>
        </div>
      </CardBody>
      <CardFooter className="flex justify-center">
        {p_uuid && (
          <p className="text-xs text-text-muted">Entraste desde una invitación · p_uuid: {p_uuid}</p>
        )}
      </CardFooter>
    </Card>
  );
};
