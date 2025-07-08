
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

  isDetailModalOpen: boolean;
  detailedTransaction: Transaction | null;
  openDetailModal: (transaction: Transaction) => void;
  closeDetailModal: () => void;

  isTransferEditOpen: boolean;
  openTransferEditModal: () => void;
  closeTransferEditModal: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [isBankManagementOpen, setIsBankManagementOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailedTransaction, setDetailedTransaction] = useState<Transaction | null>(null);
  const [isTransferEditOpen, setIsTransferEditOpen] = useState(false);

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

  const openDetailModal = (transaction: Transaction) => {
    setDetailedTransaction(transaction);
    setIsDetailModalOpen(true);
  };
  
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setDetailedTransaction(null);
  };

  const openTransferEditModal = () => setIsTransferEditOpen(true);
  const closeTransferEditModal = () => setIsTransferEditOpen(false);

  const value = {
    isBankManagementOpen,
    openBankManagement,
    closeBankManagement,
    isTransactionModalOpen,
    editingTransaction,
    openTransactionModal,
    closeTransactionModal,
    isDetailModalOpen,
    detailedTransaction,
    openDetailModal,
    closeDetailModal,
    isTransferEditOpen,
    openTransferEditModal,
    closeTransferEditModal,
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
