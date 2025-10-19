'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExpenseCategories = z.enum(["Alimentação", "Manutenção do Veículo", "Saúde", "Lazer", "Pessoal", "Educação", "Outros"]);

const CategorizeExpenseInputSchema = z.object({
  description: z.string().describe('A descrição de um gasto a ser categorizado.'),
});
export type CategorizeExpenseInput = z.infer<typeof CategorizeExpenseInputSchema>;

const CategorizeExpenseOutputSchema = z.object({
  category: ExpenseCategories.describe('A categoria do gasto.'),
});
export type CategorizeExpenseOutput = z.infer<typeof CategorizeExpenseOutputSchema>;

const categorizeExpenseFlow = ai.defineFlow(
  {
    name: 'categorizeExpenseFlow',
    inputSchema: CategorizeExpenseInputSchema,
    outputSchema: CategorizeExpenseOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
        name: 'categorizeExpensePrompt',
        input: { schema: CategorizeExpenseInputSchema },
        output: { schema: CategorizeExpenseOutputSchema },
        prompt: `Você é um assistente financeiro. Sua tarefa é categorizar um gasto com base em sua descrição.

        As categorias disponíveis são: ${ExpenseCategories.options.join(', ')}.
        
        Analise a descrição do gasto e atribua a categoria mais apropriada. Se nenhuma categoria se encaixar perfeitamente, use "Outros".
        
        Descrição do Gasto: {{{description}}}`,
    });

    const { output } = await prompt(input);
    return output!;
  }
);

export async function categorizeExpense(input: CategorizeExpenseInput): Promise<CategorizeExpenseOutput> {
  return categorizeExpenseFlow(input);
}
