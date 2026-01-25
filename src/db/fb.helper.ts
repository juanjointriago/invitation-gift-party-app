import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from "firebase/firestore";
import type {  DocumentData,  WhereFilterOp } from "firebase/firestore"
import { db } from "./initialize";

// eslint-disable-next-line @typescript-eslint/no-explicit-any

/**
 * @description Add a new item
 * @param collectionName 
 * @param data 
 * @returns 
 */
export const adddItem = async (collectionName: string, data: DocumentData) => {
    try {
        const docRef = await addDoc(collection(db, collectionName), { data })
        console.debug('Document written with ID: ', docRef.id);
    } catch (error) {
        console.warn("Error adding document: ", error)

    }
}

/**
 * @description Set a new item
 * @param collectionName 
 * @param data 
 * @returns 
 */
export const setItem = async (collectionName: string, data: DocumentData) => {
    if(!collectionName || !data || !data.id) throw new Error('CollectionName, data y data.id son requeridos');
    return await setDoc(doc(db, collectionName, data.id), data)
}


export const updateItem = async (collectionName: string, data: DocumentData) => {
    return await updateDoc(doc(db, collectionName, data.id), data);
    // return await setDoc(doc(db, collectionName, data.uid), data);

}

export const deleteItem = async (collectionName: string, id: string) => {
    return await deleteDoc(doc(db, collectionName, id))
}

export const getDocsFromCollection = async <T>(collectionName: string) => {
    const data: T[] = [];
    (await getDocs(collection(db, collectionName))).forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as T)
        // data.push({ ...doc.data() } as T)

    });
    return data
}

export const getDocsFromCollectionQuery = async <T>(collectionName: string, field: string, clausule: WhereFilterOp, compareValue: string | number | boolean) => {
    const data: T[] = [];
    const q = query(collection(db, collectionName), where(field, clausule, compareValue));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as T)
        // data.push({ ...doc.data() } as T)

    });
    return data
}


/**
 * 
 * @param collectionName 
 * @param id 
 * @returns 
 */
export const getItemById = async <T>(collectionName: string, id: string) => {

    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    // console.debug('Document data:', `${collectionName}`, docSnap.data());
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T
    }
    else {
        return {} as T;
    }

}

export const listenItemById = <T>(
    collectionName: string,
    id: string,
    onData: (data: T | null) => void,
    onError?: (error: unknown) => void
) => {
    const docRef = doc(db, collectionName, id);
    return onSnapshot(
        docRef,
        (docSnap) => {
            if (docSnap.exists()) {
                onData({ id: docSnap.id, ...docSnap.data() } as T);
            } else {
                onData(null);
            }
        },
        (error) => {
            console.warn('listenItemById error:', error);
            onError?.(error);
        }
    );
};

interface email {
    to: string[],
    message: {
        subject: string,
        text: string,
        html: string
    }
}

export const sendCustomEmail = async (dataForSend: email) => {
    const message: email = dataForSend;
    try {
        await addDoc(collection(db, 'mail'), message)
        console.debug('Sending 📧 => ', { message });
    } catch (error) {
        console.warn("Error adding document: ", error)

    }

}

export const footerMail =`
<table width="100%" style="max-width:640px;">
    <tr>
        <td>
        <a href="">
        <p> © 2025 Good Dental </p>
                <img width="40%" src=''/>
            </a>
        </td>
    </tr>
    <tr>
        <td>
        <a href="">
        <p><small>Creado por: Purple-Widget - Software a medida - +(593)987357965</small></p>
                <img style="max-width:20%;height:auto;" src=''/>
            </a>
        </td>
    </tr>
</table>`