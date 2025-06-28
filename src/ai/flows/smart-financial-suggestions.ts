'use server';

/**
 * @fileOverview This file implements the smart financial suggestions flow.
 *
 * It provides personalized, AI-driven suggestions to users on how to improve their spending habits based on their transaction history.
 *
 * - smartFinancialSuggestions - A function that generates smart financial suggestions.
 * - SmartFinancialSuggestionsInput - The input type for the smartFinancialSuggestions function.
 * - SmartFinancialSuggestionsOutput - The return type for the smartFinancialSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartFinancialSuggestionsInputSchema = z.object({
  transactionHistory: z
    .string()
    .describe(
      'A string containing the user transaction history, each transaction on a new line. Each line has to contain the date, amount, and category.'
    ),
  financialGoals: z
    .string()
    .describe('The user provided financial goals, separated by commas.'),
  userProfile: z.string().describe('A brief description of the user.'),
});
export type SmartFinancialSuggestionsInput = z.infer<
  typeof SmartFinancialSuggestionsInputSchema
>;

const SmartFinancialSuggestionsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'A list of personalized suggestions on how to improve spending habits to achieve financial goals.'
    ),
});
export type SmartFinancialSuggestionsOutput = z.infer<
  typeof SmartFinancialSuggestionsOutputSchema
>;

export async function smartFinancialSuggestions(
  input: SmartFinancialSuggestionsInput
): Promise<SmartFinancialSuggestionsOutput> {
  return smartFinancialSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartFinancialSuggestionsPrompt',
  input: {schema: SmartFinancialSuggestionsInputSchema},
  output: {schema: SmartFinancialSuggestionsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the user's transaction history, financial goals, and user profile to provide personalized suggestions on how to improve their spending habits.

Transaction History:
{{transactionHistory}}

Financial Goals:
{{financialGoals}}

User Profile:
{{userProfile}}

Suggestions:`,
});

const smartFinancialSuggestionsFlow = ai.defineFlow(
  {
    name: 'smartFinancialSuggestionsFlow',
    inputSchema: SmartFinancialSuggestionsInputSchema,
    outputSchema: SmartFinancialSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
