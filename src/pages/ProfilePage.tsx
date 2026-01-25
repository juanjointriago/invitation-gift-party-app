import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardBody, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuthStore } from '../stores/auth.store';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [editing, setEditing] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  useEffect(() => {
    reset({
      name: user?.name || '',
      email: user?.email || '',
    });
  }, [user, reset]);

  const onSubmit = async () => {
    // TODO: Implementar actualización de perfil
    toast.success('Perfil actualizado');
    setEditing(false);
  };

  const handleLogout = async () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="container-app max-w-2xl"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">Mi perfil</h1>
          <p className="text-text-muted mt-2">Administra tu información y preferencias.</p>
        </div>

        <div className="space-y-6">
          {/* Información personal */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-text">Información personal</h2>
              <Button
                size="sm"
                variant={editing ? 'outline' : 'primary'}
                onClick={() => setEditing(!editing)}
              >
                {editing ? 'Cancelar' : 'Editar'}
              </Button>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardBody className="space-y-4">
                <Input
                  label="Nombre"
                  placeholder="Tu nombre completo"
                  disabled={!editing}
                  {...register('name')}
                />
                <Input
                  label="Email"
                  placeholder="tu@email.com"
                  disabled={!editing}
                  {...register('email')}
                />
              </CardBody>
              {editing && (
                <CardFooter className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setEditing(false)}
                    type="button"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Guardar cambios</Button>
                </CardFooter>
              )}
            </form>
          </Card>

          {/* Información de cuenta */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-text">Información de cuenta</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <p className="text-sm text-text-muted">ID de usuario</p>
                <p className="text-text font-mono text-sm">{user?.id}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Rol</p>
                <p className="text-text capitalize">
                  {user?.role === 'anfitrion' ? 'Anfitrión' : user?.role === 'administrator' ? 'Administrador' : 'Invitado'}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Fecha de registro</p>
                <p className="text-text">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : '-'}
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Acciones de seguridad */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-text">Seguridad</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <Button
                variant="outline"
                onClick={() => navigate('/auth/reset-password')}
                fullWidth
              >
                Cambiar contraseña
              </Button>
            </CardBody>
          </Card>

          {/* Cerrar sesión */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-text">Sesión</h2>
            </CardHeader>
            <CardBody>
              <p className="text-text-muted text-sm mb-4">
                Haz clic para cerrar sesión en esta cuenta.
              </p>
            </CardBody>
            <CardFooter>
              <Button
                variant="outline"
                onClick={handleLogout}
                fullWidth
              >
                Cerrar sesión
              </Button>
            </CardFooter>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};
