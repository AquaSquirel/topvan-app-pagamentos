'use client';

import type { Trip } from '@/lib/types';
import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DatePickerResponsive } from '@/components/date-picker-responsive';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const tripSchema = z.object({
  destino: z.string().min(3, { message: 'O destino deve ter pelo menos 3 caracteres.' }),
  contratante: z.string().optional(),
  valor: z.string().refine(val => val !== '' && !isNaN(parseFloat(val.replace(',', '.'))), {
    message: "Valor inválido"
  }).transform(val => parseFloat(val.replace(',', '.'))).refine(val => val >= 0, {
    message: "O valor não pode ser negativo."
  }),
  data: z.date({ required_error: 'A data é obrigatória.' }),
  temVolta: z.boolean().default(false),
  dataVolta: z.date().optional(),
}).refine(data => {
    if (data.temVolta) {
        return !!data.dataVolta;
    }
    return true;
}, {
    message: "A data de volta é obrigatória.",
    path: ["dataVolta"],
});

type TripFormValues = z.infer<typeof tripSchema>;

interface AddTripFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  trip: Trip | null;
  onSave: (trip: any) => void;
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
      temVolta: false,
      dataVolta: undefined,
    },
  });

   const temVolta = useWatch({
    control: form.control,
    name: "temVolta",
  });

   useEffect(() => {
    if (isOpen) {
      if (trip) {
        form.reset({
          destino: trip.destino,
          contratante: trip.contratante ?? '',
          valor: String(trip.valor),
          data: new Date(trip.data),
          temVolta: !!trip.dataVolta,
          dataVolta: trip.dataVolta ? new Date(trip.dataVolta) : undefined,
        });
      } else {
        form.reset({
          destino: '',
          contratante: '',
          valor: undefined,
          data: new Date(),
          temVolta: false,
          dataVolta: undefined,
        });
      }
    }
  }, [trip, isOpen, form]);


  const onSubmit = (data: TripFormValues) => {
     const dataToSave = {
        ...data,
        data: data.data.toISOString(),
        dataVolta: data.temVolta && data.dataVolta ? data.dataVolta.toISOString() : undefined
    };

    // We don't need `temVolta` in the final object
    const { temVolta, ...finalData } = dataToSave;

    if (trip) {
      onSave({ ...trip, ...finalData });
    } else {
      onSave(finalData);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] overflow-y-auto">
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
                  <FormLabel>Data da Viagem (Ida)</FormLabel>
                    <DatePickerResponsive date={field.value} setDate={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="temVolta"
                render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                    <FormLabel>Volta em outro dia?</FormLabel>
                    </div>
                    <FormControl>
                    <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                    </FormControl>
                </FormItem>
                )}
            />
            {temVolta && (
                 <FormField
                    control={form.control}
                    name="dataVolta"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Data da Volta</FormLabel>
                        <DatePickerResponsive date={field.value} setDate={field.onChange} />
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}
            <DialogFooter>
              <Button type="submit">{trip ? 'Salvar Alterações' : 'Adicionar Viagem'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
