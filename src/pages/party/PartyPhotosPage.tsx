import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card, CardBody } from '../../components/ui/card';
import { useAuthStore } from '../../stores/auth.store';
import { usePartyLoader } from '../../hooks/usePartyLoader';
import { PartyPhotosService, type PartyPhoto } from '../../services/partyPhotos.service';
import type { Party } from '../../types/party';
import { Camera, ChevronLeft, ChevronRight, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export const PartyPhotosPage: React.FC = () => {
  const navigate = useNavigate();
  const { partyUuid } = useParams();
  const [searchParams] = useSearchParams();
  const p_uuid = searchParams.get('p_uuid') || partyUuid || '';

  const { user: currentUser } = useAuthStore();
  const { fullParty, loading: partyLoading } = usePartyLoader(p_uuid);
  const fullPartyTyped = fullParty as Party | null;

  const maxPhotos = fullPartyTyped?.maxPhotosPerPerson ?? 5;

  const [photos, setPhotos] = useState<PartyPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PartyPhoto | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const loadPhotos = useCallback(async () => {
    if (!p_uuid || !currentUser) return;
    setLoading(true);
    try {
      const data = await PartyPhotosService.getPhotosByUser(p_uuid, currentUser.id);
      setPhotos(data);
    } catch (err) {
      console.error('Error loading photos:', err);
      toast.error('Error al cargar las fotos');
    } finally {
      setLoading(false);
    }
  }, [p_uuid, currentUser]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const handleScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
      setScrollProgress(progress);
    }
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', handleScroll);
      return () => carousel.removeEventListener('scroll', handleScroll);
    }
  }, [photos.length]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 340;
      carouselRef.current.scrollTo({
        left: direction === 'left'
          ? carouselRef.current.scrollLeft - scrollAmount
          : carouselRef.current.scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (photos.length >= maxPhotos) {
      toast.error(`Ya alcanzaste el límite de ${maxPhotos} fotos`);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar 5MB');
      return;
    }

    setUploading(true);
    try {
      const uploaderName = `${currentUser.name} ${currentUser.lastName || ''}`.trim();
      const newPhoto = await PartyPhotosService.uploadPhoto(p_uuid, currentUser.id, uploaderName, file);
      setPhotos((prev) => [newPhoto, ...prev]);
      toast.success('Foto subida exitosamente');
    } catch (err) {
      console.error('Error uploading photo:', err);
      toast.error('Error al subir la foto');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (photo: PartyPhoto) => {
    if (!confirm('¿Eliminar esta foto?')) return;
    try {
      await PartyPhotosService.deletePhoto(photo);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      if (selectedPhoto?.id === photo.id) setSelectedPhoto(null);
      toast.success('Foto eliminada');
    } catch (err) {
      console.error('Error deleting photo:', err);
      toast.error('Error al eliminar la foto');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const atMax = photos.length >= maxPhotos;

  return (
    <div className="container-app py-10">
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text flex items-center gap-3">
              <Camera className="w-8 h-8 text-primary" />
              Mis fotos del evento
            </h1>
            <p className="text-text-muted mt-1">
              {fullPartyTyped?.title || 'Fiesta'} · {photos.length} de {maxPhotos} fotos
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate(`/party/${p_uuid}/home?p_uuid=${p_uuid}`)}>
            Volver
          </Button>
        </motion.div>

        {/* Upload card */}
        <motion.div variants={itemVariants}>
          <Card className={`border-2 transition-colors ${atMax ? 'border-gray-200 dark:border-zinc-700' : 'border-dashed border-primary/40 hover:border-primary/80'}`}>
            <CardBody className="flex flex-col sm:flex-row items-center gap-5 py-6">
              {/* Counter */}
              <div className="text-center min-w-[100px]">
                <p className="text-4xl font-bold text-primary">{photos.length}</p>
                <p className="text-xs text-text-muted">de {maxPhotos} fotos</p>
                <div className="mt-2 w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((photos.length / maxPhotos) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                {atMax ? (
                  <p className="text-text-muted">Has alcanzado el límite de fotos para este evento.</p>
                ) : (
                  <p className="text-text-muted">Puedes subir hasta {maxPhotos - photos.length} foto{maxPhotos - photos.length !== 1 ? 's' : ''} más.</p>
                )}
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  variant="primary"
                  disabled={atMax || uploading || partyLoading}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Subir foto
                    </>
                  )}
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Photos carousel/grid */}
        {loading ? (
          <motion.div variants={itemVariants} className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </motion.div>
        ) : photos.length === 0 ? (
          <motion.div variants={itemVariants}>
            <Card>
              <CardBody className="text-center py-16">
                <Camera className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-40" />
                <p className="text-xl font-semibold text-text">Aún no tienes fotos</p>
                <p className="text-text-muted mt-1">Sube tu primera foto del evento.</p>
              </CardBody>
            </Card>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-xl font-bold text-text">Tus fotos</h2>

            {/* Carousel */}
            <div className="relative group">
              <div
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {photos.map((photo, idx) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex-shrink-0 relative group/card w-72 h-56 rounded-xl overflow-hidden shadow-lg cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo.url}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {/* Delete button */}
                    <button
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-red-600"
                      onClick={(e) => { e.stopPropagation(); handleDelete(photo); }}
                      aria-label="Eliminar foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {/* Date overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                      <p className="text-white text-xs">
                        {new Date(photo.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {photos.length > 2 && (
                <>
                  <button
                    onClick={() => scrollCarousel('left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/95 dark:bg-gray-800/95 rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all z-10"
                    aria-label="Deslizar izquierda"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-800 dark:text-white" />
                  </button>
                  <button
                    onClick={() => scrollCarousel('right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/95 dark:bg-gray-800/95 rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all z-10"
                    aria-label="Deslizar derecha"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-800 dark:text-white" />
                  </button>
                </>
              )}

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.url}
              alt="Vista ampliada"
              className="w-full h-full object-contain rounded-xl"
            />
            <button
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <button
              className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
              onClick={() => handleDelete(selectedPhoto)}
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
