
export type TransactionType = 'income' | 'expense' | 'debt' | 'transfer';
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
  date: string; // ISO string
  bankId: string;
  remainingBalance?: number | null;
  monthlyInterest?: number | null; // Calculated or direct monetary amount
  interestRate?: number | null; // Percentage rate (e.g., 2.5 for 2.5%)
  interestType?: InterestType | null; // 'monetary' or 'percentage'
  rateFrequency?: RateFrequency | null; // 'monthly' or 'annual' (for percentage rates)
  description?: string | null;
}

export interface Bank {
  id: string;
  name: string;
  type: BankType;
  color: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
}

export interface UserProfile {
  name: string;
  description?: string;
  weeklyTransferAmount?: number;
}

export interface FinancialSummary {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyDebt: number;
  totalDebt: number;
  weeklyIncome: number;
}
