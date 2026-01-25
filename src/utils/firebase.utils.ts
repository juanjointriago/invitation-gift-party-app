import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where, type DocumentData, type WhereFilterOp } from "firebase/firestore";
import { db } from "../db/initialize";

export const addItem = async (collectionName:string, data: DocumentData) => {
    try {
        const docRef = await addDoc(collection(db, collectionName), {data});
        console.debug(`Document added With ID: ${docRef.id}`);
    } catch (error) {
        console.warn("Error adding document: ", {error});
    }
}

export const getItemById = async<T>(collectionName:string, id:string)=>{
    try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        if(docSnap.exists()){
            return { id:docSnap.id, ...docSnap.data() } as T;
        }else {
            return {} as T
        }
    } catch (error) {
        console.warn("Error getting document: ", {error});
    }
}


export const updateItem = async (collectionName:string, data:DocumentData) => {
    console.debug(`Updating document in ${collectionName} with ID: ${data.id}`);
    return await updateDoc(doc(db, collectionName, data.id), data);
}

export const deleteItem = async (collectionName:string, id:string)=>{
    console.debug(`Deleting document in ${collectionName} with ID: ${id}`);
    return await deleteDoc(doc(db, collectionName, id));
}

export const getDocsFromCollection = async <T>(collectionName: string): Promise<T[]> => {
    try {
        const data: T[] = [];
        const querySnapshot = await getDocs(collection(db, collectionName));
        querySnapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() } as T);
        });
        return data;
    } catch (error) {
        console.warn("Error getting documents: ", { error });
        throw error;
    }
};

export const setItem = async (collectionName: string, data: DocumentData) => {
    try {
        const docRef = await addDoc(collection(db, collectionName), data);
        console.debug(`Document added with ID: ${docRef.id}`);
        return { id: docRef.id, ...data };
    } catch (error) {
        console.warn("Error adding document: ", { error });
        throw error;
    }
};

export const getDocsFromCollectionQuery = async <T>(collectionName:string, field: string, clause: WhereFilterOp, compareValue:string|number| boolean) => {
    try {
        const data: T[] = [];
        const q = query(collection(db, collectionName), where(field, clause, compareValue));
        const querySnapShot = await getDocs(q);
        querySnapShot.forEach((doc)=>{
            data.push({id:doc.id, ...doc.data()} as T);
        })
        return data
    } catch (error) {
        console.warn("Error getting documents: ", {error});
    }
}