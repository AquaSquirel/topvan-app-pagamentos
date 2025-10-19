import { db } from '@/lib/firebase/config';
import type { GeneralExpense } from '@/lib/types';
import { 
    collection, 
    getDocs, 
    addDoc, 
    deleteDoc, 
    doc,
    query,
    orderBy,
    writeBatch
} from 'firebase/firestore';

const GENERAL_EXPENSES_COLLECTION = 'generalExpenses';

export const getGeneralExpenses = async (): Promise<GeneralExpense[]> => {
    const expensesCollection = collection(db, GENERAL_EXPENSES_COLLECTION);
    const q = query(expensesCollection, orderBy('data', 'desc'));
    const expensesSnapshot = await getDocs(q);
    return expensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GeneralExpense));
};

export const addGeneralExpense = async (expense: Omit<GeneralExpense, 'id'>): Promise<string> => {
    const expensesCollection = collection(db, GENERAL_EXPENSES_COLLECTION);
    const docRef = await addDoc(expensesCollection, expense);
    return docRef.id;
};

export const deleteGeneralExpense = async (expenseId: string): Promise<void> => {
    const expenseDoc = doc(db, GENERAL_EXPENSES_COLLECTION, expenseId);
    await deleteDoc(expenseDoc);
};

export const deleteAllGeneralExpenses = async (): Promise<void> => {
    const batch = writeBatch(db);
    const expensesCollection = collection(db, GENERAL_EXPENSES_COLLECTION);
    const querySnapshot = await getDocs(expensesCollection);
    querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
};
