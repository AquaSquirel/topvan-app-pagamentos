'use client';

import type { Student } from '@/lib/types';
import React, from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Info, Check, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

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
    <div className="bg-card rounded-lg border p-4 space-y-4 transition-all">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-semibold text-lg">{student.name}</p>
          <p className="text-sm text-muted-foreground">{institutionName}</p>
          <p className="font-semibold text-base block mt-2">{formatCurrency(student.valorMensalidade)}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
           <Badge 
                variant={student.statusPagamento === 'Pago' ? 'default' : 'destructive'}
                className={cn(
                    "px-3 py-1 text-xs font-bold w-24 justify-center",
                    student.statusPagamento === 'Pago' ? 'bg-green-600' : 'bg-red-600'
                )}
            >
                {student.statusPagamento}
            </Badge>
        </div>
      </div>
      
      <div className="space-y-3">
        {student.observacoes && (
            <div className="pt-2 border-t border-border">
                <div className="flex items-start gap-2 text-sm text-muted-foreground mt-3">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>{student.observacoes}</p>
                </div>
            </div>
        )}

        <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Button 
                onClick={onTogglePayment} 
                variant={student.statusPagamento === 'Pago' ? 'destructive' : 'default'} 
                className={cn(
                    "flex-1 justify-center text-left px-4 py-2 font-bold h-auto text-sm",
                    student.statusPagamento === 'Pago' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                )}
            >
                {student.statusPagamento === 'Pago' ? <X className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                <span>{student.statusPagamento === 'Pago' ? 'Marcar como Pendente' : 'Marcar como Pago'}</span>
            </Button>
            <div className="flex gap-1">
                <Button onClick={onEdit} variant="ghost" size="icon">
                    <Edit className="h-5 w-5" />
                    <span className="sr-only">Editar</span>
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Trash2 className="h-5 w-5" />
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
    </div>
  );
};

export default StudentCard;
