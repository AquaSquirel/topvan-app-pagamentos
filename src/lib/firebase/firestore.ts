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
    const studentsCollection = collection(db, STUDENTS_COLLECTION);
    const studentsSnapshot = await getDocs(studentsCollection);
    return studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
};

export const addStudent = async (student: Omit<Student, 'id'>): Promise<string> => {
    const studentsCollection = collection(db, STUDENTS_COLLECTION);
    const docRef = await addDoc(studentsCollection, student);
    return docRef.id;
};

export const updateStudent = async (student: Student): Promise<void> => {
    const studentDoc = doc(db, STUDENTS_COLLECTION, student.id);
    const { id, ...studentData } = student;
    await updateDoc(studentDoc, studentData);
};

export const deleteStudent = async (studentId: string): Promise<void> => {
    const studentDoc = doc(db, STUDENTS_COLLECTION, studentId);
    await deleteDoc(studentDoc);
};

export const resetAllPayments = async (): Promise<void> => {
    const batch = writeBatch(db);
    const studentsCollection = collection(db, STUDENTS_COLLECTION);
    const q = query(studentsCollection);
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        batch.update(doc.ref, { statusPagamento: 'Pendente' });
    });

    await batch.commit();
};


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
