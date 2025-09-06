'use client';

import type { Student } from '@/lib/types';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Info, Check, X, ChevronDown } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface StudentCardProps {
  student: Student;
  institutionName: string;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePayment: () => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, institutionName, onEdit, onDelete, onTogglePayment }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const isPaid = student.statusPagamento === 'Pago';

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="bg-card rounded-lg border overflow-hidden"
    >
      <div className="flex items-stretch">
        <div className={cn(
          "w-2 flex-shrink-0",
          isPaid ? "bg-green-600" : "bg-red-600"
        )}></div>
        <div className="flex-1">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 cursor-pointer">
              <div className='flex-1'>
                <p className="font-semibold text-lg">{student.name}</p>
                <p className="text-sm text-muted-foreground">{institutionName}</p>
                <p className="font-semibold text-base block mt-2">{formatCurrency(student.valorMensalidade)}</p>
              </div>
              <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4 space-y-4">
             {student.observacoes && (
                <div className="pt-3 border-t border-border">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground mt-3">
                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <p>{student.observacoes}</p>
                    </div>
                </div>
            )}
            <div className="flex items-center gap-2 pt-3 border-t border-border">
                <Button 
                    onClick={onTogglePayment} 
                    variant={isPaid ? 'destructive' : 'default'} 
                    className={cn(
                        "flex-1 justify-center text-left px-4 py-2 font-bold h-auto text-sm",
                        isPaid ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                    )}
                >
                    {isPaid ? <X className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                    <span>{isPaid ? 'Marcar Pendente' : 'Marcar Pago'}</span>
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
          </CollapsibleContent>
        </div>
      </div>
    </Collapsible>
  );
};

export default StudentCard;
