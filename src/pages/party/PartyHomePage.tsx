import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card, CardBody } from '../../components/ui/card';
import { SkeletonLoader, CardSkeletonLoader } from '../../components/ui/skeleton-loader';
import { usePartyContextStore } from '../../stores/partyContext.store';
import { usePartyLoader } from '../../hooks/usePartyLoader';
import { useAuthStore } from '../../stores/auth.store';
import { Calendar, MapPin, Gift, MessageCircle, ChevronLeft, ChevronRight, MapPinned, Camera, Upload } from 'lucide-react';
import type { Party } from '../../types/party';
import { isMapUrl, generateMapLinks } from '../../utils/map.utils';
import { VenueService } from '../../services/venue.service';
import type { SeatSearchResult } from '../../types/venue.types';
import { uploadImage } from '../../services/imageUpload.service';
import { UsersService } from '../../services/users.service';
import { toast } from 'sonner';

export const PartyHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { partyUuid } = useParams();
  const [searchParams] = useSearchParams();
  const p_uuid = searchParams.get('p_uuid') || partyUuid || '';

  const currentParty = usePartyContextStore((s) => s.currentParty);
  const applyPartyTheme = usePartyContextStore((s) => s.applyPartyTheme);
  const setPartyUuid = usePartyContextStore((s) => s.setPartyUuid);
  const setPartyData = usePartyContextStore((s) => s.setPartyData);

  const { user: currentUser, setUser } = useAuthStore();
  const { fullParty, loading, error } = usePartyLoader(p_uuid);

  const fullPartyTyped = fullParty as Party | null;
  const party = currentParty || fullPartyTyped;

  const [scrollProgress, setScrollProgress] = useState(0);
  const [seatResult, setSeatResult] = useState<SeatSearchResult | null>(null);
  const [venuePublished, setVenuePublished] = useState(false);

  // Profile photo state
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(
    currentUser?.photoURL || currentUser?.avatar || null
  );
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Cargar venue: esperar a que el partido cargue (Firebase disponible) antes de buscar el plano
  useEffect(() => {
    if (!p_uuid || loading) return;
    VenueService.getLayout(p_uuid).then((layout) => {
      if (!layout) return;
      if (layout.isPublished) setVenuePublished(true);
      // Buscar asiento solo si hay usuario logueado
      if (currentUser) {
        let result = VenueService.searchGuestById(layout, currentUser.id);
        if (!result.found && currentUser.name) {
          result = VenueService.searchGuest(layout, `${currentUser.name} ${currentUser.lastName || ''}`.trim());
        }
        if (result.found) setSeatResult(result);
      }
    }).catch(() => {});
  }, [p_uuid, loading, currentUser]);

  // Populate party context so PartyGuestLayout can apply theme CSS variables
  useEffect(() => {
    if (!fullPartyTyped) return;
    setPartyUuid(p_uuid);
    setPartyData({
      party_uuid: fullPartyTyped.party_uuid,
      title: fullPartyTyped.title,
      description: fullPartyTyped.description,
      date: fullPartyTyped.date,
      location: fullPartyTyped.location,
      themeConfig: fullPartyTyped.themeConfig,
      status: fullPartyTyped.status,
    });
  }, [fullPartyTyped, p_uuid, setPartyUuid, setPartyData]);

  useEffect(() => {
    if (party?.themeConfig) {
      applyPartyTheme(party.themeConfig);
    }
  }, [party?.themeConfig, applyPartyTheme]);

  // Sync profile photo from auth store when user changes
  useEffect(() => {
    setProfilePhotoUrl(currentUser?.photoURL || currentUser?.avatar || null);
  }, [currentUser]);

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
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 400;
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
      handleScroll();
      return () => {
        carousel.removeEventListener('scroll', handleScroll);
      };
    }
  }, [galleryImages.length]);

  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no puede superar 2MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const result = await uploadImage(file, 'cover', `profiles/${currentUser.id}`);
      if (!result.success || !result.url) {
        toast.error(result.error || 'Error al subir la foto');
        return;
      }

      // Update in Firestore via user collection manually
      await UsersService.updateUserRole(currentUser.id, currentUser.role); // no-op for role, but we need updateUser
      // Since UsersService doesn't have updateUser, use the doc update directly
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../../db/initialize');
      await updateDoc(doc(db, 'users', currentUser.id), {
        photoURL: result.url,
        avatar: result.url,
        updatedAt: Date.now(),
      });

      const updatedUser = { ...currentUser, photoURL: result.url, avatar: result.url };
      setUser(updatedUser);
      setProfilePhotoUrl(result.url);
      toast.success('Foto de perfil actualizada');
    } catch (err) {
      console.error('Error actualizando foto de perfil:', err);
      toast.error('Error al actualizar la foto de perfil');
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const hasQuestions = (fullPartyTyped?.questions?.length ?? 0) > 0;
  const hasGifts = (fullPartyTyped?.giftList?.length ?? 0) > 0;
  const displayMode = fullPartyTyped?.themeConfig?.displayMode || 'both';

  // Redirigir si el modo es solo plano del salón
  useEffect(() => {
    if (displayMode === 'seating' && !loading && venuePublished) {
      navigate(`/party/${p_uuid}/seating?p_uuid=${p_uuid}`, { replace: true });
    }
  }, [displayMode, loading, venuePublished, navigate, p_uuid]);

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

        {/* Profile Photo Card */}
        {currentUser && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardBody className="flex items-center gap-5">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary/30 bg-primary/10 flex items-center justify-center">
                    {profilePhotoUrl ? (
                      <img
                        src={profilePhotoUrl}
                        alt="Foto de perfil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-primary">
                        {currentUser.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  {uploadingPhoto && (
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                    </div>
                  )}
                </div>

                {/* Info and upload */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Tu foto de perfil</p>
                  <p className="font-bold text-text text-lg truncate">
                    {currentUser.name} {currentUser.lastName || ''}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">{currentUser.email}</p>
                </div>

                <div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePhotoChange}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={uploadingPhoto}
                    onClick={() => photoInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    {uploadingPhoto ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Cambiar foto
                      </>
                    )}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

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

          {/* Gifts Card — only if gifts exist */}
          {hasGifts && (
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
          )}
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

                {/* Navigation Buttons */}
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

        {/* Asiento del invitado */}
        {seatResult?.found && (
          <motion.div variants={itemVariants}>
            <Card className="border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
              <CardBody className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-800/50">
                    <MapPinned className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-purple-500 dark:text-purple-400">Tu lugar en la fiesta</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{seatResult.tableLabel}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Asiento <span className="font-bold text-purple-600 dark:text-purple-400">#{seatResult.seatNumber}</span>
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/party/${p_uuid}/seating?p_uuid=${p_uuid}`)}
                >
                  Ver en el plano
                </Button>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Stats */}
        {(hasQuestions || hasGifts) && (
          <motion.div
            variants={itemVariants}
            className="grid md:grid-cols-2 gap-6 py-8 border-t border-b border-border"
          >
            {/* Questions */}
            {hasQuestions && (
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
            )}

            {/* Gifts Available */}
            {hasGifts && (
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
            )}
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row gap-4 flex-wrap"
        >
          {/* Primary action: confirm attendance (questions) or choose gift */}
          {hasQuestions && (
            <motion.div variants={itemVariants} className="flex-1">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => navigate(`/party/${p_uuid}/questions?p_uuid=${p_uuid}`)}
                className="h-12"
              >
                📝 Confirmar asistencia
              </Button>
            </motion.div>
          )}
          {!hasQuestions && hasGifts && (
            <motion.div variants={itemVariants} className="flex-1">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => navigate(`/party/${p_uuid}/gifts?p_uuid=${p_uuid}`)}
                className="h-12"
              >
                🎁 Elegir regalo
              </Button>
            </motion.div>
          )}
          {hasQuestions && hasGifts && (
            <motion.div variants={itemVariants} className="flex-1">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={() => navigate(`/party/${p_uuid}/gifts?p_uuid=${p_uuid}`)}
                className="h-12"
              >
                🎁 Elegir Regalo
              </Button>
            </motion.div>
          )}
          {venuePublished && displayMode !== 'invitation' && (
            <motion.div variants={itemVariants} className="flex-1">
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => navigate(`/party/${p_uuid}/seating?p_uuid=${p_uuid}`)}
                className="h-12 flex items-center justify-center gap-2"
              >
                <MapPinned className="w-5 h-5" />
                Ver Plano del Salón
              </Button>
            </motion.div>
          )}
          <motion.div variants={itemVariants} className="flex-1">
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={() => navigate(`/party/${p_uuid}/photos?p_uuid=${p_uuid}`)}
              className="h-12 flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Mis fotos del evento
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};
