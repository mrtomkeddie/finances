export type TransactionType = 'income' | 'expense' | 'debt' | 'transfer';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  frequency: 'weekly' | 'bi-weekly' | '4-weekly' | 'monthly' | 'yearly';
  date: string; // ISO date string
  bankId: string;
  remainingBalance?: number; // For debt transactions
  monthlyInterest?: number; // For debt transactions
  interestRate?: number; // Interest rate (percentage or monetary)
  interestType?: 'monetary' | 'percentage'; // Type of interest
  rateFrequency?: 'monthly' | 'annual'; // Frequency of interest rate
}

export interface Bank {
  id: string;
  name: string;
  color: string;
}

export interface TransferTransaction {
  id: string;
  title: string;
  amount: number;
  type: 'transfer';
  frequency: 'weekly' | 'bi-weekly' | '4-weekly' | 'monthly' | 'yearly';
  date: string;
  fromBankId: string;
  toBankId: string;
}

export interface FinancialSummary {
  weeklyIncome: number;
  monthlyIncome: number;
  weeklyExpenses: number;
  monthlyExpenses: number;
  weeklyDebt: number;
  monthlyDebt: number;
  totalDebt: number;
  weeklyNet: number;
  monthlyNet: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}