import { db } from '@/lib/firebase/config';
import type { Student } from '@/lib/types';
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
