import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../db/initialize';
import type { IUser, Role } from '../interfaces/users.interface';

export class UsersService {
  static getAllUsers = async (): Promise<IUser[]> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as IUser[];
    } catch (error) {
      console.error('Error getting users:', error);
      throw new Error('Error al obtener usuarios');
    }
  };

  static updateUserRole = async (userId: string, role: Role): Promise<void> => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error('Error al actualizar el rol del usuario');
    }
  };
}
