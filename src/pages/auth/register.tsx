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
import { PartyAssistanceService } from '../../services/party-assistance.service';
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
  const { register: registerUser, loginWithGoogle, loading, error, clearError } = useAuthStore();
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
        
        // Si hay p_uuid, crear registro de asistencia inicial
        if (p_uuid && result.user?.id) {
          try {
            console.debug('[REGISTER] Creando asistencia inicial para:', { partyUuid: p_uuid, userId: result.user.id });
            await PartyAssistanceService.createInitialAssistance(p_uuid, result.user.id);
            console.debug('[REGISTER] Asistencia inicial creada exitosamente');
          } catch (assistanceError) {
            console.warn('[REGISTER] Error creando asistencia inicial:', assistanceError);
            // No lanzar error, solo loguearlo
          }
        }
        
        // Pequeño delay para mostrar la notificación antes de navegar
        setTimeout(() => {
          console.debug('[REGISTER] Navegando...');
          if (p_uuid) {
            navigate(`/party/${p_uuid}?new=true`);
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

  const handleGoogleSignIn = async () => {
    clearError();
    
    try {
      await loginWithGoogle();
      
      addNotification({
        type: 'success',
        message: '¡Bienvenido!',
        description: 'Cuenta creada/sesión iniciada con Google correctamente',
      });
      
      // Si hay p_uuid, navegar a la fiesta
      setTimeout(() => {
        if (p_uuid) {
          navigate(`/party/${p_uuid}?new=true`);
        } else {
          navigate('/');
        }
      }, 500);
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Error al continuar con Google',
        description: err instanceof Error ? err.message : 'No se pudo completar la autenticación',
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

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-text-muted">O continúa con</span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <Button
          type="button"
          variant="outline"
          fullWidth
          isLoading={loading}
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuar con Google
        </Button>

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
