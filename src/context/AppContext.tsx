'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import type { FinancialItem, BankOverview } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

const mockFinancialItems: FinancialItem[] = [
  { id: '1', name: 'Carers (Tom 05B)', amount: 81.90, frequency: 'weekly', monthlyAmount: 354.63, nextDueDate: '2025-06-30T00:00:00.000Z', bank: 'HSBC', type: 'income' },
  { id: '2', name: 'Child Benefit', amount: 76.45, frequency: 'weekly', monthlyAmount: 331.03, nextDueDate: '2025-07-01T00:00:00.000Z', bank: 'Barclays', type: 'income' },
  { id: '3', name: 'Maximus Rent', amount: 150.00, frequency: 'weekly', monthlyAmount: 649.50, nextDueDate: '2025-07-04T00:00:00.000Z', bank: 'HSBC', type: 'income' },
  { id: '4', name: 'Carers (Lydia 63D)', amount: 81.90, frequency: 'weekly', monthlyAmount: 354.63, nextDueDate: '2025-07-05T00:00:00.000Z', bank: 'Barclays', type: 'income' },
  { id: '5', name: 'PIP (Lydia 63D)', amount: 380.00, frequency: '4-weekly', monthlyAmount: 410.40, nextDueDate: '2025-07-09T00:00:00.000Z', bank: 'HSBC', type: 'income' },
  { id: '6', name: 'Healthy Start', amount: 17.00, frequency: '4-weekly', monthlyAmount: 18.36, nextDueDate: '2025-07-16T00:00:00.000Z', bank: 'Healthy Start', type: 'income' },
  { id: '7', name: 'Universal Credit', amount: 1077.35, frequency: 'monthly', monthlyAmount: 1077.35, nextDueDate: '2025-07-18T00:00:00.000Z', bank: 'HSBC', type: 'income' },
  // Expenses
  { id: '8', name: 'Council Tax', amount: 180.00, frequency: 'monthly', monthlyAmount: 180.00, nextDueDate: '2025-07-01T00:00:00.000Z', bank: 'Santander', type: 'expense' },
  { id: '9', name: 'Netflix', amount: 10.99, frequency: 'monthly', monthlyAmount: 10.99, nextDueDate: '2025-07-10T00:00:00.000Z', bank: 'HSBC', type: 'expense' },
  { id: '10', name: 'Groceries', amount: 400.00, frequency: 'monthly', monthlyAmount: 2833.46, nextDueDate: '2025-07-01T00:00:00.000Z', bank: 'Barclays', type: 'expense' },
  // Debts
  { id: '11', name: 'Credit Card', amount: 20425.73, frequency: 'monthly', monthlyAmount: 200, nextDueDate: '2025-07-25T00:00:00.000Z', bank: 'HSBC', type: 'debt' },
];

const mockBankOverviews: BankOverview[] = [
    { name: 'HSBC', weeklyNet: 22.69, monthlyNet: 98.27 },
    { name: 'Santander', weeklyNet: 12.66, monthlyNet: 54.81, weeklyTransferIn: 40.00 },
];

const mockBanks = ['All Banks', 'Santander', 'Barclays', 'Healthy Start', 'HSBC'];

interface AppContextType {
  financialItems: FinancialItem[];
  bankOverviews: BankOverview[];
  banks: string[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {

  const contextValue = useMemo(() => ({
    financialItems: mockFinancialItems,
    bankOverviews: mockBankOverviews,
    banks: mockBanks,
  }), []);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
