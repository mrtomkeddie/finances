export type TransactionType = 'income' | 'expense' | 'debt';
export type TransactionFrequency = 'weekly' | 'bi-weekly' | '4-weekly' | 'monthly' | 'yearly';
export type BankType = 'bank' | 'credit-card' | 'loan';
export type InterestType = 'monetary' | 'percentage';
export type RateFrequency = 'monthly' | 'annual';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  frequency: TransactionFrequency;
  category: string;
  date: string;
  bankId: string;
  remainingBalance?: number;
  monthlyInterest?: number; // Calculated or direct monetary amount
  interestRate?: number; // Percentage rate (e.g., 2.5 for 2.5%)
  interestType?: InterestType; // 'monetary' or 'percentage'
  rateFrequency?: RateFrequency; // 'monthly' or 'annual' (for percentage rates)
  description?: string;
}

export interface Bank {
  id: string;
  name: string;
  type: BankType;
  color: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  totalDebt: number;
  weeklyIncome: number;
  weeklyExpenses: number;
  weeklyDebt: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyDebt: number;
  netMonthly: number;
  netWeekly: number;
}