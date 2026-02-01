import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card, CardBody } from '../../components/ui/card';
import { SkeletonLoader, CardSkeletonLoader } from '../../components/ui/skeleton-loader';
import { usePartyContextStore } from '../../stores/partyContext.store';
import { usePartyLoader } from '../../hooks/usePartyLoader';
import { useAuthStore } from '../../stores/auth.store';
import { Calendar, MapPin, Gift, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Party } from '../../types/party';
import { isMapUrl, generateMapLinks } from '../../utils/map.utils';

export const PartyHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { partyUuid } = useParams();
  const [searchParams] = useSearchParams();
  const p_uuid = searchParams.get('p_uuid') || partyUuid || '';

  const currentParty = usePartyContextStore((s) => s.currentParty);
  const applyPartyTheme = usePartyContextStore((s) => s.applyPartyTheme);

  const { user: currentUser } = useAuthStore();
  const { fullParty, loading, error } = usePartyLoader(p_uuid);

  const fullPartyTyped = fullParty as Party | null;
  const party = currentParty || fullPartyTyped;

  // Estado para el progreso del scroll
  const [scrollProgress, setScrollProgress] = useState(0);

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

  // Referencias para el scroll del carousel
  const carouselRef = React.useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 400; // Cantidad de scroll en pixels
      const newScrollLeft = direction === 'left' 
        ? carouselRef.current.scrollLeft - scrollAmount
        : carouselRef.current.scrollLeft + scrollAmount;
      
      carouselRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Actualizar progreso del scroll
  const handleScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
      setScrollProgress(progress);
    }
  };

  // Agregar listener de scroll
  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', handleScroll);
      // Calcular progreso inicial
      handleScroll();
      
      return () => {
        carousel.removeEventListener('scroll', handleScroll);
      };
    }
  }, [galleryImages.length]);

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
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent dark:from-black/85 dark:to-black/10 flex items-end">
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
                {party?.location && isMapUrl(party.location) ? (
                  <>
                    {(() => {
                      const mapLinks = generateMapLinks(party.location);
                      return mapLinks ? (
                        <div className="flex flex-col gap-2">
                          <a
                            href={mapLinks.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-white transition-all hover:scale-105 hover:shadow-md"
                            style={{ backgroundColor: '#4285F4' }}
                          >
                            <span>🗺️</span>
                            <span>Abrir en Google Maps</span>
                          </a>
                          <a
                            href={mapLinks.wazeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-white transition-all hover:scale-105 hover:shadow-md"
                            style={{ backgroundColor: '#33CCFF' }}
                          >
                            <span>🚗</span>
                            <span>Abrir en Waze</span>
                          </a>
                        </div>
                      ) : (
                        <p className="text-sm text-text-muted">{party.location}</p>
                      );
                    })()}
                  </>
                ) : (
                  <p className="text-sm text-text-muted">{party?.location || 'No definida'}</p>
                )}
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
              
              {/* Carousel Container */}
              <div className="relative group">
                {/* Scroll Container */}
                <div 
                  ref={carouselRef}
                  className="flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-hide pb-4"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  {galleryImages.map((img, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex-shrink-0 w-80 h-64 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    >
                      <img
                        src={img}
                        alt={`Galería ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Navigation Buttons - Only show if there are multiple images */}
                {galleryImages.length > 2 && (
                  <>
                    <button
                      onClick={() => scrollCarousel('left')}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/95 dark:bg-gray-800/95 rounded-full flex items-center justify-center shadow-xl hover:bg-white dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100 z-10"
                      aria-label="Deslizar izquierda"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-800 dark:text-white" />
                    </button>
                    
                    <button
                      onClick={() => scrollCarousel('right')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/95 dark:bg-gray-800/95 rounded-full flex items-center justify-center shadow-xl hover:bg-white dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100 z-10"
                      aria-label="Deslizar derecha"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-800 dark:text-white" />
                    </button>
                  </>
                )}

                {/* Scroll indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${scrollProgress}%` }}
                  />
                </div>
              </div>

              <p className="text-sm text-text-muted text-center">
                ← Desliza para ver más fotos →
              </p>
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
