import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadMultipleImages, deleteImage, type ImageType } from '../../services/imageUpload.service';

interface GalleryUploadProps {
  label: string;
  description?: string;
  currentImages: string[];
  onImagesUpdated: (urls: string[]) => void;
  imageType: ImageType;
  partyId: string;
  maxImages?: number;
}

export function GalleryUpload({
  label,
  description,
  currentImages,
  onImagesUpdated,
  imageType,
  partyId,
  maxImages = 10,
}: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Verificar límite
    if (currentImages.length + files.length > maxImages) {
      setError(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    try {
      // Subir imágenes una por una para mostrar progreso
      const newUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        setUploadProgress({ current: i + 1, total: files.length });
        
        const results = await uploadMultipleImages([files[i]], imageType, partyId);
        
        if (results[0].success) {
          newUrls.push(results[0].url);
        } else {
          console.warn(`Error subiendo imagen ${i + 1}:`, results[0].error);
        }
      }

      // Actualizar lista de imágenes
      onImagesUpdated([...currentImages, ...newUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir imágenes');
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (imageUrl: string) => {
    try {
      const deleted = await deleteImage(imageUrl);
      if (deleted) {
        const newImages = currentImages.filter((url) => url !== imageUrl);
        onImagesUpdated(newImages);
      }
    } catch (err) {
      console.error('Error al eliminar imagen:', err);
    }
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newImages = [...currentImages];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesUpdated(newImages);
  };

  return (
    <div className="space-y-3">
      {/* Label y descripción */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {currentImages.length} / {maxImages}
        </span>
      </div>

      {/* Grid de imágenes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <AnimatePresence>
          {currentImages.map((imageUrl, index) => (
            <motion.div
              key={imageUrl}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative aspect-square group"
            >
              <img
                src={imageUrl}
                alt={`Imagen ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
              />

              {/* Overlay con acciones */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded-lg flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                {/* Mover a la izquierda */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleReorder(index, index - 1)}
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100"
                    title="Mover a la izquierda"
                  >
                    ←
                  </button>
                )}

                {/* Eliminar */}
                <button
                  type="button"
                  onClick={() => handleDelete(imageUrl)}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-600 hover:bg-red-50"
                  title="Eliminar"
                >
                  🗑️
                </button>

                {/* Mover a la derecha */}
                {index < currentImages.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleReorder(index, index + 1)}
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100"
                    title="Mover a la derecha"
                  >
                    →
                  </button>
                )}
              </div>

              {/* Número de orden */}
              <div className="absolute top-2 left-2 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {index + 1}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Botón para agregar más */}
        {currentImages.length < maxImages && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-purple-500 hover:border-purple-400 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <>
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-xs">
                  {uploadProgress && `${uploadProgress.current}/${uploadProgress.total}`}
                </span>
              </>
            ) : (
              <>
                <svg
                  className="w-8 h-8 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="text-xs font-medium">Agregar</span>
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFilesSelect}
        className="hidden"
      />

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
        >
          ⚠️ {error}
        </motion.div>
      )}

      {/* Ayuda */}
      <p className="text-xs text-gray-500">
        💡 Puedes subir hasta {maxImages} imágenes. Haz clic en las flechas para reordenar.
      </p>
    </div>
  );
}
