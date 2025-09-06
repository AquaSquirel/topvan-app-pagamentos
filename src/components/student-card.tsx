'use client';

import type { Student } from '@/lib/types';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Info, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface StudentCardProps {
  student: Student;
  institutionName: string;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePayment: () => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, institutionName, onEdit, onDelete, onTogglePayment }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="bg-card rounded-lg border p-4 space-y-3 transition-all">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex-1">
          <p className="font-semibold text-lg">{student.name}</p>
          <p className="text-sm text-muted-foreground">{institutionName}</p>
        </div>
        <div className="flex items-center gap-4">
            <span className="font-semibold text-base block">{formatCurrency(student.valorMensalidade)}</span>
            <div className="text-muted-foreground">
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
        </div>
      </div>
      
      <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", isExpanded ? "max-h-96" : "max-h-0")}>
        <div className="pt-3 space-y-3 border-t border-border">
            <div className="flex items-center gap-2">
                <Button 
                    onClick={onTogglePayment} 
                    variant={student.statusPagamento === 'Pago' ? 'default' : 'destructive'} 
                    className={cn(
                        "flex-1 justify-start text-left px-4 py-5 font-bold",
                        student.statusPagamento === 'Pago' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                    )}
                >
                    {student.statusPagamento === 'Pago' ? <Check className="mr-2 h-5 w-5" /> : <X className="mr-2 h-5 w-5" />}
                    <span>{student.statusPagamento}</span>
                </Button>
                <div className="flex gap-2">
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

            {student.observacoes && (
                <div className="pt-2">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <p>{student.observacoes}</p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default StudentCard;
