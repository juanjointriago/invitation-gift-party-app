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

  static signUp = async (signUpUser: Omit<IUser, 'id' | 'createdAt' | 'lastLogin'>): Promise<{ isAuthenticated: boolean; message: string }> => {
    const {
      email,
      password,
      name,
      role,
      address,
      cc,
      phone,
      city,
      country,
    } = signUpUser;
    console.debug("SignUp User Data:", { email, password });
    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password!
      );
      if (userCredential) {
        const { photoURL, uid } = userCredential.user;
        console.debug({userCredential});
        const dataUser:IUser = {
          id: uid,
          name,
          lastName: '',
          email,
          role,
          photoURL: photoURL || '',
          phone,
          address,
          // birthDate: signUpUser.birthDate,
          cc,
          city,
          country,
          isActive: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastLogin: Date.now(),
        };
        await updateProfile(userCredential.user, { displayName: name });
        console.log('colecion de usuarios 😎 ', COLLECTION_USERS);
        await setItem(COLLECTION_USERS, dataUser);
        //Add preffered info and Total fee for user
        await signOut(auth);
        return { isAuthenticated: true, message: 'Registro completo: Su cuenta se encuentra en proceso de activación' };
      }
      return { isAuthenticated: false, message: 'No se pudo registrar el usuario' };
    } catch (error: any) {
      console.warn('Error al registrar el usuario',{error})
      await signOut(auth);
      return { isAuthenticated: false, message: `Error al registrar usuario: ${error.message}` };
    }
  };
  /**
   * @description Login with Google and set on user collection if not exists if exists continue
   * @param action
   * @returns
   */
  static googleSignUpLogin = async (): Promise<{ user?: IUser; isAuthenticated:boolean; message: string }> => {
    const auth = getAuth();
    const googleAuthProvider = new GoogleAuthProvider();
    googleAuthProvider.setCustomParameters({
      prompt: "select_account ",
    });

    try {
      const { user } = await signInWithPopup(auth, googleAuthProvider);
      const { uid, email, displayName, photoURL } = user;
      const firebaseUser = await getItemById<IUser>(COLLECTION_USERS, uid);
      if (!firebaseUser?.id) {
        const dataUser:IUser = {
          id: uid,
          name: displayName || '',
          lastName: "",
          email: email || '',
          role: "guest",
          password: firebaseUser.password || '',    
          photoURL: photoURL || '',
          phone: "",
          address: "",
          birthDate: 0,
          cc: "",
          city: "",
          country: "",
          isActive: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await setItem(COLLECTION_USERS, dataUser);
        await signOut(auth);
        return { isAuthenticated: true, message: 'Registro completo: Su cuenta se encuentra en proceso de activación' };
      }
      if (!firebaseUser.isActive) {
        await signOut(auth);
        return { isAuthenticated: false, message: 'Su usuario está en proceso de aprobación' };
      }
      return { isAuthenticated: true, user: firebaseUser, message: `Bienvenido ${firebaseUser.name}` };
    } catch (error: any) {
      console.debug({ error });
      return { isAuthenticated: false, message: `Error al iniciar sesión con GOOGLE: ${error.message}` };
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
