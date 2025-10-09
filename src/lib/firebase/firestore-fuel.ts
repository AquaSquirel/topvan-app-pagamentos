import { db } from '@/lib/firebase/config';
import type { FuelExpense } from '@/lib/types';
import { 
    collection, 
    getDocs, 
    addDoc, 
    deleteDoc, 
    doc,
    query,
    orderBy
} from 'firebase/firestore';

const FUEL_EXPENSES_COLLECTION = 'fuelExpenses';

export const getFuelExpenses = async (): Promise<FuelExpense[]> => {
    const expensesCollection = collection(db, FUEL_EXPENSES_COLLECTION);
    const q = query(expensesCollection, orderBy('data', 'desc'));
    const expensesSnapshot = await getDocs(q);
    return expensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FuelExpense));
};

export const addFuelExpense = async (expense: Omit<FuelExpense, 'id'>): Promise<string> => {
    const expensesCollection = collection(db, FUEL_EXPENSES_COLLECTION);
    const docRef = await addDoc(expensesCollection, expense);
    return docRef.id;
};

export const deleteFuelExpense = async (expenseId: string): Promise<void> => {
    const expenseDoc = doc(db, FUEL_EXPENSES_COLLECTION, expenseId);
    await deleteDoc(expenseDoc);
};
