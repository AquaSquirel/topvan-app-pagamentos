'use client';

import type { Institution, Student } from '@/lib/types';
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Banknote, Hourglass, Eye, EyeOff } from 'lucide-react';
import InstitutionManager from './institution-manager';
import { formatCurrency } from '@/lib/utils';

interface DashboardProps {
  students: Student[];
  showValues: boolean;
  onToggleShowValues: () => void;
  onResetAllPayments: () => void;
  institutions: Institution[];
  onAddInstitution: (name: string) => void;
  onDeleteInstitution: (id: string) => void;
}

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Alunos</h2>
          <span className="text-muted-foreground font-medium text-lg">{currentDate}</span>
        </div>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
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
        
        <div className="sm:col-span-2 flex flex-col sm:flex-row gap-2 pt-4 border-t border-border">
          <InstitutionManager
              institutions={institutions}
              onAddInstitution={onAddInstitution}
              onDeleteInstitution={onDeleteInstitution}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
