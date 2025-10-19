'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { GeneralExpense, PaymentMethod, ExpenseCategory } from '@/lib/types';
import { categorizeExpense } from '@/ai/flows/categorize-expense-flow';
import { getGeneralExpenses, addGeneralExpense, deleteGeneralExpense } from '@/lib/firebase/firestore-general-expenses';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, CalendarIcon, Wallet, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from 'date-fns/locale';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Pie, PieChart, Cell } from "recharts"

const paymentMethods: PaymentMethod[] = ["PIX", "Cartão Banco Brasil", "Cartão Nubank", "Cartão Naza", "Outro"];
const expenseCategories: ExpenseCategory[] = ["Alimentação", "Manutenção do Veículo", "Saúde", "Lazer", "Pessoal", "Educação", "Outros"];

const categoryColors: Record<ExpenseCategory, string> = {
  "Alimentação": "hsl(var(--chart-1))",
  "Manutenção do Veículo": "hsl(var(--chart-2))",
  "Saúde": "hsl(var(--chart-3))",
  "Lazer": "hsl(var(--chart-4))",
  "Pessoal": "hsl(var(--chart-5))",
  "Educação": "hsl(var(--chart-6))",
  "Outros": "hsl(var(--muted))",
};

const chartConfig: any = Object.fromEntries(
    Object.entries(categoryColors).map(([key, value], i) => [key, { label: key, color: value.replace('hsl(var(--chart-', '').replace('))', '')}])
);


const expenseSchema = z.object({
  description: z.string().min(3, { message: 'A descrição deve ter pelo menos 3 caracteres.' }),
  valor: z.string().refine(val => !isNaN(parseFloat(val.replace(',', '.'))), {
    message: "Valor inválido"
  }).transform(val => parseFloat(val.replace(',', '.'))).refine(val => val > 0, {
    message: "O valor deve ser positivo."
  }),
  data: z.date({ required_error: 'A data é obrigatória.' }),
  paymentMethod: z.enum(["PIX", "Cartão Banco Brasil", "Cartão Nubank", "Cartão Naza", "Outro"]),
  totalInstallments: z.coerce.number().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

const AddExpenseForm = ({ onAddExpense, isCategorizing }: { onAddExpense: (data: Omit<GeneralExpense, 'id' | 'category'> & { category?: ExpenseCategory }) => void; isCategorizing: boolean; }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const form = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            description: '',
            valor: '0',
            data: new Date(),
            paymentMethod: 'PIX',
            totalInstallments: 1
        },
    });

    const paymentMethod = useWatch({
      control: form.control,
      name: 'paymentMethod'
    });

    const isInstallment = paymentMethod !== 'PIX';

    const onSubmit = (data: ExpenseFormValues) => {
        const expenseData: Omit<GeneralExpense, 'id' | 'category'> = {
            ...data,
            data: data.data.toISOString(),
            currentInstallment: isInstallment ? 1 : undefined,
            totalInstallments: isInstallment ? data.totalInstallments : undefined,
        };
        onAddExpense(expenseData);
        form.reset();
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button disabled={isCategorizing}><Plus className="mr-2 h-4 w-4" /> {isCategorizing ? 'Categorizando...' : 'Adicionar Gasto'}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar Gasto Geral</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Descrição</FormLabel><FormControl><Input placeholder="Ex: Almoço no restaurante" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="valor" render={({ field }) => (
                            <FormItem><FormLabel>Valor</FormLabel><FormControl>
                                <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">R$</span>
                                <Input type="text" inputMode="decimal" className="pl-9" placeholder="25,50" {...field} /></div>
                            </FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="data" render={({ field }) => (
                            <FormItem className="flex flex-col"><FormLabel>Data do Gasto</FormLabel><Popover>
                                <PopoverTrigger asChild><FormControl>
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                                    </Button></FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={ptBR} /></PopoverContent>
                            </Popover><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                            <FormItem><FormLabel>Forma de Pagamento</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione a forma de pagamento" /></SelectTrigger></FormControl>
                                    <SelectContent>{paymentMethods.map(method => <SelectItem key={method} value={method}>{method}</SelectItem>)}</SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )} />
                        {isInstallment && (
                          <div className="grid grid-cols-1 gap-4">
                            <FormField control={form.control} name="totalInstallments" render={({ field }) => (
                                <FormItem><FormLabel>Total de Parcelas</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </div>
                        )}
                        <DialogFooter><Button type="submit">Adicionar</Button></DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

const ExpenseCard = ({ expense, onDelete }: { expense: GeneralExpense; onDelete: (id: string) => void }) => (
    <div className="bg-card rounded-lg border overflow-hidden flex justify-between items-start p-4">
        <div>
            <div className='flex items-center gap-2'>
              <p className="font-semibold text-lg">{expense.description}</p>
              {expense.totalInstallments && (
                <span className="text-xs font-bold bg-primary/20 text-primary-foreground py-0.5 px-2 rounded-full">
                  {expense.currentInstallment}/{expense.totalInstallments}
                </span>
              )}
            </div>
            <p className="text-md font-bold">
              {expense.totalInstallments 
                ? `${formatCurrency(expense.valor / expense.totalInstallments)}`
                : formatCurrency(expense.valor)
              }
              {expense.totalInstallments && <span className="text-sm font-normal text-muted-foreground"> / {formatCurrency(expense.valor)} Total</span>}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5"><Wallet size={14} /><p>{expense.paymentMethod}</p></div>
              <div className="flex items-center gap-1.5"><Tag size={14} /><p>{expense.category}</p></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{formatDate(expense.data)}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onDelete(expense.id)}><Trash2 className="h-5 w-5 text-destructive" /></Button>
    </div>
);

export default function GastosPage() {
    const [expenses, setExpenses] = useState<GeneralExpense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCategorizing, setIsCategorizing] = useState(false);
    const { toast } = useToast();

    const fetchExpenses = useCallback(async () => {
        try {
            setLoading(true);
            const expensesData = await getGeneralExpenses();
            setExpenses(expensesData);
        } catch (error) {
            toast({ title: "Erro", description: "Não foi possível carregar os gastos.", variant: "destructive" });
        } finally { setLoading(false); }
    }, [toast]);

    useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

    const handleAddExpense = async (data: Omit<GeneralExpense, 'id' | 'category'>) => {
        setIsCategorizing(true);
        try {
            const { category } = await categorizeExpense({ description: data.description });
            const newExpense: Omit<GeneralExpense, 'id'> = { ...data, category };
            await addGeneralExpense(newExpense);
            await fetchExpenses();
            toast({ title: "Sucesso!", description: "Gasto adicionado e categorizado." });
        } catch (error) {
            console.error("Error adding expense:", error);
            toast({ title: "Erro", description: "Não foi possível adicionar ou categorizar o gasto.", variant: "destructive" });
        } finally {
            setIsCategorizing(false);
        }
    };
    
    const handleDeleteExpense = async (id: string) => {
        try {
            await deleteGeneralExpense(id);
            await fetchExpenses();
            toast({ title: "Sucesso!", description: "Gasto excluído." });
        } catch (error) {
            toast({ title: "Erro", description: "Não foi possível excluir o gasto.", variant: "destructive" });
        }
    };

    const { totalSpent, chartData } = useMemo(() => {
        const total = expenses.reduce((acc, exp) => {
            const valorParcela = exp.totalInstallments ? exp.valor / exp.totalInstallments : exp.valor;
            return acc + valorParcela;
        }, 0);
        
        const dataByCategory = expenses.reduce((acc, expense) => {
            const valorParcela = expense.totalInstallments ? expense.valor / expense.totalInstallments : expense.valor;
            acc[expense.category] = (acc[expense.category] || 0) + valorParcela;
            return acc;
        }, {} as Record<ExpenseCategory, number>);

        const pieData = Object.entries(dataByCategory).map(([category, value]) => ({
            name: category,
            value,
            fill: categoryColors[category as ExpenseCategory] || categoryColors["Outros"],
        }));
        return { totalSpent: total, chartData: pieData };
    }, [expenses]);

    const sortedExpenses = useMemo(() => [...expenses].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()), [expenses]);

    return (
        <main className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                 <h2 className="text-3xl font-bold tracking-tight">Controle de Gastos Gerais</h2>
                <AddExpenseForm onAddExpense={handleAddExpense} isCategorizing={isCategorizing} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                 <Card>
                    <CardHeader><CardTitle>Gasto Total (Mês)</CardTitle></CardHeader>
                    <CardContent>{loading ? <Skeleton className="h-8 w-3/4" /> : <p className="text-3xl font-bold text-red-500">{formatCurrency(totalSpent)}</p>}</CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Distribuição por Categoria</CardTitle></CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-40 w-full" /> : 
                        (chartData.length > 0 ? (
                             <ChartContainer config={chartConfig} className="mx-auto aspect-square h-full w-full max-h-[250px]">
                                <PieChart>
                                    <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} strokeWidth={2}>
                                      {chartData.map((entry) => (
                                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                      ))}
                                    </Pie>
                                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                                </PieChart>
                            </ChartContainer>
                        ) : <p className="text-muted-foreground text-center py-4">Sem dados para exibir o gráfico.</p>)
                        }
                    </CardContent>
                </Card>
            </div>
            
            <div>
                <h3 className="text-2xl font-semibold mb-4">Histórico de Gastos</h3>
                <div className="space-y-4">
                    {loading && <> <Skeleton className="h-28 w-full" /> <Skeleton className="h-28 w-full" /><Skeleton className="h-28 w-full" /> </>}
                    {!loading && expenses.length === 0 && <p className="text-muted-foreground text-center py-8">Nenhum gasto geral registrado.</p>}
                    {sortedExpenses.map(exp => <ExpenseCard key={exp.id} expense={exp} onDelete={handleDeleteExpense} />)}
                </div>
            </div>
        </main>
    );
}

    
