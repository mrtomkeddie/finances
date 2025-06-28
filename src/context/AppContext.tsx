'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Transaction, Goal, UserProfile } from '@/lib/types';
import { DEFAULT_CATEGORIES } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';

interface AppContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  userProfile: UserProfile;
  updateUserProfile: (profile: UserProfile) => void;
  categories: string[];
  addCategory: (category: string) => void;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [goals, setGoals] = useLocalStorage<Goal[]>('goals', []);
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('userProfile', { name: 'User', description: '' });
  const [categories, setCategories] = useLocalStorage<string[]>('categories', DEFAULT_CATEGORIES);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: uuidv4() };
    setTransactions([...transactions, newTransaction]);
  };
  
  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal = { ...goal, id: uuidv4() };
    setGoals([...goals, newGoal]);
  };

  const updateGoal = (updatedGoal: Goal) => {
    setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };
  
  const updateUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };
  
  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories([...categories, category]);
    }
  };

  const clearAllData = () => {
    setTransactions([]);
    setGoals([]);
    setUserProfile({ name: 'User', description: '' });
    setCategories(DEFAULT_CATEGORIES);
  };

  const contextValue = useMemo(() => ({
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    userProfile,
    updateUserProfile,
    categories,
    addCategory,
    clearAllData,
  }), [transactions, goals, userProfile, categories]);

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
