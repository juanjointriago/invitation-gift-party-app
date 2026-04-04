import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../db/initialize';
import { setItem, getDocsFromCollectionQuery, deleteItem } from '../db/fb.helper';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION = import.meta.env.VITE_COLLECTION_PARTY_PHOTOS || 'partyPhotos';

export interface PartyPhoto {
  id: string;
  partyUuid: string;
  uploadedBy: string;    // user ID
  uploaderName?: string;
  url: string;
  storagePath: string;
  createdAt: number;
}

export class PartyPhotosService {
  /**
   * Get all photos for a party, ordered by createdAt desc (client-side sort)
   */
  static async getPhotosByParty(partyUuid: string): Promise<PartyPhoto[]> {
    const photos = await getDocsFromCollectionQuery<PartyPhoto>(
      COLLECTION,
      'partyUuid',
      '==',
      partyUuid
    );
    return photos.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get photos for a specific user in a party
   */
  static async getPhotosByUser(partyUuid: string, userId: string): Promise<PartyPhoto[]> {
    const allPhotos = await PartyPhotosService.getPhotosByParty(partyUuid);
    return allPhotos.filter((p) => p.uploadedBy === userId);
  }

  /**
   * Upload a photo to Firebase Storage and save a Firestore record
   */
  static async uploadPhoto(
    partyUuid: string,
    userId: string,
    uploaderName: string,
    file: File
  ): Promise<PartyPhoto> {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `parties/${partyUuid}/photos/${userId}/${timestamp}_${safeName}`;

    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        partyUuid,
        userId,
        uploaderName,
        uploadedAt: new Date().toISOString(),
      },
    });

    const url = await getDownloadURL(storageRef);

    const id = uuidv4();
    const photo: PartyPhoto = {
      id,
      partyUuid,
      uploadedBy: userId,
      uploaderName,
      url,
      storagePath,
      createdAt: timestamp,
    };

    await setItem(COLLECTION, photo);
    return photo;
  }

  /**
   * Delete a photo from Storage and Firestore
   */
  static async deletePhoto(photo: PartyPhoto): Promise<void> {
    try {
      const storageRef = ref(storage, photo.storagePath);
      await deleteObject(storageRef);
    } catch (err) {
      console.warn('Could not delete from Storage (may already be deleted):', err);
    }
    await deleteItem(COLLECTION, photo.id);
  }

  /**
   * Count photos uploaded by a user for a party
   */
  static async countPhotosByUser(partyUuid: string, userId: string): Promise<number> {
    const photos = await PartyPhotosService.getPhotosByUser(partyUuid, userId);
    return photos.length;
  }
}
