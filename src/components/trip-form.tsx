'use client';

import type { Trip } from '@/lib/types';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DatePickerResponsive } from '@/components/date-picker-responsive';

const tripSchema = z.object({
  destino: z.string().min(3, { message: 'O destino deve ter pelo menos 3 caracteres.' }),
  contratante: z.string().optional(),
  valor: z.string().refine(val => val !== '' && !isNaN(parseFloat(val.replace(',', '.'))), {
    message: "Valor inválido"
  }).transform(val => parseFloat(val.replace(',', '.'))).refine(val => val >= 0, {
    message: "O valor não pode ser negativo."
  }),
  data: z.date({ required_error: 'A data é obrigatória.' }),
});

type TripFormValues = z.infer<typeof tripSchema>;

interface AddTripFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  trip: Trip | null;
  onSave: (trip: Omit<Trip, 'id' | 'statusPagamento' | 'data'> & { data: string } | Omit<Trip, 'data'> & {data: string}) => void;
}

export const AddTripForm: React.FC<AddTripFormProps> = ({
  isOpen,
  setIsOpen,
  trip,
  onSave,
}) => {
  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      destino: '',
      contratante: '',
      valor: undefined,
      data: new Date(),
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (trip) {
        // Edit mode: populate form with trip data
        form.reset({
          destino: trip.destino,
          contratante: trip.contratante ?? '',
          valor: String(trip.valor),
          data: new Date(trip.data),
        });
      } else {
        // Add mode: reset to default values
        form.reset({
          destino: '',
          contratante: '',
          valor: undefined,
          data: new Date(),
        });
      }
    }
  }, [trip, isOpen, form]);

  const onSubmit = (data: TripFormValues) => {
    const dataToSave = {
        ...data,
        data: data.data.toISOString(),
    };

    if (trip) {
      onSave({ ...trip, ...dataToSave });
    } else {
      onSave(dataToSave);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] h-screen sm:h-auto overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{trip ? 'Editar Viagem' : 'Adicionar Nova Viagem'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="destino"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destino</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Show do Iron Maiden" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="contratante"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Contratante (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João da Silva" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                     <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">R$</span>
                        <Input type="text" inputMode="decimal" className="pl-9" placeholder="150,00" {...field} value={field.value ?? ''} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="data"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data da Viagem</FormLabel>
                    <DatePickerResponsive date={field.value} setDate={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{trip ? 'Salvar Alterações' : 'Adicionar Viagem'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
