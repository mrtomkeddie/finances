
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Transaction } from '@/lib/types';

interface UIContextType {
  isBankManagementOpen: boolean;
  openBankManagement: () => void;
  closeBankManagement: () => void;

  isTransactionModalOpen: boolean;
  editingTransaction: Transaction | null;
  openTransactionModal: (transaction?: Transaction | null) => void;
  closeTransactionModal: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [isBankManagementOpen, setIsBankManagementOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const openBankManagement = () => setIsBankManagementOpen(true);
  const closeBankManagement = () => setIsBankManagementOpen(false);

  const openTransactionModal = (transaction: Transaction | null = null) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };
  
  const closeTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
  };

  const value = {
    isBankManagementOpen,
    openBankManagement,
    closeBankManagement,
    isTransactionModalOpen,
    editingTransaction,
    openTransactionModal,
    closeTransactionModal,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
