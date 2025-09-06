'use client';

import type { Student, Institution } from '@/lib/types';
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Plus, Sun, Moon } from 'lucide-react';
import StudentCard from '@/components/student-card';
import { Card, CardContent, CardHeader } from './ui/card';

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
    <Card className="bg-card">
      <CardHeader>
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1" className="border-b-0">
            <AccordionTrigger className="hover:no-underline text-2xl font-semibold">
              <div className="flex items-center gap-3">
                {shiftIcon}
                <h2>Turma da {shift}</h2>
                <span className="text-lg font-normal text-muted-foreground">({students.length})</span>
              </div>
            </AccordionTrigger>
             <AccordionContent>
                <div className="space-y-3 mt-4">
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
                    <p className="text-muted-foreground text-center py-4">Nenhum aluno cadastrado nesta turma.</p>
                  )}
                </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardHeader>
      <CardContent>
         <Button onClick={onOpenAddStudent} className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Adicionar Aluno
        </Button>
      </CardContent>
    </Card>
  );
};

export default StudentList;
