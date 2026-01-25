import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

const resetSchema = z.object({
  email: z.string().email('Correo inválido'),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const p_uuid = searchParams.get('p_uuid');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ResetFormValues) => {
    // TODO: integrar con AuthService.resetPassword
    console.log('Reset password for', data.email);
    navigate(`/auth/login${p_uuid ? `?p_uuid=${p_uuid}` : ''}`);
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
          <Button type="submit" fullWidth>
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
