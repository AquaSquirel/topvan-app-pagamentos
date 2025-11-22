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
    limit,
    getDoc
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
    
    // After creating the trip, update it with its own ID to be self-referential for ida trips.
    await updateDoc(docRef, { idaTripId: docRef.id });

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
    if (!idaTripId) return null;
    const q = query(
        collection(db, TRIPS_COLLECTION),
        where('idaTripId', '==', idaTripId),
        where('isReturnTrip', '==', true),
        limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Trip;
};


export const updateTrip = async (tripUpdateData: Partial<Trip> & { id: string }): Promise<void> => {
    const tripDocRef = doc(db, TRIPS_COLLECTION, tripUpdateData.id);
    const { id, ...tripData } = tripUpdateData;

    // If temVolta is explicitly false, ensure dataVolta is removed.
    if (tripData.temVolta === false) {
        tripData.dataVolta = deleteField() as any;
    }

    await updateDoc(tripDocRef, tripData);
};


export const deleteTrip = async (tripId: string): Promise<void> => {
    const tripDocRef = doc(db, TRIPS_COLLECTION, tripId);
    const tripSnapshot = await getDoc(tripDocRef);
    const tripData = tripSnapshot.data() as Trip;

    // Scenario 1: Deleting an outbound trip (ida) that HAS a return trip
    if (tripData && tripData.idaTripId === tripId && tripData.temVolta) {
        const returnTrip = await getReturnTrip(tripId);
        if (returnTrip) {
            const returnTripDocRef = doc(db, TRIPS_COLLECTION, returnTrip.id);
            await deleteDoc(returnTripDocRef);
        }
    }
    // Scenario 2: Deleting a return trip (volta)
    else if (tripData && tripData.isReturnTrip && tripData.idaTripId) {
        const idaTripDocRef = doc(db, TRIPS_COLLECTION, tripData.idaTripId);
        // Update the outbound trip to remove the return link
        await updateDoc(idaTripDocRef, {
            temVolta: false,
            dataVolta: deleteField()
        });
    }

    // Finally, delete the trip itself
    await deleteDoc(tripDocRef);
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
