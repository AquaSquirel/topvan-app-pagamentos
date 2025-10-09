'use client';

import type { Student, Trip, FuelExpense } from '@/lib/types';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Banknote, Droplet, Milestone, AlertTriangle } from 'lucide-react';
import { getStudents, resetAllPayments } from '@/lib/firebase/firestore-students';
import { getTrips, deleteAllTrips } from '@/lib/firebase/firestore-trips';
import { getFuelExpenses, deleteAllFuelExpenses } from '@/lib/firebase/firestore-fuel';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const TopVanLogo = () => (
    <h1 className="text-4xl font-bold text-primary tracking-wider">TopVan</h1>
);

export default function Home() {
    const [students, setStudents] = useState<Student[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [fuelExpenses, setFuelExpenses] = useState<FuelExpense[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [studentsData, tripsData, fuelData] = await Promise.all([
                getStudents(),
                getTrips(),
                getFuelExpenses()
            ]);
            setStudents(studentsData);
            setTrips(tripsData);
            setFuelExpenses(fuelData);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast({ title: "Erro", description: "Não foi possível carregar os dados.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleResetMonth = async () => {
        try {
            await Promise.all([
                resetAllPayments(),
                deleteAllTrips(),
                deleteAllFuelExpenses(),
            ]);
            await fetchData();
            toast({ title: "Sucesso!", description: "O mês foi reiniciado. Pronto para um novo começo!" });
        } catch (error) {
            console.error("Error resetting month:", error);
            toast({ title: "Erro", description: "Não foi possível reiniciar o mês.", variant: "destructive" });
        }
    };

    const { receitaAlunos, receitaViagens, despesaCombustivel, receitaBruta, lucroLiquido } = useMemo(() => {
        const receitaAlunos = students.filter(s => s.statusPagamento === 'Pago').reduce((acc, s) => acc + s.valorMensalidade, 0);
        
        const receitaViagens = trips.filter(t => new Date(t.data) <= new Date()).reduce((acc, t) => acc + t.valor, 0);

        const despesaCombustivel = fuelExpenses.reduce((acc, f) => acc + f.valor, 0);
        
        const receitaBruta = receitaAlunos + receitaViagens;
        const lucroLiquido = receitaBruta - despesaCombustivel;

        return { receitaAlunos, receitaViagens, despesaCombustivel, receitaBruta, lucroLiquido };
    }, [students, trips, fuelExpenses]);
    
    const StatCard = ({ title, value, icon, loading, colorClass = "text-foreground" }: { title: string, value: string, icon: React.ReactNode, loading: boolean, colorClass?: string }) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                {loading ? <Skeleton className="h-8 w-3/4" /> : <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>}
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                <TopVanLogo />
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Reiniciar Mês
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação é irreversível. Todos os registros de <span className="font-bold">viagens e gastos com combustível serão excluídos</span>, e o status de pagamento de <span className="font-bold">todos os alunos será definido como "Pendente"</span>. Use isso para começar um novo ciclo mensal.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleResetMonth}>Sim, reiniciar o mês</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3 mb-8">
                <StatCard title="Lucro Líquido" value={formatCurrency(lucroLiquido)} icon={<Banknote className="h-4 w-4 text-muted-foreground" />} loading={loading} colorClass="text-green-500" />
                <StatCard title="Receita Bruta" value={formatCurrency(receitaBruta)} icon={<Milestone className="h-4 w-4 text-muted-foreground" />} loading={loading} colorClass="text-sky-500" />
                <StatCard title="Despesas Totais" value={formatCurrency(despesaCombustivel)} icon={<Droplet className="h-4 w-4 text-muted-foreground" />} loading={loading} colorClass="text-red-500" />
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-semibold tracking-tight">Detalhes do Mês</h2>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                     <StatCard title="Alunos Pagos" value={formatCurrency(receitaAlunos)} icon={<Users className="h-4 w-4 text-muted-foreground" />} loading={loading} />
                     <StatCard title="Viagens Realizadas" value={formatCurrency(receitaViagens)} icon={<Milestone className="h-4 w-4 text-muted-foreground" />} loading={loading} />
                     <StatCard title="Total em Combustível" value={formatCurrency(despesaCombustivel)} icon={<Droplet className="h-4 w-4 text-muted-foreground" />} loading={loading} />
                     <StatCard title="Total de Alunos" value={students.length.toString()} icon={<Users className="h-4 w-4 text-muted-foreground" />} loading={loading} />
                </div>
            </div>
        </div>
    );
}
