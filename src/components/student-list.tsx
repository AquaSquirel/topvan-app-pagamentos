'use client';

import type { Student, Institution } from '@/lib/types';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Sun, Moon } from 'lucide-react';
import StudentCard from '@/components/student-card';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface StudentListProps {
  shift: 'Manhã' | 'Noite';
  students: Student[];
  institutions: Institution[];
  onOpenAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onTogglePayment: (studentId: string) => void;
}

const StudentList: React.FC<StudentListProps> = ({
  shift,
  students,
  institutions,
  onOpenAddStudent,
  onEditStudent,
  onDeleteStudent,
  onTogglePayment,
}) => {
  const shiftIcon = shift === 'Manhã' 
    ? <Sun className="h-6 w-6 text-primary" /> 
    : <Moon className="h-6 w-6 text-primary" />;

  return (
    <Card className="bg-card border-none shadow-none">
       <CardHeader className="flex-row items-center justify-between p-2 mb-4">
        <div className="flex items-center gap-3">
            {shiftIcon}
            <CardTitle className="text-2xl font-semibold">
                Turma da {shift}
            </CardTitle>
        </div>
        <span className="text-lg font-normal text-muted-foreground">({students.length} alunos)</span>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-3">
          {students.length > 0 ? (
            students.map(student => (
              <StudentCard
                key={student.id}
                student={student}
                institutionName={institutions.find(i => i.id === student.institutionId)?.name || 'N/A'}
                onEdit={() => onEditStudent(student)}
                onDelete={() => onDeleteStudent(student.id)}
                onTogglePayment={() => onTogglePayment(student.id)}
              />
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhum aluno cadastrado nesta turma.</p>
          )}
        </div>
         <Button onClick={onOpenAddStudent} className="w-full mt-6">
            <Plus className="mr-2 h-4 w-4" /> Adicionar Aluno
        </Button>
      </CardContent>
    </Card>
  );
};

export default StudentList;
