export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

export interface UserProfile {
  name: string;
  description: string;
}


export interface FinancialItem {
  id: string;
  name: string;
  amount: number;
  frequency: 'weekly' | '4-weekly' | 'monthly';
  monthlyAmount: number;
  nextDueDate: string; // ISO date string
  bank: string;
  type: 'income' | 'expense' | 'debt';
}

export interface BankOverview {
  name: string;
  weeklyNet: number;
  monthlyNet: number;
  weeklyTransferIn?: number;
}
