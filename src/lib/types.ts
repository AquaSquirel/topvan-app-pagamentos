export interface Institution {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  name: string;
  institutionId: string;
  valorMensalidade: number;
  observacoes: string;
  statusPagamento: 'Pago' | 'Pendente';
  turno: 'Manhã' | 'Noite';
}
