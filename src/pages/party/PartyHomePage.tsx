import React, { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card, CardBody } from '../../components/ui/card';
import { SkeletonLoader, CardSkeletonLoader } from '../../components/ui/skeleton-loader';
import { usePartyContextStore } from '../../stores/partyContext.store';
import { usePartyLoader } from '../../hooks/usePartyLoader';
import { useAuthStore } from '../../stores/auth.store';
import { Calendar, MapPin, Gift, MessageCircle } from 'lucide-react';
import type { Party } from '../../types/party';

export const PartyHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { partyUuid } = useParams();
  const [searchParams] = useSearchParams();
  const p_uuid = searchParams.get('p_uuid') || partyUuid || '';

  const { currentParty, applyPartyTheme } = usePartyContextStore((s) => ({
    currentParty: s.currentParty,
    applyPartyTheme: s.applyPartyTheme,
  }));

  const { user: currentUser } = useAuthStore();
  const { fullParty, loading, error } = usePartyLoader(p_uuid);

  const fullPartyTyped = fullParty as Party | null;
  const party = currentParty || fullPartyTyped;

  useEffect(() => {
    if (party?.themeConfig) {
      applyPartyTheme(party.themeConfig);
    }
  }, [party?.themeConfig, applyPartyTheme]);

  const cover =
    party?.themeConfig?.coverImageUrl ||
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=60';

  const galleryImages = fullPartyTyped?.themeConfig?.homeGalleryImages || [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=60',
    'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=400&q=60',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=60',
  ];

  const formattedDate = party?.date
    ? new Date(party.date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

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
      <div className="container-app py-10">
        <div className="space-y-8">
          <CardSkeletonLoader />
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <SkeletonLoader key={i} type="card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-app py-10">
        <div className="bg-error/10 border border-error text-error p-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <motion.div
        className="space-y-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div
          variants={itemVariants}
          className="relative h-96 rounded-2xl overflow-hidden shadow-lg"
        >
          <img
            src={cover}
            alt="Portada de la fiesta"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="w-full p-8 text-white space-y-3">
              <h1 className="text-4xl font-bold">{party?.title}</h1>
              {currentUser && (
                <p className="text-base opacity-90">Bienvenido, {currentUser.name}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Date Card */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardBody className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-primary" />
                  <span className="font-semibold text-text">Fecha</span>
                </div>
                <p className="text-sm text-text-muted capitalize">
                  {formattedDate || 'No definida'}
                </p>
              </CardBody>
            </Card>
          </motion.div>

          {/* Location Card */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardBody className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-accent" />
                  <span className="font-semibold text-text">Ubicación</span>
                </div>
                <p className="text-sm text-text-muted">{party?.location || 'No definida'}</p>
              </CardBody>
            </Card>
          </motion.div>

          {/* Gifts Card */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardBody className="space-y-3">
                <div className="flex items-center gap-3">
                  <Gift className="w-6 h-6 text-secondary" />
                  <span className="font-semibold text-text">Regalos</span>
                </div>
                <p className="text-sm text-text-muted">
                  {fullPartyTyped?.giftList?.length || 0} opciones disponibles
                </p>
              </CardBody>
            </Card>
          </motion.div>
        </motion.div>

        {/* Description */}
        {party?.description && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardBody className="space-y-4">
                <h2 className="text-2xl font-bold text-text">Detalles</h2>
                <p className="text-text-muted leading-relaxed">{party.description}</p>
                {party?.themeConfig?.customTexts?.extraInfo && (
                  <p className="text-sm italic text-accent pt-3 border-t border-border">
                    ✨ {party.themeConfig.customTexts.extraInfo}
                  </p>
                )}
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Gallery */}
        {galleryImages.length > 0 && (
          <motion.div variants={itemVariants}>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-text">Galería</h2>
              <motion.div
                className="grid md:grid-cols-3 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {galleryImages.slice(0, 3).map((img, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    className="group cursor-pointer"
                  >
                    <motion.img
                      src={img}
                      alt={`Galería ${idx + 1}`}
                      className="w-full h-64 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="grid md:grid-cols-2 gap-6 py-8 border-t border-b border-border"
        >
          {/* Questions */}
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <MessageCircle className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Preguntas a responder</p>
              <p className="text-2xl font-bold text-text">
                {fullPartyTyped?.questions?.length || 0}
              </p>
            </div>
          </motion.div>

          {/* Gifts Available */}
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <Gift className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Regalos disponibles</p>
              <p className="text-2xl font-bold text-text">
                {fullPartyTyped?.giftList?.length || 0}
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row gap-4"
        >
          <motion.div variants={itemVariants} className="flex-1">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate(`/party/${p_uuid}/questions?p_uuid=${p_uuid}`)}
              className="h-12"
            >
              Responder Preguntas
            </Button>
          </motion.div>
          <motion.div variants={itemVariants} className="flex-1">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => navigate(`/party/${p_uuid}/gifts?p_uuid=${p_uuid}`)}
              className="h-12"
            >
              Elegir Regalo
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};
