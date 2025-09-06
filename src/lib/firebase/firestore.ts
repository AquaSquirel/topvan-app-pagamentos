import { db } from '@/lib/firebase/config';
import type { Student, Institution } from '@/lib/types';
import { 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc,
    writeBatch,
    query
} from 'firebase/firestore';

const STUDENTS_COLLECTION = 'students';
const INSTITUTIONS_COLLECTION = 'institutions';

// Student functions
export const getStudents = async (): Promise<Student[]> => {
    const q = query(collection(db, STUDENTS_COLLECTION));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
};

export const addStudent = async (student: Omit<Student, 'id'>): Promise<string> => {
    const docRef = await addDoc(collection(db, STUDENTS_COLLECTION), student);
    return docRef.id;
};

export const updateStudent = async (student: Student): Promise<void> => {
    const { id, ...studentData } = student;
    const studentRef = doc(db, STUDENTS_COLLECTION, id);
    await updateDoc(studentRef, studentData);
};

export const deleteStudent = async (studentId: string): Promise<void> => {
    const studentRef = doc(db, STUDENTS_COLLECTION, studentId);
    await deleteDoc(studentRef);
};

export const toggleStudentPayment = async (student: Student): Promise<void> => {
    const studentRef = doc(db, STUDENTS_COLLECTION, student.id);
    const newStatus = student.statusPagamento === 'Pago' ? 'Pendente' : 'Pago';
    await updateDoc(studentRef, { statusPagamento: newStatus });
};

export const resetAllPayments = async (): Promise<void> => {
    const studentsRef = collection(db, STUDENTS_COLLECTION);
    const querySnapshot = await getDocs(studentsRef);
    const batch = writeBatch(db);
    querySnapshot.docs.forEach(document => {
        batch.update(document.ref, { statusPagamento: 'Pendente' });
    });
    await batch.commit();
};


// Institution functions
export const getInstitutions = async (): Promise<Institution[]> => {
    const q = query(collection(db, INSTITUTIONS_COLLECTION));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Institution));
};

export const addInstitution = async (name: string): Promise<string> => {
    const docRef = await addDoc(collection(db, INSTITUTIONS_COLLECTION), { name });
    return docRef.id;
};

export const deleteInstitution = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, INSTITUTIONS_COLLECTION, id));
};
