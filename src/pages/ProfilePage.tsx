import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardBody, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuthStore } from '../stores/auth.store';
import { useThemeStore, type ThemeMode } from '../stores/theme.store';
import { UsersService } from '../services/users.service';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, RotateCcw } from 'lucide-react';

const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener mínimo 2 caracteres')
    .max(100, 'El nombre es demasiado largo')
    .trim()
    .refine((val) => val.trim().length >= 2, { message: 'El nombre no puede ser solo espacios' })
    .refine((val) => /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(val), {
      message: 'El nombre solo puede contener letras',
    }),
  email: z.string().min(1, 'El correo es requerido').email('Correo inválido').trim().toLowerCase(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const THEME_OPTIONS: { value: ThemeMode; label: string; Icon: React.ElementType }[] = [
  { value: 'light', label: 'Claro', Icon: Sun },
  { value: 'dark', label: 'Oscuro', Icon: Moon },
  { value: 'system', label: 'Sistema', Icon: Monitor },
];

const DEFAULT_COLORS = { primary: '#8b5cf6', secondary: '#a855f7', accent: '#ec4899' };

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuthStore();
  const { theme, setTheme, applyUserBrandColors } = useThemeStore();
  const [editing, setEditing] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [brandPrimary, setBrandPrimary] = useState(user?.preferences?.brandPrimary ?? DEFAULT_COLORS.primary);
  const [brandSecondary, setBrandSecondary] = useState(user?.preferences?.brandSecondary ?? DEFAULT_COLORS.secondary);
  const [brandAccent, setBrandAccent] = useState(user?.preferences?.brandAccent ?? DEFAULT_COLORS.accent);

  const canCustomizeBrand = user?.role === 'administrator' || user?.role === 'anfitrion';

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '' },
  });

  useEffect(() => {
    reset({ name: user?.name || '', email: user?.email || '' });
    setBrandPrimary(user?.preferences?.brandPrimary ?? DEFAULT_COLORS.primary);
    setBrandSecondary(user?.preferences?.brandSecondary ?? DEFAULT_COLORS.secondary);
    setBrandAccent(user?.preferences?.brandAccent ?? DEFAULT_COLORS.accent);
  }, [user, reset]);

  // Live preview of brand colors as the user changes them
  useEffect(() => {
    if (!canCustomizeBrand) return;
    applyUserBrandColors({ primary: brandPrimary, secondary: brandSecondary, accent: brandAccent });
  }, [brandPrimary, brandSecondary, brandAccent, canCustomizeBrand, applyUserBrandColors]);

  const onSubmit = async () => {
    toast.success('Perfil actualizado');
    setEditing(false);
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    setSavingPrefs(true);
    try {
      const preferences = {
        theme,
        ...(canCustomizeBrand && {
          brandPrimary,
          brandSecondary,
          brandAccent,
        }),
      };
      await UsersService.updateUserPreferences(user.id, preferences);
      setUser({ ...user, preferences });
      toast.success('Preferencias guardadas');
    } catch {
      toast.error('Error al guardar preferencias');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleResetColors = () => {
    setBrandPrimary(DEFAULT_COLORS.primary);
    setBrandSecondary(DEFAULT_COLORS.secondary);
    setBrandAccent(DEFAULT_COLORS.accent);
  };

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/');
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
          <h1 className="text-3xl font-bold text-text">Mi perfil</h1>
          <p className="text-text-muted mt-2">Administra tu información y preferencias.</p>
        </div>

        <div className="space-y-6">
          {/* Información personal */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-text">Información personal</h2>
              <Button size="sm" variant={editing ? 'outline' : 'primary'} onClick={() => setEditing(!editing)}>
                {editing ? 'Cancelar' : 'Editar'}
              </Button>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardBody className="space-y-4">
                <Input label="Nombre" placeholder="Tu nombre completo" disabled={!editing} error={errors.name?.message} {...register('name')} />
                <Input label="Email" type="email" placeholder="tu@email.com" disabled={!editing} error={errors.email?.message} {...register('email')} />
              </CardBody>
              {editing && (
                <CardFooter className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setEditing(false)} type="button">Cancelar</Button>
                  <Button type="submit">Guardar cambios</Button>
                </CardFooter>
              )}
            </form>
          </Card>

          {/* Apariencia */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-text">Apariencia</h2>
              <p className="text-sm text-text-muted mt-1">
                Elige el modo de color de la interfaz y personaliza los colores de tu panel.
              </p>
            </CardHeader>
            <CardBody className="space-y-6">
              {/* Modo claro/oscuro */}
              <div>
                <p className="text-sm font-medium text-text mb-3">Modo de color</p>
                <div className="flex gap-2">
                  {THEME_OPTIONS.map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                        theme === value
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                          : 'border-gray-200 dark:border-zinc-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-zinc-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand colors — only for admin/host */}
              {canCustomizeBrand && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-text">Colores de marca del panel</p>
                    <button
                      onClick={handleResetColors}
                      className="flex items-center gap-1 text-xs text-text-muted hover:text-text transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restaurar
                    </button>
                  </div>
                  <p className="text-xs text-text-muted mb-4">
                    Estos colores aplican solo a tu panel de administración/anfitrión. Cada fiesta tiene sus propios colores de invitación.
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Principal', value: brandPrimary, onChange: setBrandPrimary },
                      { label: 'Secundario', value: brandSecondary, onChange: setBrandSecondary },
                      { label: 'Acento', value: brandAccent, onChange: setBrandAccent },
                    ].map(({ label, value, onChange }) => (
                      <div key={label} className="space-y-2">
                        <label className="text-xs font-medium text-text-muted">{label}</label>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-zinc-600 flex-shrink-0 cursor-pointer relative overflow-hidden shadow-sm"
                            style={{ backgroundColor: value }}
                          >
                            <input
                              type="color"
                              value={value}
                              onChange={(e) => onChange(e.target.value)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              title={`Seleccionar color ${label.toLowerCase()}`}
                            />
                          </div>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="flex-1 px-2 py-1.5 text-xs font-mono border border-gray-200 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-text focus:outline-none focus:ring-2 focus:ring-purple-400"
                            maxLength={7}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSavePreferences} isLoading={savingPrefs}>
                Guardar preferencias
              </Button>
            </CardFooter>
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

          {/* Seguridad */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-text">Seguridad</h2>
            </CardHeader>
            <CardBody>
              <Button variant="outline" onClick={() => navigate('/auth/reset-password')} fullWidth>
                Cambiar contraseña
              </Button>
            </CardBody>
          </Card>

          {/* Sesión */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-text">Sesión</h2>
            </CardHeader>
            <CardBody>
              <p className="text-text-muted text-sm mb-4">Haz clic para cerrar sesión en esta cuenta.</p>
            </CardBody>
            <CardFooter>
              <Button variant="outline" onClick={handleLogout} fullWidth>
                Cerrar sesión
              </Button>
            </CardFooter>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};
