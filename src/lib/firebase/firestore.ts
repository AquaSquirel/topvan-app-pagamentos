// import { db } from '@/lib/firebase/config';
import type { Student, Institution } from '@/lib/types';
// import { 
//     collection, 
//     getDocs, 
//     addDoc, 
//     updateDoc, 
//     deleteDoc, 
//     doc,
//     writeBatch,
//     query
// } from 'firebase/firestore';

const STUDENTS_COLLECTION = 'students';
const INSTITUTIONS_COLLECTION = 'institutions';

let institutions: Institution[] = [
    { id: '1', name: 'UNIP' },
    { id: '2', name: 'Anhanguera' },
    { id: '3', name: 'Anhembi Morumbi' },
];

let students: Student[] = [
    { id: '1', name: 'Ana Silva', institutionId: '1', valorMensalidade: 450, observacoes: 'Ponto de encontro: Em frente à padaria.', statusPagamento: 'Pago', turno: 'Manhã' },
    { id: '2', name: 'Bruno Costa', institutionId: '2', valorMensalidade: 450, observacoes: '', statusPagamento: 'Pendente', turno: 'Manhã' },
    { id: '3', name: 'Carlos Dias', institutionId: '1', valorMensalidade: 400, observacoes: 'Deixa na esquina.', statusPagamento: 'Pago', turno: 'Noite' },
];

let nextStudentId = 4;
let nextInstitutionId = 4;


// Student functions
export const getStudents = async (): Promise<Student[]> => {
    return Promise.resolve(students);
};

export const addStudent = async (student: Omit<Student, 'id'>): Promise<string> => {
    const newStudent = { ...student, id: String(nextStudentId++) };
    students.push(newStudent);
    return Promise.resolve(newStudent.id);
};

export const updateStudent = async (student: Student): Promise<void> => {
    students = students.map(s => s.id === student.id ? student : s);
    return Promise.resolve();
};

export const deleteStudent = async (studentId: string): Promise<void> => {
    students = students.filter(s => s.id !== studentId);
    return Promise.resolve();
};

export const toggleStudentPayment = async (student: Student): Promise<void> => {
    const newStatus = student.statusPagamento === 'Pago' ? 'Pendente' : 'Pago';
    students = students.map(s => s.id === student.id ? { ...s, statusPagamento: newStatus } : s);
    return Promise.resolve();
};

export const resetAllPayments = async (): Promise<void> => {
    students = students.map(s => ({ ...s, statusPagamento: 'Pendente' }));
    return Promise.resolve();
};


// Institution functions
export const getInstitutions = async (): Promise<Institution[]> => {
    return Promise.resolve(institutions);
};

export const addInstitution = async (name: string): Promise<string> => {
    const newInstitution = { id: String(nextInstitutionId++), name };
    institutions.push(newInstitution);
    return Promise.resolve(newInstitution.id);
};

export const deleteInstitution = async (id: string): Promise<void> => {
    institutions = institutions.filter(i => i.id !== id);
    return Promise.resolve();
};
