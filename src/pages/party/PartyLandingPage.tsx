import React, { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card, CardBody } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { SkeletonLoader } from '../../components/ui/skeleton-loader';
import { usePartyContextStore } from '../../stores/partyContext.store';
import { useAuthStore } from '../../stores/auth.store';
import { usePartyLoader } from '../../hooks/usePartyLoader';
import { Calendar, MapPin, Gift, Sparkles, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const PartyLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { partyUuid } = useParams();
  const [searchParams] = useSearchParams();
  const p_uuid = searchParams.get('p_uuid') || partyUuid || '';
  const isNewGuest = searchParams.get('new') === 'true';
  
  const setPartyUuid = usePartyContextStore((s) => s.setPartyUuid);
  const setPartyData = usePartyContextStore((s) => s.setPartyData);
  const user = useAuthStore((s) => s.user);
  const { fullParty, loading, error } = usePartyLoader(p_uuid);

  // Guardar en contexto cuando se carga la fiesta
  useEffect(() => {
    if (fullParty) {
      setPartyUuid(p_uuid);
      setPartyData({
        party_uuid: fullParty.party_uuid,
        title: fullParty.title,
        description: fullParty.description,
        date: fullParty.date,
        location: fullParty.location,
        themeConfig: fullParty.themeConfig,
        status: fullParty.status,
      });
    }
  }, [fullParty, p_uuid, setPartyUuid, setPartyData]);

  const party = fullParty;

  const formattedDate = party?.date
    ? new Date(party.date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const goToAuth = (path: 'login' | 'register') => {
    navigate(`/auth/${path}?p_uuid=${p_uuid}`);
  };

  const cover =
    party?.themeConfig?.coverImageUrl ||
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=60';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SkeletonLoader type="card" count={1} />
      </div>
    );
  }

  if (error && !fullParty) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-error/5 via-background to-accent/5 dark:from-gray-900 dark:via-gray-800 dark:to-red-950/30 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="shadow-xl">
            <CardBody className="space-y-6 text-center py-12">
              <div className="text-6xl">😕</div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-text">Fiesta no encontrada</h1>
                <p className="text-text-muted">{error}</p>
              </div>
              <div className="space-y-3 pt-6">
                <Button
                  fullWidth
                  variant="primary"
                  onClick={() => navigate('/')}
                  className="h-11"
                >
                  🏠 Ir a inicio
                </Button>
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => navigate('/auth/login')}
                  className="h-11"
                >
                  Iniciar sesión
                </Button>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-text-muted">
                  Si crees que esto es un error, verifica el enlace de invitación
                </p>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-accent/5 dark:from-gray-900 dark:via-gray-800 dark:to-purple-950/30">
      <div className="container-app py-10">
        <motion.div
          className="grid md:grid-cols-2 gap-8 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Content */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Tag */}
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent animate-pulse" />
              <Badge variant="primary" className="text-xs">
                Invitación especial
              </Badge>
            </div>

            {/* Título Principal */}
            <div className="space-y-2">
              <h1 className="text-5xl font-bold text-text">
                {party?.title || '¡Te invitamos a celebrar!'}
              </h1>
              <p className="text-xl text-accent font-semibold">
                {party?.themeConfig?.customTexts?.welcomeSubtitle ||
                  'Será una fiesta inolvidable'}
              </p>
            </div>

            {/* Descripción */}
            <p className="text-lg text-text-muted leading-relaxed">
              {party?.description ||
                'Ingresa para confirmar tu asistencia, responder preguntas y elegir un regalo de la lista.'}
            </p>

            {/* Detalles de Fiesta */}
            <div className="space-y-3 py-4 border-y border-border">
              {formattedDate && (
                <div className="flex items-center gap-3 text-text">
                  <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="capitalize">{formattedDate}</span>
                </div>
              )}
              {party?.location && (
                <div className="flex items-center gap-3 text-text">
                  <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>{party.location}</span>
                </div>
              )}
              {party?.giftList && party.giftList.length > 0 && (
                <div className="flex items-center gap-3 text-text">
                  <Gift className="w-5 h-5 text-secondary flex-shrink-0" />
                  <span>{party.giftList.length} regalos para elegir</span>
                </div>
              )}
            </div>

            {/* Success Message for New Guest */}
            {isNewGuest && user && (
              <motion.div
                variants={itemVariants}
                className="bg-success/10 border border-success/30 rounded-lg p-4 flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-success">¡Bienvenido {user.name}!</p>
                  <p className="text-sm text-success/80">Tu cuenta ha sido creada exitosamente. Ahora puedes confirmar tu asistencia y elegir un regalo.</p>
                </div>
              </motion.div>
            )}

            {/* CTA Buttons */}
            <div className="space-y-3 pt-4">
              <motion.div
                className="flex flex-col sm:flex-row gap-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {!user && (
                  <>
                    <motion.div variants={itemVariants} className="flex-1">
                      <Button
                        size="lg"
                        variant="primary"
                        onClick={() => goToAuth('login')}
                        disabled={loading}
                        fullWidth
                        className="h-12 text-base font-semibold"
                      >
                        {loading ? 'Cargando...' : '🎉 Iniciar sesión'}
                      </Button>
                    </motion.div>
                    <motion.div variants={itemVariants} className="flex-1">
                      <Button
                        size="lg"
                        variant="secondary"
                        onClick={() => goToAuth('register')}
                        disabled={loading}
                        fullWidth
                        className="h-12 text-base font-semibold"
                      >
                        {loading ? 'Cargando...' : 'Crear cuenta'}
                      </Button>
                    </motion.div>
                  </>
                )}
                {user && (
                  <motion.div variants={itemVariants} className="flex-1">
                    <Button
                      size="lg"
                      variant="primary"
                      onClick={() => navigate(`/party/${p_uuid}/questions`)}
                      disabled={loading}
                      fullWidth
                      className="h-12 text-base font-semibold"
                    >
                      {loading ? 'Cargando...' : '📝 Responder Preguntas'}
                    </Button>
                  </motion.div>
                )}
                {user && (
                  <motion.div variants={itemVariants} className="flex-1">
                    <Button
                      size="lg"
                      variant="secondary"
                      onClick={() => navigate(`/party/${p_uuid}/gifts`)}
                      disabled={loading}
                      fullWidth
                      className="h-12 text-base font-semibold"
                    >
                      {loading ? 'Cargando...' : '🎁 Elegir Regalo'}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
              {!isNewGuest && (
                <p className="text-xs text-text-muted text-center">
                  ¿Ya tienes cuenta? Inicia sesión para continuar
                </p>
              )}
            </div>

            {/* Party Code */}
            {p_uuid && (
              <motion.div
                variants={itemVariants}
                className="bg-primary/5 border border-primary/20 rounded-lg p-3"
              >
                <p className="text-xs text-text-muted mb-1">Código de acceso a la fiesta</p>
                <p className="text-sm font-mono font-bold text-primary cursor-pointer hover:text-primary/80 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(p_uuid);
                    toast.success('Código copiado al portapapeles');
                  }}
                >
                  {p_uuid}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Right - Image Card */}
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-0 overflow-hidden shadow-2xl">
                {/* Image Container */}
                <div className="relative h-80 bg-gray-200 overflow-hidden">
                  <img
                    src={cover}
                    alt="Portada de la fiesta"
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent dark:from-black/60 dark:to-transparent" />
                </div>

                {/* Info Card */}
                <CardBody className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-text line-clamp-2">
                      {party?.title || 'Fiesta especial'}
                    </h2>
                  </div>

                  {party?.description && (
                    <p className="text-sm text-text-muted line-clamp-3">
                      {party.description}
                    </p>
                  )}

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                    <div className="text-center">
                      <p className="text-lg font-bold text-primary">
                        {party?.giftList?.length || 0}
                      </p>
                      <p className="text-xs text-text-muted">Regalos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-accent">
                        {party?.questions?.length || 0}
                      </p>
                      <p className="text-xs text-text-muted">Preguntas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-secondary">1</p>
                      <p className="text-xs text-text-muted">Minuto</p>
                    </div>
                  </div>

                  <p className="text-xs text-text-muted italic">
                    ✨ El anfitrión te ha invitado especialmente a esta fiesta
                  </p>
                </CardBody>
              </Card>

              {/* Decorative Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-8 -right-8 w-24 h-24 bg-accent/10 rounded-full blur-3xl"
              />
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl"
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-text-muted">
            Powered by <span className="font-semibold text-primary">PartyGifts</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
