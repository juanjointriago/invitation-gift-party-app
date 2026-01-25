import React, { useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardBody } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { SkeletonLoader, CardSkeletonLoader } from '../../components/ui/skeleton-loader';
import { usePartyContextStore } from '../../stores/partyContext.store';
import { usePartyLoader } from '../../hooks/usePartyLoader';
import { useAuthStore } from '../../stores/auth.store';
import { Calendar, MapPin, Users, Gift, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export const PartyHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { partyUuid } = useParams();
  const [searchParams] = useSearchParams();
  const p_uuid = searchParams.get('p_uuid') || partyUuid || '';
  const currentParty = usePartyContextStore((s) => s.currentParty);
  const { user } = useAuthStore();
  const { fullParty, loading, error } = usePartyLoader(p_uuid);

  const party = currentParty || fullParty;

  const cover =
    party?.themeConfig?.coverImageUrl ||
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=60';

  const galleryImages = party?.themeConfig?.homeGalleryImages || [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=60',
    'https://images.unsplash.com/photo-1464207687429-7505649dae38?auto=format&fit=crop&w=400&q=60',
    'https://images.unsplash.com/photo-1519671482677-504be0cbd517?auto=format&fit=crop&w=400&q=60',
  ];

  const formattedDate = useMemo(() => {
    const dateValue = party?.date;
    if (!dateValue) return null;
    return new Date(dateValue).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [party?.date]);

  const customTexts = party?.themeConfig?.customTexts || {
    welcomeTitle: '¡Te invitamos a celebrar!',
    welcomeSubtitle: 'Gracias por ser parte de este momento especial',
    extraInfo: 'Confirma tu asistencia y elige un regalo de nuestra lista.',
  };

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
      <div className="container-app py-10 space-y-8">
        <SkeletonLoader type="image" height="h-96" />
        <CardSkeletonLoader count={3} />
      </div>
    );
  }

  return (
    <div className="container-app py-10 space-y-8">
      {/* Hero Section - Portada con overlay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative h-96 rounded-2xl overflow-hidden shadow-lg">
          <img
            src={cover}
            alt="Portada de fiesta"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="w-full p-8 text-white space-y-3">
              <h1 className="text-4xl font-bold">{party?.title || 'Fiesta especial'}</h1>
              <p className="text-lg opacity-90 max-w-2xl">
                {customTexts.welcomeSubtitle || 'Gracias por ser parte de este momento'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Información Principal */}
      <motion.div
        className="grid md:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Fecha */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardBody className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-primary" />
                <span className="font-semibold text-text">Fecha</span>
              </div>
              <p className="text-sm text-text-muted capitalize">
                {formattedDate || 'Por definir'}
              </p>
            </CardBody>
          </Card>
        </motion.div>

        {/* Ubicación */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardBody className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-accent" />
                <span className="font-semibold text-text">Ubicación</span>
              </div>
              <p className="text-sm text-text-muted">
                {party?.location || 'Por definir'}
              </p>
            </CardBody>
          </Card>
        </motion.div>

        {/* Información de Regalos */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardBody className="space-y-3">
              <div className="flex items-center gap-3">
                <Gift className="w-6 h-6 text-secondary" />
                <span className="font-semibold text-text">Regalos</span>
              </div>
              <p className="text-sm text-text-muted">
                {party?.giftList?.length || 0} opciones disponibles
              </p>
            </CardBody>
          </Card>
        </motion.div>
      </motion.div>

      {/* Descripción */}
      {party?.description && (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-text">Detalles de la fiesta</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <p className="text-text-muted leading-relaxed">
                {party.description}
              </p>
              {customTexts.extraInfo && (
                <p className="text-sm text-primary font-semibold pt-3 border-t border-border">
                  💡 {customTexts.extraInfo}
                </p>
              )}
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Galería de Imágenes */}
      {galleryImages.length > 0 && (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-text">Galería de la fiesta</h2>
            <motion.div
              className="grid md:grid-cols-3 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {galleryImages.map((img, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="relative h-40 rounded-lg overflow-hidden shadow-md group cursor-pointer"
                >
                  <img
                    src={img}
                    alt={`Galería ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div
        className="grid md:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
      >
        {/* Preguntas */}
        {party?.questions && party.questions.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardBody className="space-y-4">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-6 h-6 text-accent" />
                  <div>
                    <p className="font-semibold text-text">Preguntas</p>
                    <p className="text-sm text-text-muted">
                      {party.questions.length} preguntas para responder
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/party/${p_uuid}/questions?p_uuid=${p_uuid}`)}
                  fullWidth
                >
                  Responder ahora
                </Button>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Regalos */}
        {party?.giftList && party.giftList.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardBody className="space-y-4">
                <div className="flex items-center gap-3">
                  <Gift className="w-6 h-6 text-secondary" />
                  <div>
                    <p className="font-semibold text-text">Regalos</p>
                    <p className="text-sm text-text-muted">
                      {party.giftList.filter((g) => g.remainingQuantity > 0).length} disponibles
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate(`/party/${p_uuid}/gifts?p_uuid=${p_uuid}`)}
                  fullWidth
                >
                  Ver regalos
                </Button>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-error/10 border border-error text-error p-4 rounded-lg"
        >
          <p className="font-semibold">Error al cargar la fiesta</p>
          <p className="text-sm mt-1">{error}</p>
        </motion.div>
      )}

      {/* Welcome Note */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardBody className="space-y-3">
            <p className="text-sm text-text-muted">
              ✨ {user?.displayName ? `¡Hola ${user.displayName}!` : '¡Hola!'} Te estamos esperando.
            </p>
            <p className="text-xs text-text-muted">
              Confirma tu asistencia, responde las preguntas y elige un regalo de la lista para completar tu RSVP.
            </p>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};
