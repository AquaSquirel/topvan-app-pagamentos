'use client';

import type { Student } from '@/lib/types';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Info } from 'lucide-react';
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
    <div className="bg-card rounded-lg border p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-lg">{student.name}</p>
          <p className="text-sm text-muted-foreground">{institutionName}</p>
        </div>
        <div className="text-right">
             <span className="font-semibold text-base">{formatCurrency(student.valorMensalidade)}</span>
             <Badge variant={student.statusPagamento === 'Pago' ? 'default' : 'destructive'} className={`mt-1 text-xs ${student.statusPagamento === 'Pago' ? 'bg-green-600' : 'bg-red-600'}`}>
                {student.statusPagamento}
            </Badge>
        </div>
      </div>
      
      {student.observacoes && (
        <div className="border-t border-border pt-3">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
             <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>{student.observacoes}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={onTogglePayment} variant="outline" className="flex-1">
          {student.statusPagamento === 'Pago' ? 'Marcar como Pendente' : 'Confirmar Pagamento'}
        </Button>
        <div className="flex gap-2">
            <Button onClick={onEdit} variant="secondary" size="icon">
                <Edit />
                <span className="sr-only">Editar</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                    <Trash2 />
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
  );
};

export default StudentCard;
