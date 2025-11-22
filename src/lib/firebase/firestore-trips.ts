'use client';
import { db } from '@/lib/firebase/config';
import type { Trip } from '@/lib/types';
import { 
    collection, 
    getDocs, 
    addDoc, 
    deleteDoc, 
    doc,
    updateDoc,
    orderBy,
    query,
    writeBatch,
    where,
    deleteField
} from 'firebase/firestore';

const TRIPS_COLLECTION = 'trips';

export const getTrips = async (): Promise<Trip[]> => {
    const tripsCollection = collection(db, TRIPS_COLLECTION);
    const q = query(tripsCollection, orderBy('data', 'desc'));
    const tripsSnapshot = await getDocs(q);
    return tripsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trip));
};

export const addTrip = async (trip: Omit<Trip, 'id' | 'statusPagamento'>): Promise<string> => {
    const tripsCollection = collection(db, TRIPS_COLLECTION);
    const newTrip = { ...trip, statusPagamento: 'Pendente' as const };
    const docRef = await addDoc(tripsCollection, newTrip);
    return docRef.id;
};

export const addReturnTrip = async (idaDestino: string, dataVolta: string): Promise<string> => {
    const tripsCollection = collection(db, TRIPS_COLLECTION);
    const returnTrip = {
        destino: `Volta de ${idaDestino}`,
        data: dataVolta,
        valor: 0,
        statusPagamento: 'Pendente' as const,
        isReturnTrip: true,
        temVolta: false,
    };
    const docRef = await addDoc(tripsCollection, returnTrip);
    return docRef.id;
}

export const updateTrip = async (trip: Trip): Promise<void> => {
    const tripDoc = doc(db, TRIPS_COLLECTION, trip.id);
    const { id, ...tripData } = trip;
    
    const dataToUpdate: { [key: string]: any } = { ...tripData };

    if (dataToUpdate.temVolta === false) {
        dataToUpdate.dataVolta = deleteField();
    }

    await updateDoc(tripDoc, dataToUpdate);
};

export const deleteTrip = async (tripId: string): Promise<void> => {
    const tripDoc = doc(db, TRIPS_COLLECTION, tripId);
    await deleteDoc(tripDoc);
};

export const archivePaidTrips = async (): Promise<void> => {
    const batch = writeBatch(db);
    const tripsCollection = collection(db, TRIPS_COLlection);
    const q = query(tripsCollection, where('statusPagamento', '==', 'Pago'));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        batch.update(doc.ref, { statusPagamento: 'Arquivado' });
    });

    await batch.commit();
};
