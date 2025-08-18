
export type TransactionType = 'income' | 'expense' | 'debt' | 'transfer';
export type TransactionFrequency = 'weekly' | 'bi-weekly' | '4-weekly' | 'monthly' | 'yearly';
export type BankType = 'bank' | 'credit-card' | 'loan';
export type InterestType = 'monetary' | 'percentage';
export type RateFrequency = 'monthly' | 'annual';
export type TransactionCategory = 'Work' | 'Education' | 'Bills/Debt' | 'Nice To Have' | 'Uncategorized';
export type Currency = 'GBP' | 'USD' | 'AUD';

export interface Transaction {
  id: string;
  title: string;
  amount: number; // Always in GBP
  type: TransactionType;
  frequency: TransactionFrequency;
  category: TransactionCategory;
  date: string; // ISO string
  bankId: string;
  remainingBalance?: number | null; // In GBP
  monthlyInterest?: number | null; // In GBP
  interestRate?: number | null; // Percentage rate (e.g., 2.5 for 2.5%)
  interestType?: InterestType | null; // 'monetary' or 'percentage'
  rateFrequency?: RateFrequency | null; // 'monthly' or 'annual' (for percentage rates)
  description?: string | null;
  
  // New currency fields
  originalAmount?: number | null;
  currency?: Currency | null;
  exchangeRate?: number | null; // The exchange rate at the time of creation
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

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
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
