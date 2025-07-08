
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Transaction, Bank } from '@/lib/types';
import { getBanks, getTransactions, addBank, updateBank, deleteBank, addTransaction, updateTransaction, deleteTransaction, getUserProfile, updateUserProfile } from '@/lib/firebase';
import { airtableService } from '@/lib/airtableService';
import { writeBatch, collection, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface DataContextType {
  banks: Bank[];
  transactions: Transaction[];
  weeklyTransferAmount: number;
  isInitialLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  isImporting: boolean;
  hasImported: boolean;
  refreshData: () => void;
  handleImportData: () => Promise<void>;
  handleAddBank: (newBank: Omit<Bank, 'id'>) => Promise<void>;
  handleUpdateBank: (bankId: string, updates: Partial<Bank>) => Promise<void>;
  handleDeleteBank: (bankId: string) => Promise<void>;
  handleAddTransaction: (newTransaction: Omit<Transaction, 'id'>) => Promise<void>;
  handleUpdateTransaction: (updatedTransaction: Omit<Transaction, 'id'>, transactionId: string) => Promise<void>;
  handleDeleteTransaction: (transactionId: string) => Promise<void>;
  handleSaveTransferAmount: (amount: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  
  const [banks, setBanks] = useState<Bank[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [weeklyTransferAmount, setWeeklyTransferAmount] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [hasImported, setHasImported] = useState(false);

  const loadData = async () => {
    if (!user) return;
    try {
      setIsInitialLoading(true);
      setError(null);
      
      const [firebaseBanks, firebaseTransactions, userProfile] = await Promise.all([
        getBanks(user.uid),
        getTransactions(user.uid),
        getUserProfile(user.uid),
      ]);
      
      setBanks(firebaseBanks);
      setTransactions(firebaseTransactions.filter(t => t.type !== 'transfer'));
      
      setWeeklyTransferAmount(userProfile?.weeklyTransferAmount || 0);

      if (firebaseBanks.length > 0 || firebaseTransactions.length > 0) {
        setHasImported(true);
      }
      
    } catch (err: any) {
      console.error('Error loading data from Firebase:', err);
      let detailedError = `Failed to load data: ${err.message}`;
      if (err.code === 'permission-denied' || (err.message && err.message.includes('permission-denied'))) {
          detailedError = 'Firestore Permissions Error\n\nPlease make sure you have deployed the firestore.rules file to your Firebase project and waited a minute for the rules to apply.';
      }
      setError(detailedError);
      setBanks([]);
      setTransactions([]);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleImportData = async () => {
    if (!user) {
        setError('You must be logged in to import data.');
        return;
    }
    setIsImporting(true);
    setError(null);
    try {
        const [airtableBanks, airtableTransactions] = await Promise.all([
            airtableService.getBanks(),
            airtableService.getTransactions(),
        ]);
        const batch = writeBatch(db);
        const bankIdMap = new Map<string, string>();
        airtableBanks.forEach(bank => {
            const firestoreBankRef = doc(collection(db, `users/${user.uid}/banks`));
            batch.set(firestoreBankRef, { name: bank.name, type: bank.type, color: bank.color });
            bankIdMap.set(bank.id, firestoreBankRef.id);
        });
        airtableTransactions.forEach(transaction => {
            const firestoreTransactionRef = doc(collection(db, `users/${user.uid}/transactions`));
            const firestoreBankId = bankIdMap.get(transaction.bankId);
            if (!firestoreBankId) return;
            const transactionData: Omit<Transaction, 'id'> = {
              title: transaction.title, amount: transaction.amount, type: transaction.type, frequency: transaction.frequency, category: transaction.category, date: transaction.date, bankId: firestoreBankId, remainingBalance: transaction.remainingBalance ?? null, monthlyInterest: transaction.monthlyInterest ?? null, interestRate: transaction.interestRate ?? null, interestType: transaction.interestType ?? null, rateFrequency: transaction.rateFrequency ?? null, description: transaction.description ?? null,
            };
            batch.set(firestoreTransactionRef, transactionData);
        });
        await batch.commit();
        await loadData();
        setHasImported(true);
    } catch (err: any) {
      console.error('Full error object during import:', err);
      let detailedError = `Failed to import data: ${err.message}`;
      if (err.code === 'permission-denied' || (err.message && err.message.includes('permission-denied'))) {
          detailedError = 'Firestore Permissions Error\n\nYour security rules are preventing the data from being saved. Please make sure you have correctly deployed the firestore.rules file.';
      } else if (err.message && err.message.includes('Airtable')) {
          detailedError = 'Airtable Connection Error\n\nThere was a problem connecting to Airtable. The API key may have expired.';
      } else {
          detailedError += '\n\nAn unknown error occurred during the import process.';
      }
      setError(detailedError);
    } finally {
        setIsImporting(false);
    }
  };
  
  const handleSaveTransferAmount = async (amount: number) => {
    if (!user) return;
    setWeeklyTransferAmount(amount);
    try {
      await updateUserProfile(user.uid, { weeklyTransferAmount: amount });
    } catch (err: any) {
      setError(`Failed to save transfer amount: ${err.message}`);
    }
  };

  const handleAddBank = async (newBank: Omit<Bank, 'id'>) => {
    if (!user) return;
    try {
      setError(null);
      const createdBank = await addBank(user.uid, newBank);
      setBanks(prev => [...prev, createdBank]);
    } catch (err: any) {
      setError(`Failed to add bank: ${err.message}`);
    }
  };

  const handleUpdateBank = async (bankId: string, updates: Partial<Bank>) => {
    if (!user) return;
    try {
      setError(null);
      const updatedBank = await updateBank(user.uid, bankId, updates);
      setBanks(prev => prev.map(bank => (bank.id === bankId ? updatedBank : bank)));
    } catch (err: any) {
      setError(`Failed to update bank: ${err.message}`);
    }
  };

  const handleDeleteBank = async (bankId: string) => {
    if (!user) return;
    if (transactions.some(t => t.bankId === bankId)) {
      alert('Cannot delete bank with existing transactions.');
      return;
    }
    try {
      setError(null);
      await deleteBank(user.uid, bankId);
      setBanks(prev => prev.filter(bank => bank.id !== bankId));
    } catch (err: any) {
      setError(`Failed to delete bank: ${err.message}`);
    }
  };

  const handleAddTransaction = async (newTransaction: Omit<Transaction, 'id'>) => {
    if (!user) return;
    try {
      setError(null);
      const createdTransaction = await addTransaction(user.uid, newTransaction);
      setTransactions(prev => [...prev, createdTransaction]);
    } catch (err: any) {
      setError(`Failed to add transaction: ${err.message}`);
    }
  };

  const handleUpdateTransaction = async (updatedTransaction: Omit<Transaction, 'id'>, transactionId: string) => {
    if (!user) return;
    try {
      setError(null);
      const updated = await updateTransaction(user.uid, transactionId, updatedTransaction);
      setTransactions(prev => prev.map(t => (t.id === transactionId ? updated : t)));
    } catch (err: any) {
      setError(`Failed to update transaction: ${err.message}`);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!user) return;
    try {
      setError(null);
      await deleteTransaction(user.uid, transactionId);
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
    } catch (err: any) {
      setError(`Failed to delete transaction: ${err.message}`);
    }
  };

  const value = {
    banks,
    transactions,
    weeklyTransferAmount,
    isInitialLoading,
    error,
    setError,
    isImporting,
    hasImported,
    refreshData: loadData,
    handleImportData,
    handleAddBank,
    handleUpdateBank,
    handleDeleteBank,
    handleAddTransaction,
    handleUpdateTransaction,
    handleDeleteTransaction,
    handleSaveTransferAmount,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
