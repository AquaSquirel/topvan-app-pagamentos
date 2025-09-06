'use client';

import type { Student } from '@/lib/types';
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface StudentCardProps {
  student: Student;
  institutionName: string;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePayment: () => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, institutionName, onEdit, onDelete, onTogglePayment }) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="bg-background/50 rounded-lg border">
      <Accordion type="single" collapsible>
        <AccordionItem value={student.id} className="border-b-0">
          <AccordionTrigger className="p-4 hover:no-underline">
            <div className="flex justify-between items-center w-full">
              <div className="text-left">
                <p className="font-semibold text-lg">{student.name}</p>
                <p className="text-sm text-muted-foreground">{institutionName}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-base">{formatCurrency(student.valorMensalidade)}</span>
                <Badge variant={student.statusPagamento === 'Pago' ? 'default' : 'destructive'} className={student.statusPagamento === 'Pago' ? 'bg-green-600' : 'bg-red-600'}>
                  {student.statusPagamento}
                </Badge>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-0">
            <div className="border-t border-border pt-4 mt-2">
              {student.observacoes && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-1">Observações:</h4>
                  <p className="text-sm text-muted-foreground">{student.observacoes}</p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={onTogglePayment} variant="outline" className="flex-1">
                  {student.statusPagamento === 'Pago' ? 'Marcar como Pendente' : 'Confirmar Pagamento'}
                </Button>
                <div className="flex gap-2">
                    <Button onClick={onEdit} variant="secondary" size="icon">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Aluno?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Você tem certeza que deseja excluir o cadastro de {student.name}? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={onDelete}>Sim, excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default StudentCard;
