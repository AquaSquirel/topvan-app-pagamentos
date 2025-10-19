import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR, timeZone: 'UTC' });
}
