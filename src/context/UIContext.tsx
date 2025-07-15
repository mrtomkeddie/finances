
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Transaction, Note } from '@/lib/types';

interface ConfirmationConfig {
  title: string;
  description: string;
  onConfirm: () => void;
}

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

  isNoteModalOpen: boolean;
  editingNote: Note | null;
  openNoteModal: (note?: Note | null) => void;
  closeNoteModal: () => void;

  isNoteDetailModalOpen: boolean;
  detailedNote: Note | null;
  openNoteDetailModal: (note: Note) => void;
  closeNoteDetailModal: () => void;

  isConfirmationOpen: boolean;
  confirmationConfig: ConfirmationConfig;
  openConfirmationDialog: (config: ConfirmationConfig) => void;
  closeConfirmationDialog: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [isBankManagementOpen, setIsBankManagementOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailedTransaction, setDetailedTransaction] = useState<Transaction | null>(null);
  const [isTransferEditOpen, setIsTransferEditOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isNoteDetailModalOpen, setIsNoteDetailModalOpen] = useState(false);
  const [detailedNote, setDetailedNote] = useState<Note | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState<ConfirmationConfig>({
    title: '',
    description: '',
    onConfirm: () => {},
  });

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

  const openNoteModal = (note: Note | null = null) => {
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };
  const closeNoteModal = () => {
    setIsNoteModalOpen(false);
    setEditingNote(null);
  };

  const openNoteDetailModal = (note: Note) => {
    setDetailedNote(note);
    setIsNoteDetailModalOpen(true);
  };
  const closeNoteDetailModal = () => {
    setIsNoteDetailModalOpen(false);
    setDetailedNote(null);
  };

  const openConfirmationDialog = (config: ConfirmationConfig) => {
    setConfirmationConfig(config);
    setIsConfirmationOpen(true);
  };

  const closeConfirmationDialog = () => {
    setIsConfirmationOpen(false);
  };

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
    isNoteModalOpen,
    editingNote,
    openNoteModal,
    closeNoteModal,
    isNoteDetailModalOpen,
    detailedNote,
    openNoteDetailModal,
    closeNoteDetailModal,
    isConfirmationOpen,
    confirmationConfig,
    openConfirmationDialog,
    closeConfirmationDialog,
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
