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
    writeBatch
} from 'firebase/firestore';

const TRIPS_COLLECTION = 'trips';

export const getTrips = async (): Promise<Trip[]> => {
    const tripsCollection = collection(db, TRIPS_COLLECTION);
    const q = query(tripsCollection, orderBy('data', 'desc'));
    const tripsSnapshot = await getDocs(q);
    return tripsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trip));
};

export const addTrip = async (trip: Omit<Trip, 'id'>): Promise<string> => {
    const tripsCollection = collection(db, TRIPS_COLLECTION);
    const docRef = await addDoc(tripsCollection, trip);
    return docRef.id;
};

export const updateTrip = async (trip: Trip): Promise<void> => {
    const tripDoc = doc(db, TRIPS_COLLECTION, trip.id);
    const { id, ...tripData } = trip;
    await updateDoc(tripDoc, tripData);
};

export const deleteTrip = async (tripId: string): Promise<void> => {
    const tripDoc = doc(db, TRIPS_COLLECTION, tripId);
    await deleteDoc(tripDoc);
};
