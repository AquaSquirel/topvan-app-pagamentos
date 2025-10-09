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

export interface Trip {
  id: string;
  destino: string;
  data: string; // ISO date string
  valor: number;
  statusPagamento: 'Pago' | 'Pendente';
}

export interface FuelExpense {
  id: string;
  data: string; // ISO date string
  valor: number;
  litros?: number;
}
