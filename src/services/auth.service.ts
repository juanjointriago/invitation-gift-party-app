/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";

import { getItemById, setItem } from "../db/fb.helper";
import type { IUser } from "../interfaces/users.interface";

const COLLECTION_USERS = import.meta.env.VITE_COLLECTION_USERS || 'users';


export class AuthService {
  static login = async (
    email: string,
    password: string
  ): Promise<{ user?: IUser; isAuthenticated: boolean; message: string }> => {  
    const auth = getAuth();
     console.debug("✅login", { email });
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      console.debug("✅", user.displayName);
      const firebaseUser = await getItemById<IUser>(COLLECTION_USERS, user.uid);
      // console.debug("Auth.Service/static login/ getItemById=>", {
      //   firebaseUser,
      // });
      if (firebaseUser && firebaseUser.isActive === false) {
        await signOut(auth);
        return { isAuthenticated: false, message: 'Su usuario está en proceso de aprobación' };
      }
      if (firebaseUser && firebaseUser.isActive) {
        return { isAuthenticated: true, user: firebaseUser, message: `Bienvenido ${firebaseUser.name}` };
      }
      return { isAuthenticated: false, message: 'Usuario no encontrado' };
    } catch (error: any) {
      console.debug({ error });
      return { isAuthenticated: false, message: `Error al iniciar sesión: ${error.message}` };
    }
  };

  static resetPassword = async (email: string): Promise<{  isAuthenticated: boolean; message: string }> => {
    const auth = getAuth();
    try {
      console.log('reseteando contrasena', email);
      await sendPasswordResetEmail(auth, email);
      return { isAuthenticated: true, message: `Reinicio de Contraseña: Revise la bandeja de ${email}` };
    } catch (error: any) {
      return { isAuthenticated: false, message: `Error al enviar correo: ${error.message}` };
    }
  };

  static signUp = async (signUpUser: Omit<IUser, 'id' | 'createdAt' | 'lastLogin'>): Promise<{ isAuthenticated: boolean; message: string; user?: IUser }> => {
    const {
      email,
      password,
      name,
      role,
      phone,
      city,
      country,
    } = signUpUser;
    console.debug("[AUTH] SignUp iniciado con:", { email, name, role });
    const auth = getAuth();
    try {
      console.debug("[AUTH] Creando usuario en Firebase...");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password!
      );
      console.debug("[AUTH] Usuario creado en Firebase:", { uid: userCredential.user.uid });
      
      if (userCredential) {
        const { photoURL, uid } = userCredential.user;
        const dataUser:IUser = {
          id: uid,
          name,
          lastName: signUpUser.lastName || '',
          email,
          role,
          photoURL: photoURL || '',
          phone,
          city,
          country,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastLogin: Date.now(),
        };
        
        console.debug("[AUTH] Actualizando perfil...");
        await updateProfile(userCredential.user, { displayName: name });
        
        console.debug("[AUTH] Guardando en Firestore, colección:", COLLECTION_USERS);
        await setItem(COLLECTION_USERS, dataUser);
        
        console.debug("[AUTH] Usuario registrado exitosamente:", { email, uid });
        return { isAuthenticated: true, message: '¡Cuenta creada exitosamente!', user: dataUser };
      }
      console.warn("[AUTH] No se obtuvo credencial");
      return { isAuthenticated: false, message: 'No se pudo registrar el usuario' };
    } catch (error: any) {
      console.error('[AUTH] Error al registrar usuario:', error);
      console.error('[AUTH] Error code:', error.code);
      console.error('[AUTH] Error message:', error.message);
      await signOut(auth).catch(() => null);
      return { isAuthenticated: false, message: `Error: ${error.message}` };
    }
  };
  /**
   * @description Login with Google and set on user collection if not exists if exists continue
   * @returns
   */
  static googleSignUpLogin = async (): Promise<{ user?: IUser; isAuthenticated:boolean; message: string }> => {
    const auth = getAuth();
    const googleAuthProvider = new GoogleAuthProvider();
    googleAuthProvider.setCustomParameters({
      prompt: "select_account",
    });

    try {
      const { user } = await signInWithPopup(auth, googleAuthProvider);
      const { uid, email, displayName, photoURL } = user;
      const firebaseUser = await getItemById<IUser>(COLLECTION_USERS, uid);
      
      // Si el usuario no existe en Firestore, crearlo automáticamente como guest activo
      if (!firebaseUser?.id) {
        const dataUser:IUser = {
          id: uid,
          name: displayName || '',
          lastName: "",
          email: email || '',
          role: "guest",
          photoURL: photoURL || '',
          phone: "",
          city: "",
          country: "",
          isActive: true, // Activar automáticamente usuarios de Google
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastLogin: Date.now(),
        };
        await setItem(COLLECTION_USERS, dataUser);
        return { isAuthenticated: true, user: dataUser, message: `¡Bienvenido ${dataUser.name}!` };
      }
      
      // Si existe pero no está activo
      if (!firebaseUser.isActive) {
        await signOut(auth);
        return { isAuthenticated: false, message: 'Su usuario está en proceso de aprobación' };
      }
      
      // Usuario existe y está activo - actualizar último login
      const updatedUser = { ...firebaseUser, lastLogin: Date.now() };
      await setItem(COLLECTION_USERS, updatedUser);
      return { isAuthenticated: true, user: updatedUser, message: `Bienvenido ${firebaseUser.name}` };
    } catch (error: any) {
      console.error('[AUTH] Error en Google Sign-In:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        return { isAuthenticated: false, message: 'Inicio de sesión cancelado' };
      }
      if (error.code === 'auth/popup-blocked') {
        return { isAuthenticated: false, message: 'Popup bloqueado. Por favor, permite las ventanas emergentes.' };
      }
      return { isAuthenticated: false, message: `Error al iniciar sesión con Google: ${error.message}` };
    }
  };

  // static signUpGateway = async (sigUpUser: FirestoreUser) => {
  //     const auth = getAuth();
  //     const { email, password, name, role, phone, address, bornDate, cc, city, country } = sigUpUser;
  //     const { user } = await createUserWithEmailAndPassword(auth, email, password!)
  //     const { photoURL, uid } = user;
  //     const dataUser = {
  //         uid,
  //         id: uid,
  //         name,
  //         email,
  //         role,
  //         photoUrl: photoURL,
  //         phone,
  //         address,
  //         bornDate,
  //         cc,
  //         city,
  //         country,
  //         isActive: false,
  //         createdAt: Date.now(),
  //     };

  //     await updateProfile(user, { displayName: name });
  //     await setItem(import.meta.env.VITE_COLLECTION_USERS, dataUser);
  //     await signOut(auth);
  // }

  static checkStatus = async (): Promise<IUser | undefined> => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      try {
        const FirestoreUser = await getItemById<IUser>(COLLECTION_USERS, user.uid);
        return FirestoreUser;
      } catch (error) {
        console.warn("Unauthorized, invalid token",error);
        throw new Error("Unauthorized, invalid token");
      }
    }
  };

  static logout = async () => {
    const auth = getAuth();
    await signOut(auth);
  };
}
