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
    deleteField,
    limit
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

export const addReturnTrip = async (idaTripId: string, idaDestino: string, dataVolta: string): Promise<string> => {
    const tripsCollection = collection(db, TRIPS_COLLECTION);
    const returnTrip: Omit<Trip, 'id'> = {
        destino: `Volta de ${idaDestino}`,
        data: dataVolta,
        valor: 0,
        statusPagamento: 'Pendente' as const,
        isReturnTrip: true,
        temVolta: false,
        idaTripId: idaTripId
    };
    const docRef = await addDoc(tripsCollection, returnTrip);
    return docRef.id;
}

export const getReturnTrip = async (idaTripId: string): Promise<Trip | null> => {
    const q = query(
        collection(db, TRIPS_COLLECTION),
        where('idaTripId', '==', idaTripId),
        limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Trip;
};

export const updateTrip = async (trip: Partial<Trip> & { id: string }): Promise<void> => {
    const tripDoc = doc(db, TRIPS_COLLECTION, trip.id);
    const { id, ...tripData } = trip;
    await updateDoc(tripDoc, tripData);
};

export const deleteTrip = async (tripId: string): Promise<void> => {
    // Also delete associated return trip if it exists
    const returnTrip = await getReturnTrip(tripId);
    if(returnTrip) {
        const returnTripDoc = doc(db, TRIPS_COLLECTION, returnTrip.id);
        await deleteDoc(returnTripDoc);
    }
    const tripDoc = doc(db, TRIPS_COLLECTION, tripId);
    await deleteDoc(tripDoc);
};

export const archivePaidTrips = async (): Promise<void> => {
    const batch = writeBatch(db);
    const tripsCollection = collection(db, TRIPS_COLLECTION);
    const q = query(tripsCollection, where('statusPagamento', '==', 'Pago'));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        batch.update(doc.ref, { statusPagamento: 'Arquivado' });
    });

    await batch.commit();
};
