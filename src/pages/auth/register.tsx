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
import type { CreateUserData } from '../../interfaces/users.interface';

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'El nombre debe tener mínimo 2 caracteres')
      .max(50, 'El nombre es demasiado largo')
      .trim()
      .refine((val) => val.trim().length >= 2, {
        message: 'El nombre no puede ser solo espacios',
      })
      .refine((val) => /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(val), {
        message: 'El nombre solo puede contener letras',
      }),
    lastName: z
      .string()
      .min(2, 'El apellido debe tener mínimo 2 caracteres')
      .max(50, 'El apellido es demasiado largo')
      .trim()
      .refine((val) => val.trim().length >= 2, {
        message: 'El apellido no puede ser solo espacios',
      })
      .refine((val) => /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(val), {
        message: 'El apellido solo puede contener letras',
      }),
    email: z
      .string()
      .min(1, 'El correo es requerido')
      .email('Correo inválido')
      .trim()
      .toLowerCase()
      .refine((val) => val.includes('@') && val.includes('.'), {
        message: 'El correo debe tener un formato válido',
      }),
    password: z
      .string()
      .min(6, 'La contraseña debe tener mínimo 6 caracteres')
      .max(100, 'La contraseña es demasiado larga')
      .refine((val) => val.trim().length >= 6, {
        message: 'La contraseña no puede ser solo espacios',
      })
      .refine((val) => /^(?=.*[a-zA-Z])(?=.*[0-9])/.test(val), {
        message: 'La contraseña debe contener al menos una letra y un número',
      }),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const p_uuid = searchParams.get('p_uuid');
  const { register: registerUser, loading, error, clearError } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    console.debug('[REGISTER] Iniciando registro con:', { email: data.email, name: data.name });
    clearError();
    const payload: CreateUserData = {
      name: data.name,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      role: 'guest',
      phone: '',
      city: '',
      country: '',
      isActive: true,
    };

    try {
      console.debug('[REGISTER] Llamando a registerUser...');
      const result = await registerUser(payload);
      console.debug('[REGISTER] Resultado:', { isAuthenticated: result.isAuthenticated, message: result.message });
      
      if (result.isAuthenticated) {
        console.debug('[REGISTER] Registro exitoso, mostrando notificación...');
        addNotification({
          type: 'success',
          message: '¡Cuenta creada exitosamente!',
          description: `Bienvenido ${data.name}`,
        });
        
        // Pequeño delay para mostrar la notificación antes de navegar
        setTimeout(() => {
          console.debug('[REGISTER] Navegando...');
          if (p_uuid) {
            navigate(`/party/${p_uuid}`);
          } else {
            navigate('/');
          }
        }, 500);
      } else {
        console.warn('[REGISTER] Registro fallido:', result.message);
        addNotification({
          type: 'error',
          message: 'Error al crear cuenta',
          description: result.message || 'No se pudo completar el registro',
        });
      }
    } catch (err) {
      console.error('[REGISTER] Error en catch:', err);
      addNotification({
        type: 'error',
        message: 'Error al crear cuenta',
        description: err instanceof Error ? err.message : 'Ocurrió un error inesperado',
      });
    }
  };

  return (
    <Card className="shadow-custom-lg">
      <CardHeader>
        <h2 className="text-2xl font-bold text-primary">Crear cuenta</h2>
        <p className="text-text-muted text-sm mt-1">Únete para confirmar asistencia y gestionar regalos</p>
      </CardHeader>
      <CardBody className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Input label="Nombre" error={errors.name?.message} {...register('name')} />
          <Input label="Apellido" error={errors.lastName?.message} {...register('lastName')} />
          <Input label="Correo" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Contraseña" type="password" error={errors.password?.message} {...register('password')} />
          <Input
            label="Confirmar contraseña"
            type="password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          {error && <p className="text-error text-sm">{error}</p>}
          <Button type="submit" fullWidth isLoading={loading}>
            Crear cuenta
          </Button>
        </form>
        <div className="text-sm text-text-muted">
          ¿Ya tienes cuenta?{' '}
          <button
            className="text-primary hover:underline"
            onClick={() => navigate(`/auth/login${p_uuid ? `?p_uuid=${p_uuid}` : ''}`)}
          >
            Inicia sesión
          </button>
        </div>
      </CardBody>
      <CardFooter className="flex justify-center">
        {p_uuid && <p className="text-xs text-text-muted">p_uuid: {p_uuid}</p>}
      </CardFooter>
    </Card>
  );
};
