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
  contratante?: string;
  data: string; // ISO date string
  valor: number;
  statusPagamento: 'Pago' | 'Pendente' | 'Arquivado';
  dataVolta?: string; // ISO date string for return trip
  isReturnTrip?: boolean;
}

export interface FuelExpense {
  id: string;
  data: string; // ISO date string
  valor: number;
  litros?: number;
  description?: string;
}

export type PaymentMethod = "PIX" | "Cartão Banco Brasil" | "Cartão Nubank" | "Cartão Naza" | "Outro";
export type ExpenseCategory = "Alimentação" | "Manutenção do Veículo" | "Saúde" | "Lazer" | "Pessoal" | "Educação" | "Outros";

export interface GeneralExpense {
  id: string;
  data: string; // ISO date string
  valor: number;
  description: string;
  paymentMethod: PaymentMethod;
  category: ExpenseCategory;
  currentInstallment?: number;
  totalInstallments?: number;
}
