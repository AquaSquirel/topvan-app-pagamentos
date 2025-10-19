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
    writeBatch,
    updateDoc
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

export const resetGeneralExpenses = async (): Promise<void> => {
    const batch = writeBatch(db);
    const expensesCollection = collection(db, GENERAL_EXPENSES_COLLECTION);
    const querySnapshot = await getDocs(expensesCollection);
    
    querySnapshot.forEach(doc => {
        const expense = doc.data() as GeneralExpense;
        if (expense.totalInstallments && expense.currentInstallment) {
            if (expense.currentInstallment < expense.totalInstallments) {
                // Increment installment
                batch.update(doc.ref, { currentInstallment: expense.currentInstallment + 1 });
            } else {
                // Last installment paid, delete it
                batch.delete(doc.ref);
            }
        } else {
            // Not an installment, delete it
            batch.delete(doc.ref);
        }
    });

    await batch.commit();
};
