'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { FuelExpense } from '@/lib/types';
import { getFuelExpenses, addFuelExpense, deleteFuelExpense } from '@/lib/firebase/firestore-fuel';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"


const ExpenseCard = ({ expense, onDelete }: { expense: FuelExpense; onDelete: (id: string) => void }) => {
    return (
        <div className="bg-card rounded-lg border overflow-hidden flex justify-between items-center p-4">
            <div>
                <p className="font-semibold text-lg">{formatCurrency(expense.valor)}</p>
                <p className="text-sm text-muted-foreground">{formatDate(expense.data)}</p>
                {expense.litros && <p className="text-sm text-muted-foreground">{expense.litros} litros</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={() => onDelete(expense.id)}>
                <Trash2 className="h-5 w-5 text-destructive" />
            </Button>
        </div>
    );
};

const AddExpenseForm = ({ onAddExpense }: { onAddExpense: (expense: Omit<FuelExpense, 'id'>) => void }) => {
    const [valor, setValor] = useState('');
    const [litros, setLitros] = useState('');
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = () => {
        const valorString = valor.replace(',', '.');
        const litrosString = litros.replace(',', '.');
        
        const parsedValor = parseFloat(valorString);

        if (!isNaN(parsedValor) && parsedValor > 0 && date) {
            const expenseData: Omit<FuelExpense, 'id'> = {
                valor: parsedValor,
                data: date.toISOString(),
            };

            if (litrosString) {
                const parsedLitros = parseFloat(litrosString);
                if (!isNaN(parsedLitros)) {
                    expenseData.litros = parsedLitros;
                }
            }
            
            onAddExpense(expenseData);
            setValor('');
            setLitros('');
            setDate(new Date());
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Adicionar Gasto</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar Gasto com Combustível</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                     <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">R$</span>
                        <Input type="text" inputMode="decimal" placeholder="Valor Gasto" value={valor} onChange={(e) => setValor(e.target.value)} className="pl-9" />
                    </div>
                    <Input type="text" inputMode="decimal" placeholder="Litros (Opcional)" value={litros} onChange={(e) => setLitros(e.target.value)} />
                     <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Selecione a data</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                          />
                        </PopoverContent>
                    </Popover>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit}>Adicionar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function CombustivelPage() {
    const [expenses, setExpenses] = useState<FuelExpense[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchExpenses = useCallback(async () => {
        try {
            setLoading(true);
            const expensesData = await getFuelExpenses();
            setExpenses(expensesData);
        } catch (error) {
            toast({ title: "Erro", description: "Não foi possível carregar os gastos.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const handleAddExpense = async (expenseData: Omit<FuelExpense, 'id'>) => {
        try {
            await addFuelExpense(expenseData);
            await fetchExpenses();
            toast({ title: "Sucesso!", description: "Gasto adicionado." });
        } catch (error) {
            toast({ title: "Erro", description: "Não foi possível adicionar o gasto.", variant: "destructive" });
        }
    };

    const handleDeleteExpense = async (id: string) => {
        try {
            await deleteFuelExpense(id);
            await fetchExpenses();
            toast({ title: "Sucesso!", description: "Gasto excluído." });
        } catch (error) {
            toast({ title: "Erro", description: "Não foi possível excluir o gasto.", variant: "destructive" });
        }
    };

    const { totalSpent, averageSpent } = useMemo(() => {
        const total = expenses.reduce((acc, exp) => acc + exp.valor, 0);
        const avg = expenses.length > 0 ? total / expenses.length : 0;
        return { totalSpent: total, averageSpent: avg };
    }, [expenses]);

    const sortedExpenses = useMemo(() => {
        return [...expenses].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    }, [expenses]);


    return (
        <main className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                 <h2 className="text-3xl font-bold tracking-tight">Controle de Combustível</h2>
                <AddExpenseForm onAddExpense={handleAddExpense} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Gasto Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-3/4" /> : <p className="text-3xl font-bold text-red-500">{formatCurrency(totalSpent)}</p>}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Média por Abastecimento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-1/4" /> : <p className="text-3xl font-bold">{formatCurrency(averageSpent)}</p>}
                    </CardContent>
                </Card>
            </div>
            
            <div>
                <h3 className="text-2xl font-semibold mb-4">Histórico de Gastos</h3>
                <div className="space-y-4">
                    {loading && <> <Skeleton className="h-20 w-full" /> <Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /> </>}
                    {!loading && expenses.length === 0 && <p className="text-muted-foreground text-center py-8">Nenhum gasto com combustível registrado.</p>}
                    {sortedExpenses.map(exp => <ExpenseCard key={exp.id} expense={exp} onDelete={handleDeleteExpense} />)}
                </div>
            </div>
        </main>
    );
}
