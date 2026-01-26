import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../db/initialize';

/**
 * Tipos de imágenes que se pueden subir
 */
export type ImageType = 'cover' | 'banner' | 'gallery' | 'gift' | 'category-icon';

/**
 * Resultado del upload de imagen
 */
export interface ImageUploadResult {
  success: boolean;
  url: string;
  path: string;
  error?: string;
}

/**
 * Genera un nombre único para el archivo
 */
function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 9);
  const extension = originalName.split('.').pop();
  return `${timestamp}_${randomString}.${extension}`;
}

/**
 * Valida que el archivo sea una imagen válida
 */
function validateImage(file: File): { valid: boolean; error?: string } {
  // Verificar tipo de archivo
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no válido. Usa JPG, PNG, GIF o WebP.',
    };
  }

  // Verificar tamaño (máximo 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'La imagen es demasiado grande. Máximo 5MB.',
    };
  }

  return { valid: true };
}

/**
 * Obtiene la ruta en Storage según el tipo de imagen
 */
function getStoragePath(type: ImageType, partyId: string, fileName: string): string {
  const paths: Record<ImageType, string> = {
    cover: `party-images/${partyId}/cover/${fileName}`,
    banner: `party-images/${partyId}/banner/${fileName}`,
    gallery: `party-images/${partyId}/gallery/${fileName}`,
    gift: `party-images/${partyId}/gifts/${fileName}`,
    'category-icon': `party-images/${partyId}/icons/${fileName}`,
  };

  return paths[type];
}

/**
 * Sube una imagen a Firebase Storage
 * @param file - Archivo de imagen a subir
 * @param type - Tipo de imagen
 * @param partyId - ID de la fiesta
 * @returns Resultado con URL y path de la imagen
 */
export async function uploadImage(
  file: File,
  type: ImageType,
  partyId: string
): Promise<ImageUploadResult> {
  try {
    // 1. Validar imagen
    const validation = validateImage(file);
    if (!validation.valid) {
      return {
        success: false,
        url: '',
        path: '',
        error: validation.error,
      };
    }

    // 2. Generar nombre único
    const fileName = generateFileName(file.name);

    // 3. Obtener path en Storage
    const storagePath = getStoragePath(type, partyId, fileName);

    // 4. Crear referencia
    const storageRef = ref(storage, storagePath);

    // 5. Configurar metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        partyId,
        type,
      },
    };

    // 6. Subir archivo
    console.log('📤 Subiendo imagen:', { fileName, type, size: file.size });
    await uploadBytes(storageRef, file, metadata);

    // 7. Obtener URL pública
    const downloadUrl = await getDownloadURL(storageRef);

    console.log('✅ Imagen subida exitosamente:', downloadUrl);

    return {
      success: true,
      url: downloadUrl,
      path: storagePath,
    };
  } catch (error) {
    console.error('❌ Error subiendo imagen:', error);
    return {
      success: false,
      url: '',
      path: '',
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Sube múltiples imágenes (para galería)
 * @param files - Array de archivos a subir
 * @param type - Tipo de imagen
 * @param partyId - ID de la fiesta
 * @returns Array de resultados
 */
export async function uploadMultipleImages(
  files: File[],
  type: ImageType,
  partyId: string
): Promise<ImageUploadResult[]> {
  const uploadPromises = files.map((file) => uploadImage(file, type, partyId));
  return Promise.all(uploadPromises);
}

/**
 * Elimina una imagen de Storage
 * @param imageUrl - URL de la imagen a eliminar
 * @returns true si se eliminó correctamente
 */
export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    // Extraer path de la URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/o\/(.+?)\?/);
    
    if (!pathMatch) {
      console.warn('⚠️ No se pudo extraer el path de la URL');
      return false;
    }

    const path = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage, path);

    console.log('🗑️ Eliminando imagen:', path);
    await deleteObject(storageRef);

    console.log('✅ Imagen eliminada exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error eliminando imagen:', error);
    return false;
  }
}

/**
 * Comprime una imagen antes de subirla (opcional)
 * @param file - Archivo original
 * @param maxWidth - Ancho máximo
 * @param quality - Calidad (0-1)
 * @returns Archivo comprimido
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcular nuevas dimensiones
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo obtener contexto del canvas'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Error al comprimir imagen'));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            console.log('📦 Imagen comprimida:', {
              original: `${(file.size / 1024).toFixed(2)} KB`,
              compressed: `${(compressedFile.size / 1024).toFixed(2)} KB`,
              reduction: `${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`,
            });

            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Error al cargar imagen'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Error al leer archivo'));
    reader.readAsDataURL(file);
  });
}
