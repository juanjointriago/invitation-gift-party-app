import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
    apiKey: import.meta.env.VITE_APIKEY,
    authDomain: import.meta.env.VITE_AUTHDOMAIN,
    projectId: import.meta.env.VITE_PROJECTID,
    storageBucket: import.meta.env.VITE_STORAGEBUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID,
    appId: import.meta.env.VITE_APPID,
    measurementId: import.meta.env.VITE_MEASUREMENTID,
}

//firebase initApp


// console.debug('✅',import.meta.env.VITE_APIKEY)
// console.debug('✅',import.meta.env.VITE_AUTHDOMAIN)
// console.debug('✅',import.meta.env.VITE_PROJECTID)
// console.debug('✅',import.meta.env.VITE_STORAGEBUCKET)

const app = initializeApp(firebaseConfig);
const db =  getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

const googleAuthProvider = new GoogleAuthProvider();


export { db, auth, googleAuthProvider, storage };
