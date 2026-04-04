import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams, useMatch } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card, CardBody, CardHeader } from '../../components/ui/card';
import { usePartyLoader } from '../../hooks/usePartyLoader';
import { PartyPhotosService, type PartyPhoto } from '../../services/partyPhotos.service';
import { Camera, Trash2, Users, X } from 'lucide-react';
import { toast } from 'sonner';

export const PartyPhotosAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { partyUuid } = useParams();
  const [searchParams] = useSearchParams();
  const p_uuid = searchParams.get('p_uuid') || partyUuid || '';
  const isAdminContext = !!useMatch('/admin/*');

  const { fullParty } = usePartyLoader(p_uuid);

  const [photos, setPhotos] = useState<PartyPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<PartyPhoto | null>(null);

  const loadPhotos = useCallback(async () => {
    if (!p_uuid) return;
    setLoading(true);
    try {
      const data = await PartyPhotosService.getPhotosByParty(p_uuid);
      setPhotos(data);
    } catch (err) {
      console.error('Error loading photos:', err);
      toast.error('Error al cargar las fotos');
    } finally {
      setLoading(false);
    }
  }, [p_uuid]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const handleDelete = async (photo: PartyPhoto) => {
    if (!confirm(`¿Eliminar la foto de ${photo.uploaderName || photo.uploadedBy}?`)) return;
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

  // Group photos by uploaderName or uploadedBy
  const grouped = photos.reduce<Record<string, PartyPhoto[]>>((acc, photo) => {
    const key = photo.uploaderName || photo.uploadedBy;
    if (!acc[key]) acc[key] = [];
    acc[key].push(photo);
    return acc;
  }, {});

  const uploaderCount = Object.keys(grouped).length;
  const backPath = `/${isAdminContext ? 'admin' : 'host'}/party/${p_uuid}?p_uuid=${p_uuid}`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="space-y-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text flex items-center gap-3">
              <Camera className="w-8 h-8 text-primary" />
              Fotos del evento
            </h1>
            <p className="text-text-muted mt-1">
              {fullParty?.title || 'Fiesta'} · {photos.length} fotos de {uploaderCount} invitados
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate(backPath)}>
            Volver
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Camera className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{photos.length}</p>
                <p className="text-xs text-text-muted">Total fotos</p>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{uploaderCount}</p>
                <p className="text-xs text-text-muted">Invitados con fotos</p>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <Camera className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">
                  {uploaderCount > 0 ? (photos.length / uploaderCount).toFixed(1) : '0'}
                </p>
                <p className="text-xs text-text-muted">Promedio por invitado</p>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Photos by guest */}
        {loading ? (
          <motion.div variants={itemVariants} className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </motion.div>
        ) : photos.length === 0 ? (
          <motion.div variants={itemVariants}>
            <Card>
              <CardBody className="text-center py-16">
                <Camera className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-40" />
                <p className="text-xl font-semibold text-text">Aún no hay fotos</p>
                <p className="text-text-muted mt-1">Los invitados aún no han subido fotos.</p>
              </CardBody>
            </Card>
          </motion.div>
        ) : (
          Object.entries(grouped).map(([uploader, uploaderPhotos]) => (
            <motion.div key={uploader} variants={itemVariants}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-text">{uploader}</h2>
                    <span className="text-sm text-text-muted">{uploaderPhotos.length} foto{uploaderPhotos.length !== 1 ? 's' : ''}</span>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {uploaderPhotos.map((photo, idx) => (
                      <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.04 }}
                        className="relative group aspect-square rounded-lg overflow-hidden shadow cursor-pointer"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <img
                          src={photo.url}
                          alt={`Foto de ${uploader}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          onClick={(e) => { e.stopPropagation(); handleDelete(photo); }}
                          aria-label="Eliminar foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs">
                            {new Date(photo.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))
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
            <div className="absolute top-3 left-3 bg-black/60 rounded-lg px-3 py-1.5">
              <p className="text-white text-sm font-medium">
                {selectedPhoto.uploaderName || selectedPhoto.uploadedBy}
              </p>
              <p className="text-white/70 text-xs">
                {new Date(selectedPhoto.createdAt).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
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
