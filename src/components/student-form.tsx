'use client';

import type { Student, Institution } from '@/lib/types';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const studentSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  institutionId: z.string({ required_error: 'Selecione uma instituição.' }),
  valorMensalidade: z.string().refine(val => !isNaN(parseFloat(val.replace(',', '.'))), {
    message: "Valor inválido"
  }).transform(val => parseFloat(val.replace(',', '.'))).refine(val => val >= 0, {
    message: "O valor não pode ser negativo."
  }),
  observacoes: z.string().optional(),
  turno: z.enum(['Manhã', 'Noite']),
  statusPagamento: z.enum(['Pago', 'Pendente']),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface StudentFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  student: Student | null;
  institutions: Institution[];
  onAddStudent: (student: Omit<Student, 'id' | 'valorMensalidade'> & { valorMensalidade: number }) => void;
  onUpdateStudent: (student: Omit<Student, 'valorMensalidade'> & { valorMensalidade: number }) => void;
  defaultShift: 'Manhã' | 'Noite';
}

export const StudentForm: React.FC<StudentFormProps> = ({
  isOpen,
  setIsOpen,
  student,
  institutions,
  onAddStudent,
  onUpdateStudent,
  defaultShift,
}) => {
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: '',
      institutionId: '',
      valorMensalidade: '',
      observacoes: '',
      turno: defaultShift,
      statusPagamento: 'Pendente',
    },
  });

  useEffect(() => {
     const defaultValor = (student?.valorMensalidade ? String(student.valorMensalidade) : '').toString();
    const defaultValues = {
      name: student?.name ?? '',
      institutionId: student?.institutionId ?? '',
      valorMensalidade: defaultValor,
      observacoes: student?.observacoes ?? '',
      turno: student?.turno ?? defaultShift,
      statusPagamento: student?.statusPagamento ?? 'Pendente',
    };
    form.reset(defaultValues);
  }, [student, isOpen, defaultShift, form]);

  const onSubmit = (data: StudentFormValues) => {
    if (student) {
      onUpdateStudent({ ...student, ...data });
    } else {
      onAddStudent(data);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{student ? 'Editar Aluno' : 'Adicionar Novo Aluno'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João da Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="institutionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faculdade/Escola</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma instituição" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {institutions.map(inst => (
                        <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="valorMensalidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor da Mensalidade</FormLabel>
                  <FormControl>
                     <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">R$</span>
                        <Input type="text" inputMode="decimal" className="pl-9" placeholder="450,00" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Anotações importantes sobre o aluno..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{student ? 'Salvar Alterações' : 'Adicionar Aluno'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
