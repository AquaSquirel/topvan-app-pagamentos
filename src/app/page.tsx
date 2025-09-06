'use client';

import type { Student, Institution } from '@/lib/types';
import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Dashboard from '@/components/dashboard';
import StudentList from '@/components/student-list';
import InstitutionManager from '@/components/institution-manager';
import { StudentForm } from '@/components/student-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const initialInstitutions: Institution[] = [
  { id: '1', name: 'Universidade Federal' },
  { id: '2', name: 'Instituto Politécnico' },
  { id: '3', name: 'Escola Técnica Estadual' },
];

const initialStudents: Student[] = [
    { id: '1', name: 'Ana Silva', institutionId: '1', valorMensalidade: 450, observacoes: 'Ponto de encontro: portão principal.', statusPagamento: 'Pago', turno: 'Manhã' },
    { id: '2', name: 'Bruno Costa', institutionId: '2', valorMensalidade: 450, observacoes: '', statusPagamento: 'Pendente', turno: 'Manhã' },
    { id: '3', name: 'Carlos Dias', institutionId: '1', valorMensalidade: 400, observacoes: 'Sai 30 minutos mais cedo às sextas.', statusPagamento: 'Pago', turno: 'Noite' },
    { id: '4', name: 'Daniela Faria', institutionId: '3', valorMensalidade: 400, observacoes: '', statusPagamento: 'Pendente', turno: 'Noite' },
    { id: '5', name: 'Eduardo Martins', institutionId: '2', valorMensalidade: 400, observacoes: '', statusPagamento: 'Pago', turno: 'Noite' },
];

export default function Home() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [institutions, setInstitutions] = useState<Institution[]>(initialInstitutions);
  const [showValues, setShowValues] = useState(false);
  
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [defaultShift, setDefaultShift] = useState<'Manhã' | 'Noite'>('Manhã');

  const handleAddStudent = (student: Omit<Student, 'id'>) => {
    setStudents(prev => [...prev, { ...student, id: crypto.randomUUID() }]);
  };

  const handleUpdateStudent = (student: Student) => {
    setStudents(prev => prev.map(s => s.id === student.id ? student : s));
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };

  const handleTogglePayment = (studentId: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, statusPagamento: s.statusPagamento === 'Pago' ? 'Pendente' : 'Pago' } : s));
  };

  const handleResetAllPayments = () => {
    setStudents(prev => prev.map(s => ({ ...s, statusPagamento: 'Pendente' })));
  };

  const handleAddInstitution = (name: string) => {
    if (name && !institutions.some(i => i.name.toLowerCase() === name.toLowerCase())) {
        setInstitutions(prev => [...prev, { id: crypto.randomUUID(), name }]);
    }
  };

  const handleDeleteInstitution = (id: string) => {
    setInstitutions(prev => prev.filter(i => i.id !== id));
  };
  
  const openStudentForm = useCallback((shift: 'Manhã' | 'Noite', student: Student | null = null) => {
    setEditingStudent(student);
    setDefaultShift(shift);
    setIsStudentFormOpen(true);
  }, []);

  const morningStudents = useMemo(() => students
    .filter(s => s.turno === 'Manhã')
    .sort((a, b) => a.name.localeCompare(b.name)), [students]);

  const nightStudents = useMemo(() => students
    .filter(s => s.turno === 'Noite')
    .sort((a, b) => a.name.localeCompare(b.name)), [students]);

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <Dashboard 
          students={students}
          showValues={showValues}
          onToggleShowValues={() => setShowValues(prev => !prev)}
          onResetAllPayments={handleResetAllPayments}
        />

        <Tabs defaultValue="manha" className="mt-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manha">Manhã</TabsTrigger>
            <TabsTrigger value="noite">Noite</TabsTrigger>
          </TabsList>
          <TabsContent value="manha">
            <StudentList 
              shift="Manhã" 
              students={morningStudents} 
              institutions={institutions}
              onOpenAddStudent={() => openStudentForm('Manhã')}
              onEditStudent={(student) => openStudentForm('Manhã', student)}
              onDeleteStudent={handleDeleteStudent}
              onTogglePayment={handleTogglePayment}
            />
          </TabsContent>
          <TabsContent value="noite">
            <StudentList 
              shift="Noite" 
              students={nightStudents} 
              institutions={institutions}
              onOpenAddStudent={() => openStudentForm('Noite')}
              onEditStudent={(student) => openStudentForm('Noite', student)}
              onDeleteStudent={handleDeleteStudent}
              onTogglePayment={handleTogglePayment}
            />
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 flex justify-center">
            <InstitutionManager 
                institutions={institutions} 
                onAddInstitution={handleAddInstitution}
                onDeleteInstitution={handleDeleteInstitution}
            />
        </div>

        <StudentForm
          isOpen={isStudentFormOpen}
          setIsOpen={setIsStudentFormOpen}
          student={editingStudent}
          institutions={institutions}
          onAddStudent={handleAddStudent}
          onUpdateStudent={handleUpdateStudent}
          defaultShift={defaultShift}
        />
      </main>
    </div>
  );
}
