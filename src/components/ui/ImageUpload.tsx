import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadImage, deleteImage, compressImage, type ImageType } from '../../services/imageUpload.service';
import { Button } from '../ui/button';

interface ImageUploadProps {
  label: string;
  description?: string;
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  onImageDeleted?: () => void;
  imageType: ImageType;
  partyId: string;
  aspectRatio?: string; // ej: "16/9", "1/1", "4/3"
  compress?: boolean;
  maxWidth?: number;
  quality?: number;
}

export function ImageUpload({
  label,
  description,
  currentImageUrl,
  onImageUploaded,
  onImageDeleted,
  imageType,
  partyId,
  aspectRatio = '16/9',
  compress = true,
  maxWidth = 1920,
  quality = 0.8,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      // Crear preview local
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      // Comprimir imagen si está habilitado
      let fileToUpload = file;
      if (compress) {
        fileToUpload = await compressImage(file, maxWidth, quality);
      }

      // Subir a Storage
      const result = await uploadImage(fileToUpload, imageType, partyId);

      if (result.success) {
        onImageUploaded(result.url);
        setPreviewUrl(null); // Usar la URL real ahora
      } else {
        setError(result.error || 'Error al subir imagen');
        setPreviewUrl(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      // Limpiar input para permitir subir la misma imagen de nuevo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!currentImageUrl) return;

    setDeleting(true);
    setError(null);

    try {
      const deleted = await deleteImage(currentImageUrl);
      if (deleted) {
        onImageDeleted?.();
      } else {
        setError('No se pudo eliminar la imagen');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  const displayUrl = previewUrl || currentImageUrl;

  return (
    <div className="space-y-3">
      {/* Label y descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>

      {/* Preview o placeholder */}
      <div className="relative">
        <div
          className="relative w-full overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-purple-400"
          style={{ aspectRatio }}
        >
          <AnimatePresence mode="wait">
            {displayUrl ? (
              <motion.div
                key="image"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative w-full h-full"
              >
                <img
                  src={displayUrl}
                  alt={label}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay con acciones */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || deleting}
                    className="bg-white text-gray-700 hover:bg-gray-100"
                  >
                    📷 Cambiar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleDelete}
                    disabled={uploading || deleting}
                    className="bg-white text-red-600 hover:bg-red-50 border-red-200"
                  >
                    {deleting ? '...' : '🗑️ Eliminar'}
                  </Button>
                </div>

                {/* Indicador de carga */}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-sm">Subiendo...</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.button
                key="placeholder"
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-purple-500 transition-colors"
              >
                <svg
                  className="w-12 h-12 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm font-medium">
                  {uploading ? 'Subiendo...' : 'Haz clic para subir imagen'}
                </span>
                <span className="text-xs mt-1">JPG, PNG, GIF o WebP (máx. 5MB)</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Input oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

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
    </div>
  );
}
