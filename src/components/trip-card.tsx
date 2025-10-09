'use client';

import type { Trip } from '@/lib/types';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Check, X, ChevronDown } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatCurrency, formatDate } from '@/lib/utils';

interface TripCardProps {
  trip: Trip;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePayment: () => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onEdit, onDelete, onTogglePayment }) => {
  const [isOpen, setIsOpen] = useState(false);

  const isCompleted = new Date(trip.data).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
  const isPaid = trip.statusPagamento === 'Pago';

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="bg-card rounded-lg border overflow-hidden"
    >
      <div className="flex items-stretch">
        <div className="w-2 flex-shrink-0 flex flex-col">
            <div className={cn("h-1/2", isCompleted ? "bg-green-600" : "bg-sky-600")}></div>
            <div className={cn("h-1/2", isPaid ? "bg-green-600" : "bg-red-600")}></div>
        </div>
        <div className="flex-1">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 cursor-pointer">
              <div className='flex-1'>
                <p className="font-semibold text-lg">{trip.destino}</p>
                {trip.contratante && <p className="text-sm text-muted-foreground">{trip.contratante}</p>}
                <p className="text-sm text-muted-foreground mt-1">{formatDate(trip.data)}</p>
                <p className="font-semibold text-base block mt-2">{formatCurrency(trip.valor)}</p>
              </div>
              <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-3 border-t border-border">
                <Button 
                    onClick={onTogglePayment} 
                    variant={isPaid ? 'destructive' : 'default'} 
                    className={cn(
                        "flex-1 w-full justify-center text-left px-4 py-2 font-bold h-auto text-sm",
                        isPaid ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                    )}
                >
                    {isPaid ? <X className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                    <span>{isPaid ? 'Marcar Pendente' : 'Marcar Paga'}</span>
                </Button>
                <div className="flex gap-1 w-full sm:w-auto">
                    <Button onClick={onEdit} variant="outline" size="icon" className="flex-1 sm:flex-auto">
                        <Edit className="h-5 w-5" />
                        <span className="sr-only">Editar</span>
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="flex-1 sm:flex-auto">
                            <Trash2 className="h-5 w-5 text-destructive" />
                            <span className="sr-only">Excluir</span>
                        </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Viagem?</AlertDialogTitle>
                            <AlertDialogDescription>
                            Você tem certeza que deseja excluir a viagem para {trip.destino}? Esta ação não pode ser desfeita.
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

export default TripCard;
