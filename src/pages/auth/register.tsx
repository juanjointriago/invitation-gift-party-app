import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../../stores/auth.store';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import type { CreateUserData } from '../../interfaces/users.interface';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Ingresa tu nombre'),
    lastName: z.string().min(2, 'Ingresa tu apellido'),
    email: z.string().email('Correo inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string().min(6, 'Mínimo 6 caracteres'),
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
    clearError();
    const payload: CreateUserData = {
      name: data.name,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      role: 'guest',
      phone: '',
      address: '',
      cc: '',
      city: '',
      country: '',
      isActive: true,
    };

    await registerUser(payload);
    if (p_uuid) {
      navigate(`/party/${p_uuid}`);
    } else {
      navigate('/');
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
