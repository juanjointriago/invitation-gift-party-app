import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc,
  getDoc,
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

  static getUserById = async (userId: string): Promise<IUser | null> => {
    try {
      const userRef = doc(db, 'users', userId);
      const snapshot = await getDoc(userRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as IUser;
    } catch (error) {
      console.error('Error getting user by id:', error);
      return null;
    }
  };

  static getUsersByIds = async (userIds: string[]): Promise<Map<string, IUser>> => {
    try {
      const userMap = new Map<string, IUser>();
      
      // Fetch users in parallel
      const userPromises = userIds.map(id => this.getUserById(id));
      const users = await Promise.all(userPromises);
      
      users.forEach((user, index) => {
        if (user) {
          userMap.set(userIds[index], user);
        }
      });
      
      return userMap;
    } catch (error) {
      console.error('Error getting users by ids:', error);
      return new Map();
    }
  };
}
