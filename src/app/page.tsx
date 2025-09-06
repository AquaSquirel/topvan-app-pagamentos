'use client';

import type { Student, Institution } from '@/lib/types';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Dashboard from '@/components/dashboard';
import StudentList from '@/components/student-list';
import { StudentForm } from '@/components/student-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  getStudents, addStudent, updateStudent, deleteStudent, resetAllPayments,
  getInstitutions, addInstitution, deleteInstitution
} from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showValues, setShowValues] = useState(false);
  
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [defaultShift, setDefaultShift] = useState<'Manhã' | 'Noite'>('Manhã');

  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [studentsData, institutionsData] = await Promise.all([
        getStudents(),
        getInstitutions()
      ]);
      setStudents(studentsData);
      setInstitutions(institutionsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Erro ao carregar dados", description: "Não foi possível buscar os dados do banco de dados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddStudent = async (studentData: Omit<Student, 'id'>) => {
    try {
      const id = await addStudent(studentData);
      setStudents(prev => [...prev, { ...studentData, id }]);
      toast({ title: "Sucesso!", description: "Aluno adicionado." });
    } catch(e) {
      toast({ title: "Erro", description: "Não foi possível adicionar o aluno.", variant: "destructive" });
    }
  };

  const handleUpdateStudent = async (student: Student) => {
    try {
      await updateStudent(student);
      setStudents(prev => prev.map(s => s.id === student.id ? student : s));
      toast({ title: "Sucesso!", description: "Dados do aluno atualizados." });
    } catch(e) {
      toast({ title: "Erro", description: "Não foi possível atualizar o aluno.", variant: "destructive" });
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await deleteStudent(studentId);
      setStudents(prev => prev.filter(s => s.id !== studentId));
      toast({ title: "Sucesso!", description: "Aluno excluído." });
    } catch(e) {
      toast({ title: "Erro", description: "Não foi possível excluir o aluno.", variant: "destructive" });
    }
  };

  const handleTogglePayment = async (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const newStatus = student.statusPagamento === 'Pago' ? 'Pendente' : 'Pago';
    try {
        await updateStudent({ ...student, statusPagamento: newStatus });
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, statusPagamento: newStatus } : s));
    } catch (e) {
        toast({ title: "Erro", description: "Não foi possível alterar o status de pagamento.", variant: "destructive" });
    }
  };

  const handleResetAllPayments = async () => {
    try {
      await resetAllPayments();
      setStudents(prev => prev.map(s => ({ ...s, statusPagamento: 'Pendente' })));
      toast({ title: "Sucesso!", description: "Todos os pagamentos foram zerados." });
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível zerar os pagamentos.", variant: "destructive" });
    }
  };

  const handleAddInstitution = async (name: string) => {
    if (name && !institutions.some(i => i.name.toLowerCase() === name.toLowerCase())) {
      try {
        const id = await addInstitution(name);
        setInstitutions(prev => [...prev, { id, name }]);
        toast({ title: "Sucesso!", description: "Instituição adicionada." });
      } catch (e) {
        toast({ title: "Erro", description: "Não foi possível adicionar a instituição.", variant: "destructive" });
      }
    }
  };

  const handleDeleteInstitution = async (id: string) => {
    try {
      await deleteInstitution(id);
      setInstitutions(prev => prev.filter(i => i.id !== id));
      toast({ title: "Sucesso!", description: "Instituição excluída." });
    } catch(e) {
      toast({ title: "Erro", description: "Não foi possível excluir a instituição.", variant: "destructive" });
    }
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
          institutions={institutions} 
          onAddInstitution={handleAddInstitution}
          onDeleteInstitution={handleDeleteInstitution}
        />

        {loading ? (
          <div className="mt-8 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
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
        )}
        
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
