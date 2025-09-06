'use client';

import type { Institution, Student } from '@/lib/types';
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Users, Banknote, Hourglass, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import InstitutionManager from './institution-manager';

interface DashboardProps {
  students: Student[];
  showValues: boolean;
  onToggleShowValues: () => void;
  onResetAllPayments: () => void;
  institutions: Institution[];
  onAddInstitution: (name: string) => void;
  onDeleteInstitution: (id: string) => void;
}

const TopVanLogo = () => (
  <h1 className="text-4xl font-bold text-primary tracking-wider">TopVan</h1>
);

const Dashboard: React.FC<DashboardProps> = ({
  students,
  showValues,
  onToggleShowValues,
  onResetAllPayments,
  institutions,
  onAddInstitution,
  onDeleteInstitution,
}) => {
  const [currentDate, setCurrentDate] = useState('');

  React.useEffect(() => {
    const date = new Date();
    const formattedDate = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    setCurrentDate(formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1));
  }, []);

  const { totalAlunos, totalRecebido, totalPendente } = useMemo(() => {
    const totalRecebido = students
      .filter(s => s.statusPagamento === 'Pago')
      .reduce((acc, s) => acc + s.valorMensalidade, 0);

    const totalPendente = students
      .filter(s => s.statusPagamento === 'Pendente')
      .reduce((acc, s) => acc + s.valorMensalidade, 0);

    return {
      totalAlunos: students.length,
      totalRecebido,
      totalPendente,
    };
  }, [students]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <TopVanLogo />
          <span className="text-muted-foreground font-medium text-lg">{currentDate}</span>
        </div>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlunos}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={onToggleShowValues}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <div className="flex items-center gap-2">
              {showValues ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {showValues ? formatCurrency(totalRecebido) : 'R$ ••••••'}
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={onToggleShowValues}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
            <div className="flex items-center gap-2">
              {showValues ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              <Hourglass className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {showValues ? formatCurrency(totalPendente) : 'R$ ••••••'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start pt-4 border-t border-border">
          <AlertDialog>
              <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex-1 sm:flex-none">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Zerar Pagamentos
                  </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                          Esta ação definirá o status de pagamento de TODOS os alunos como "Pendente". Isso é ideal para iniciar um novo ciclo de cobrança, mas não pode ser desfeito.
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={onResetAllPayments}>Sim, zerar pagamentos</AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>

          <InstitutionManager
              institutions={institutions}
              onAddInstitution={onAddInstitution}
              onDeleteInstitution={onDeleteInstitution}
          />
      </div>

    </div>
  );
};

export default Dashboard;
