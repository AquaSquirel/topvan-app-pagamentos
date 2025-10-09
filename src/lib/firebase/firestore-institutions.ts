import { db } from '@/lib/firebase/config';
import type { Institution } from '@/lib/types';
import { 
    collection, 
    getDocs, 
    addDoc, 
    deleteDoc, 
    doc,
} from 'firebase/firestore';

const INSTITUTIONS_COLLECTION = 'institutions';

// Institution functions
export const getInstitutions = async (): Promise<Institution[]> => {
    const institutionsCollection = collection(db, INSTITUTIONS_COLLECTION);
    const institutionsSnapshot = await getDocs(institutionsCollection);
    return institutionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Institution));
};

export const addInstitution = async (name: string): Promise<string> => {
    const institutionsCollection = collection(db, INSTITUTIONS_COLLECTION);
    const docRef = await addDoc(institutionsCollection, { name });
    return docRef.id;
};

export const deleteInstitution = async (id: string): Promise<void> => {
    const institutionDoc = doc(db, INSTITUTIONS_COLLECTION, id);
    await deleteDoc(institutionDoc);
};
