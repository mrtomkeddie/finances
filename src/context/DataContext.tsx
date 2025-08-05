
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Transaction, Bank, Note } from '@/lib/types';
import { getBanks, getTransactions, addBank, updateBank, deleteBank, addTransaction, updateTransaction, deleteTransaction, getUserProfile, updateUserProfile, clearAllUserData, getNotes, addNote, updateNote, deleteNote } from '@/lib/firebase';

interface DataContextType {
  banks: Bank[];
  transactions: Transaction[];
  notes: Note[];
  weeklyTransferAmount: number;
  isInitialLoading: boolean; // Core data
  isTransactionsLoading: boolean;
  isNotesLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  loadTransactions: () => Promise<void>;
  loadNotes: () => Promise<void>;
  refreshData: () => void;
  handleClearAllData: () => Promise<void>;
  handleAddBank: (newBank: Omit<Bank, 'id'>) => Promise<void>;
  handleUpdateBank: (bankId: string, updates: Partial<Bank>) => Promise<void>;
  handleDeleteBank: (bankId: string) => Promise<void>;
  handleAddTransaction: (newTransaction: Omit<Transaction, 'id'>, transactionId?: string) => Promise<void>;
  handleUpdateTransaction: (updatedTransaction: Omit<Transaction, 'id'>, transactionId: string) => Promise<void>;
  handleDeleteTransaction: (transactionId: string) => Promise<void>;
  handleSaveTransferAmount: (amount: number) => Promise<void>;
  handleAddNote: (newNote: Omit<Note, 'id'>) => Promise<void>;
  handleUpdateNote: (updates: Partial<Omit<Note, 'id'>>, noteId: string) => Promise<void>;
  handleDeleteNote: (noteId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  
  const [banks, setBanks] = useState<Bank[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [weeklyTransferAmount, setWeeklyTransferAmount] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [areTransactionsLoaded, setAreTransactionsLoaded] = useState(false);
  const [areNotesLoaded, setAreNotesLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCoreData = useCallback(async () => {
    if (!user) return;
    try {
      setIsInitialLoading(true);
      setError(null);
      
      const [firebaseBanks, userProfile] = await Promise.all([
        getBanks(user.uid),
        getUserProfile(user.uid),
      ]);
      
      setBanks(firebaseBanks);
      setWeeklyTransferAmount(userProfile?.weeklyTransferAmount || 0);
      
    } catch (err: any) {
      console.error('Error loading core data from Firebase:', err);
      let detailedError = `Failed to load data: ${err.message}`;
      if (err.code === 'permission-denied' || (err.message && err.message.includes('permission-denied'))) {
          detailedError = 'Firestore Permissions Error\n\nPlease make sure you have deployed the firestore.rules file to your Firebase project and waited a minute for the rules to apply.';
      }
      setError(detailedError);
      setBanks([]);
      setTransactions([]);
      setNotes([]);
    } finally {
      setIsInitialLoading(false);
    }
  }, [user]);

  const loadTransactions = useCallback(async () => {
    if (!user || areTransactionsLoaded || isTransactionsLoading) return;
    try {
        setIsTransactionsLoading(true);
        setError(null);
        const firebaseTransactions = await getTransactions(user.uid);
        const categorizedTransactions = firebaseTransactions
          .filter(t => t.type !== 'transfer')
          .map(t => ({...t, category: t.category || 'Uncategorized'}));
        setTransactions(categorizedTransactions);
        setAreTransactionsLoaded(true);
    } catch (err: any) {
        console.error('Error loading transactions from Firebase:', err);
        setError(`Failed to load transactions: ${err.message}`);
    } finally {
        setIsTransactionsLoading(false);
    }
  }, [user, areTransactionsLoaded, isTransactionsLoading]);

  const loadNotes = useCallback(async () => {
    if (!user || areNotesLoaded || isNotesLoading) return;
    try {
      setIsNotesLoading(true);
      setError(null);
      const firebaseNotes = await getNotes(user.uid);
      setNotes(firebaseNotes);
      setAreNotesLoaded(true);
    } catch (err: any) {
      console.error('Error loading notes from Firebase:', err);
      setError(`Failed to load notes: ${err.message}`);
    } finally {
      setIsNotesLoading(false);
    }
  }, [user, areNotesLoaded, isNotesLoading]);

  useEffect(() => {
    if (user) {
      loadCoreData();
    } else {
      // Clear data on logout
      setBanks([]);
      setTransactions([]);
      setNotes([]);
      setWeeklyTransferAmount(0);
      setAreTransactionsLoaded(false);
      setAreNotesLoaded(false);
      setIsInitialLoading(true);
    }
  }, [user, loadCoreData]);
  
  const refreshData = () => {
    setAreTransactionsLoaded(false);
    setAreNotesLoaded(false);
    loadCoreData();
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
      const transactionWithCategory = {
        ...newTransaction,
        category: newTransaction.category || 'Uncategorized',
      };
      const createdTransaction = await addTransaction(user.uid, transactionWithCategory);
      setTransactions(prev => [...prev, createdTransaction]);
    } catch (err: any) {
      setError(`Failed to add transaction: ${err.message}`);
    }
  };

  const handleUpdateTransaction = async (updatedTransaction: Omit<Transaction, 'id'>, transactionId: string) => {
    if (!user) return;
    try {
      setError(null);
      const transactionWithCategory = {
        ...updatedTransaction,
        category: updatedTransaction.category || 'Uncategorized',
      };
      const updated = await updateTransaction(user.uid, transactionId, transactionWithCategory);
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

  const handleAddNote = async (newNote: Omit<Note, 'id'>) => {
    if (!user) return;
    try {
      setError(null);
      const createdNote = await addNote(user.uid, newNote);
      setNotes(prev => [createdNote, ...prev]);
    } catch (err: any) {
      setError(`Failed to add note: ${err.message}`);
    }
  };

  const handleUpdateNote = async (updates: Partial<Omit<Note, 'id'>>, noteId: string) => {
    if (!user) return;
    try {
      setError(null);
      const updatedNote = await updateNote(user.uid, noteId, updates);
      setNotes(prev => prev.map(n => (n.id === noteId ? { ...n, ...updatedNote } : n)));
    } catch (err: any) {
      setError(`Failed to update note: ${err.message}`);
    }
  };
  
  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;
    try {
      setError(null);
      await deleteNote(user.uid, noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (err: any) {
      setError(`Failed to delete note: ${err.message}`);
    }
  };

  const handleClearAllData = async () => {
    if (!user) return;
    try {
      setError(null);
      await clearAllUserData(user.uid);
      setTransactions([]);
      setAreTransactionsLoaded(false);
      setNotes([]);
      setAreNotesLoaded(false);
      await loadCoreData();
    } catch (err: any) {
      setError(`Failed to clear data: ${err.message}`);
    }
  };

  const value: DataContextType = {
    banks,
    transactions,
    notes,
    weeklyTransferAmount,
    isInitialLoading,
    isTransactionsLoading,
    isNotesLoading,
    error,
    setError,
    loadTransactions,
    loadNotes,
    refreshData,
    handleClearAllData,
    handleAddBank,
    handleUpdateBank,
    handleDeleteBank,
    handleAddTransaction,
    handleUpdateTransaction,
    handleDeleteTransaction,
    handleSaveTransferAmount,
    handleAddNote,
    handleUpdateNote,
    handleDeleteNote,
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
