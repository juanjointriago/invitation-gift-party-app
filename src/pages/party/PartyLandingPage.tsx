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
import { isMapUrl, generateMapLinks } from '../../utils/map.utils';
import { AuthService } from '../../services/auth.service';

export const PartyLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { partyUuid } = useParams();
  const [searchParams] = useSearchParams();
  const p_uuid = searchParams.get('p_uuid') || partyUuid || '';
  const isNewGuest = searchParams.get('new') === 'true';
  
  const setPartyUuid = usePartyContextStore((s) => s.setPartyUuid);
  const setPartyData = usePartyContextStore((s) => s.setPartyData);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
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

  const handleGoogleSignIn = async () => {
    try {
      toast.loading('Iniciando sesión con Google...');
      const result = await AuthService.googleSignUpLogin();
      
      toast.dismiss();
      
      if (result.isAuthenticated && result.user) {
        setUser(result.user);
        toast.success(`¡Bienvenido ${result.user.name}!`);
        // Redirigir a las preguntas de la fiesta
        navigate(`/party/${p_uuid}/questions?p_uuid=${p_uuid}&new=true`);
      } else {
        toast.error(result.message || 'No se pudo iniciar sesión con Google');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error al iniciar sesión con Google:', error);
      toast.error('Error al iniciar sesión con Google');
    }
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
                <>
                  {isMapUrl(party.location) ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-text">
                        <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
                        <span className="text-sm font-medium">Ubicación:</span>
                      </div>
                      {(() => {
                        const mapLinks = generateMapLinks(party.location);
                        return mapLinks ? (
                          <div className="flex flex-wrap gap-2 pl-8">
                            <a
                              href={mapLinks.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:scale-105 hover:shadow-md"
                              style={{ backgroundColor: '#4285F4' }}
                            >
                              <span>🗺️</span>
                              <span>Google Maps</span>
                            </a>
                            <a
                              href={mapLinks.wazeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:scale-105 hover:shadow-md"
                              style={{ backgroundColor: '#33CCFF' }}
                            >
                              <span>🚗</span>
                              <span>Waze</span>
                            </a>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-text">
                      <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
                      <span>{party.location}</span>
                    </div>
                  )}
                </>
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
                  <>
                    <motion.div variants={itemVariants} className="flex-1">
                      <Button
                        size="lg"
                        variant="primary"
                        onClick={() => navigate(`/party/${p_uuid}/questions?p_uuid=${p_uuid}`)}
                        disabled={loading}
                        fullWidth
                        className="h-12 text-base font-semibold"
                      >
                        {loading ? 'Cargando...' : '📝 Responder Preguntas'}
                      </Button>
                    </motion.div>
                    <motion.div variants={itemVariants} className="flex-1">
                      <Button
                        size="lg"
                        variant="secondary"
                        onClick={() => navigate(`/party/${p_uuid}/gifts?p_uuid=${p_uuid}`)}
                        disabled={loading}
                        fullWidth
                        className="h-12 text-base font-semibold"
                      >
                        {loading ? 'Cargando...' : '🎁 Elegir Regalo'}
                      </Button>
                    </motion.div>
                  </>
                )}
              </motion.div>

              {/* Botón de Google Sign In */}
              {!user && (
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="relative"
                >
                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-gray-300 dark:border-gray-600 w-full absolute"></div>
                    <span className="relative bg-white dark:bg-gray-900 px-4 text-sm text-gray-500 dark:text-gray-400">
                      o continúa con
                    </span>
                  </div>
                  
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    fullWidth
                    className="h-12 text-base font-semibold mt-4 border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
                </motion.div>
              )}

              {!user && !isNewGuest && (
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
