
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Plus, TrendingUp, TrendingDown, CreditCard, Clock, ChevronUp, ChevronDown, Loader2, Edit3, UploadCloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BankManagementModal } from '@/components/BankManagementModal';
import { TransactionModal } from '@/components/TransactionModal';
import { TransactionDetailModal } from '@/components/TransactionDetailModal';
import { TransferEditModal } from '@/components/TransferEditModal';
import { Transaction, Bank, TransactionType, TransactionFrequency } from '@/lib/types';
import { calculateSummary, formatCurrency, calculateMonthlyAmount, calculateNetMonthlyDebtPayment, calculateWeeksUntilPaidOff } from '@/lib/financial';
import { getBanks, getTransactions, addBank, updateBank, deleteBank, addTransaction, updateTransaction, deleteTransaction } from '@/lib/firebase';
import { formatDate, getNextDueDate, formatNextDueDate, getNextDueDateColor } from '@/lib/dateUtils';
import { useRouter } from 'next/navigation';
import { airtableService } from '@/lib/airtableService';
import { writeBatch, collection, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type SortColumn = 'name' | 'amount' | 'frequency' | 'monthlyAmount' | 'remainingDebt' | 'weeksUntilPaidOff' | 'dueDate' | 'bank' | 'interest';
type SortDirection = 'asc' | 'desc';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  
  const [weeklyTransferAmount, setWeeklyTransferAmount] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeFilter, setActiveFilter] = useState<'income' | 'expense' | 'debt'>('income');
  const [activeBankFilter, setActiveBankFilter] = useState('all-income');
  const [isBankManagementOpen, setIsBankManagementOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isTransferEditOpen, setIsTransferEditOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [isImporting, setIsImporting] = useState(false);
  const [hasImported, setHasImported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAmount = localStorage.getItem('weekly-transfer-amount');
      if (savedAmount) {
        setWeeklyTransferAmount(parseFloat(savedAmount) || 0);
      }
    }
  }, []);

  const loadData = async () => {
    if (!user) return;
    try {
      setIsInitialLoading(true);
      setError(null);
      
      const [firebaseBanks, firebaseTransactions] = await Promise.all([
        getBanks(user.uid),
        getTransactions(user.uid),
      ]);
      
      setBanks(firebaseBanks);
      setTransactions(firebaseTransactions.filter(t => t.type !== 'transfer'));
      
    } catch (err: any) {
      console.error('Error loading data from Firebase:', err);
      setError(`Failed to load data from Firebase: ${err.message}`);
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

  useEffect(() => {
    setSortColumn('name');
    setSortDirection('asc');
  }, [activeFilter]);

  if (isInitialLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  const handleImportData = async () => {
    if (!user) {
        setError('You must be logged in to import data.');
        return;
    }

    if (!window.confirm('This will import all banks and transactions from Airtable. This can only be done once. Are you sure?')) {
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

        // Batch-write banks and create ID map
        airtableBanks.forEach(bank => {
            const firestoreBankRef = doc(collection(db, `users/${user.uid}/banks`));
            batch.set(firestoreBankRef, { name: bank.name, type: bank.type, color: bank.color });
            bankIdMap.set(bank.id, firestoreBankRef.id);
        });
        
        // Batch-write transactions
        airtableTransactions.forEach(transaction => {
            const firestoreTransactionRef = doc(collection(db, `users/${user.uid}/transactions`));
            const firestoreBankId = bankIdMap.get(transaction.bankId);

            if (!firestoreBankId) {
                console.warn(`Skipping transaction "${transaction.title}" because its bank was not found in the import.`);
                return;
            }
            
            const transactionData: Omit<Transaction, 'id'> = {
              title: transaction.title,
              amount: transaction.amount,
              type: transaction.type,
              frequency: transaction.frequency,
              category: transaction.category,
              date: transaction.date,
              bankId: firestoreBankId,
              remainingBalance: transaction.remainingBalance,
              monthlyInterest: transaction.monthlyInterest,
              interestRate: transaction.interestRate,
              interestType: transaction.interestType,
              rateFrequency: transaction.rateFrequency,
              description: transaction.description,
            };

            batch.set(firestoreTransactionRef, transactionData);
        });

        await batch.commit();
        
        await loadData(); // Reload data from Firestore
        setHasImported(true);

    } catch (err: any) {
        console.error('Full error object during import:', err);
        let detailedError = `Failed to import data: ${err.message}`;
        if (err.code === 'permission-denied' || (err.message && err.message.includes('permission-denied'))) {
            detailedError = 'Firestore Permissions Error\n\nYour security rules are preventing the data from being saved. Please make sure you have correctly deployed the firestore.rules file to your Firebase project and have waited a minute for them to apply.';
        } else if (err.message && err.message.includes('Airtable')) {
            detailedError = 'Airtable Connection Error\n\nThere was a problem connecting to Airtable. The API key used for the import may have expired or been revoked by Airtable.';
        } else {
            detailedError += '\n\nAn unknown error occurred during the import process. Check the browser console for more details.';
        }
        setError(detailedError);
    } finally {
        setIsImporting(false);
    }
  };

  const getBankColor = (bankId: string) => banks.find(b => b.id === bankId)?.color || '#6366f1';
  const getBankName = (bankId: string) => banks.find(b => b.id === bankId)?.name || 'Unknown Bank';

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'monthly': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'yearly': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case '4-weekly': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'bi-weekly': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getActiveFilterDisplayName = () => {
    switch (activeFilter) {
      case 'income': return 'Income';
      case 'expense': return 'Expenses';
      case 'debt': return 'Debt Payments';
      default: return 'Transactions';
    }
  };

  const calculateWeeksUntilPaidOffDisplay = (transaction: Transaction) => {
    if (!transaction.remainingBalance || transaction.remainingBalance <= 0) return 'Never';
    if (!transaction.amount || transaction.amount <= 0) return 'Not paying';
    
    const weeks = calculateWeeksUntilPaidOff(transaction);
    if (weeks === null) {
      return calculateNetMonthlyDebtPayment(transaction) <= 0 ? 'Debt growing' : 'Never';
    }
    return `${weeks} weeks`;
  };

  const calculateBankTotals = (bankName: string) => {
    const normalizedBankName = bankName.toLowerCase();
    
    let bankTransactions = transactions.filter(t => 
      getBankName(t.bankId).toLowerCase().includes(normalizedBankName)
    );
    
    if (normalizedBankName.includes('hsbc')) {
      bankTransactions = transactions.filter(t => {
        const transactionBankName = getBankName(t.bankId).toLowerCase();
        return transactionBankName.includes('hsbc') || transactionBankName.includes('barclays');
      });
    }
    
    const summary = calculateSummary(bankTransactions);
    
    const expenseAndDebt = bankTransactions
      .filter(t => t.type === 'expense' || (t.type === 'debt' && t.amount > 0))
      .reduce((sum, t) => sum + calculateMonthlyAmount(t.amount, t.frequency), 0);
    
    let adjustedWeeklyNet = summary.weeklyIncome - (expenseAndDebt / 4.33);
    let adjustedMonthlyNet = summary.monthlyIncome - expenseAndDebt;
    
    if (normalizedBankName.includes('hsbc')) {
      adjustedWeeklyNet -= weeklyTransferAmount;
      adjustedMonthlyNet -= (weeklyTransferAmount * 4.33);
    } else if (normalizedBankName.includes('santander')) {
      adjustedWeeklyNet += weeklyTransferAmount;
      adjustedMonthlyNet += (weeklyTransferAmount * 4.33);
    }
    
    return {
      weeklyNet: adjustedWeeklyNet,
      monthlyNet: adjustedMonthlyNet,
    };
  };

  const handleSaveTransferAmount = (amount: number) => {
    setWeeklyTransferAmount(amount);
    localStorage.setItem('weekly-transfer-amount', amount.toString());
  };

  const handleAddBank = async (newBank: Omit<Bank, 'id'>) => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError(null);
      const createdBank = await addBank(user.uid, newBank);
      setBanks(prev => [...prev, createdBank]);
    } catch (err: any) {
      setError(`Failed to add bank: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBank = async (bankId: string, updates: Partial<Bank>) => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError(null);
      const updatedBank = await updateBank(user.uid, bankId, updates);
      setBanks(prev => prev.map(bank => (bank.id === bankId ? updatedBank : bank)));
    } catch (err: any) {
      setError(`Failed to update bank: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBank = async (bankId: string) => {
    if (!user) return;
    if (transactions.some(t => t.bankId === bankId)) {
      alert('Cannot delete bank with existing transactions.');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      await deleteBank(user.uid, bankId);
      setBanks(prev => prev.filter(bank => bank.id !== bankId));
    } catch (err: any) {
      setError(`Failed to delete bank: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTransaction = async (newTransaction: Omit<Transaction, 'id'>) => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError(null);
      const createdTransaction = await addTransaction(user.uid, newTransaction);
      setTransactions(prev => [...prev, createdTransaction]);
    } catch (err: any) {
      setError(`Failed to add transaction: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTransaction = async (updatedTransaction: Omit<Transaction, 'id'>) => {
    if (!editingTransaction || !user) return;
    try {
      setIsLoading(true);
      setError(null);
      const updated = await updateTransaction(user.uid, editingTransaction.id, updatedTransaction);
      setTransactions(prev => prev.map(t => (t.id === editingTransaction.id ? updated : t)));
      setEditingTransaction(null);
    } catch (err: any) {
      setError(`Failed to update transaction: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError(null);
      await deleteTransaction(user.uid, transactionId);
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
    } catch (err: any) {
      setError(`Failed to delete transaction: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleCloseTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
  };

  const handleSort = (column: SortColumn) => {
    setSortColumn(prev => {
      if (prev === column) {
        setSortDirection(dir => (dir === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDirection('asc');
      return column;
    });
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  const filteredTransactions = transactions.filter(transaction => {
    const typeMatches = (activeFilter === 'income' && transaction.type === 'income') ||
                        (activeFilter === 'expense' && (transaction.type === 'expense' || transaction.type === 'debt')) ||
                        (activeFilter === 'debt' && transaction.type === 'debt');
    return typeMatches && (activeBankFilter.startsWith('all-') || transaction.bankId === activeBankFilter);
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aValue: any, bValue: any;
    switch (sortColumn) {
      case 'name': aValue = a.title.toLowerCase(); bValue = b.title.toLowerCase(); break;
      case 'amount': aValue = a.amount; bValue = b.amount; break;
      case 'frequency':
        const freqOrder: { [key in TransactionFrequency]: number } = { 'weekly': 1, 'bi-weekly': 2, '4-weekly': 3, 'monthly': 4, 'yearly': 5 };
        aValue = freqOrder[a.frequency] || 6; bValue = freqOrder[b.frequency] || 6; break;
      case 'monthlyAmount': aValue = calculateMonthlyAmount(a.amount, a.frequency); bValue = calculateMonthlyAmount(b.amount, b.frequency); break;
      case 'remainingDebt': aValue = a.remainingBalance || 0; bValue = b.remainingBalance || 0; break;
      case 'interest': aValue = a.monthlyInterest || 0; bValue = b.monthlyInterest || 0; break;
      case 'weeksUntilPaidOff':
        const getWeeks = (t: Transaction) => {
          const weeks = calculateWeeksUntilPaidOff(t);
          if (weeks === null) return calculateNetMonthlyDebtPayment(t) <= 0 ? Infinity : Infinity - 1;
          return weeks;
        };
        aValue = getWeeks(a); bValue = getWeeks(b); break;
      case 'dueDate': aValue = getNextDueDate(a.date, a.frequency).getTime(); bValue = getNextDueDate(b.date, b.frequency).getTime(); break;
      case 'bank': aValue = getBankName(a.bankId).toLowerCase(); bValue = getBankName(b.bankId).toLowerCase(); break;
      default: aValue = a.title.toLowerCase(); bValue = b.title.toLowerCase();
    }
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const allSummary = calculateSummary(transactions);
  const debtSummary = calculateSummary(transactions.filter(t => t.type === 'debt' && t.amount > 0));
  const totalExpenseAndDebt = transactions
    .filter(t => t.type === 'expense' || (t.type === 'debt' && t.amount > 0))
    .reduce((sum, t) => sum + calculateMonthlyAmount(t.amount, t.frequency), 0);

  const hsbcTotals = calculateBankTotals('hsbc');
  const santanderTotals = calculateBankTotals('santander');

  const monthlyTotal = sortedTransactions
    .filter(t => t.type === 'income' || t.type === 'expense' || (t.type === 'debt' && t.amount > 0))
    .reduce((sum, t) => sum + calculateMonthlyAmount(t.amount, t.frequency), 0);
  const weeklyTotal = monthlyTotal / 4.33;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsTransactionModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add Transaction
          </Button>
          <Button variant="outline" onClick={() => setIsBankManagementOpen(true)} className="w-full sm:w-auto">
            <Settings className="mr-2 h-4 w-4" /> Manage Banks
          </Button>
        </div>
      </div>
      
       {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm whitespace-pre-line">
            <div className="font-bold mb-2">Error</div>
            {error}
            <button onClick={() => setError(null)} className="absolute top-2 right-2 text-red-300 hover:text-red-200">✕</button>
        </div>
      )}

      {banks.length === 0 && transactions.length === 0 && !isLoading && !error && (
        <div className="text-center py-12">
            <div className="max-w-md mx-auto px-4">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-6" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Welcome to Your Financial Tracker</h2>
              <p className="text-muted-foreground mb-6">Get started by adding your first bank, or import your existing data from Airtable.</p>
              <div className="flex justify-center flex-col sm:flex-row gap-4">
                <Button onClick={() => setIsBankManagementOpen(true)} className="gap-2">
                    <Settings className="h-4 w-4" /> Add Your First Bank
                </Button>
                <Button variant="secondary" onClick={handleImportData} disabled={isImporting || hasImported}>
                  {isImporting ? <><Loader2 className="h-4 w-4 animate-spin mr-2"/> Importing...</> : (hasImported ? 'Data Imported' : <><UploadCloud className="h-4 w-4 mr-2"/>Import from Airtable</>)}
                </Button>
              </div>
            </div>
        </div>
      )}

        {(banks.length > 0 || transactions.length > 0) && (
          <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <Card className="p-4 sm:p-6 bg-card border-border">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex-shrink-0">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Monthly Income</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground truncate">{formatCurrency(allSummary.monthlyIncome)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 bg-card border-border">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex-shrink-0">
                  <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Monthly Expenses</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground truncate">{formatCurrency(totalExpenseAndDebt)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 bg-card border-border">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 flex-shrink-0">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Debt Remaining</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground truncate">{formatCurrency(allSummary.totalDebt)}</p>
                </div>
              </div>
            </Card>
          </div>
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <Card className="p-4 sm:p-6 bg-card border-border">
              <h3 className="font-semibold mb-2 text-foreground text-sm sm:text-base">HSBC Overview</h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Weekly Net Income:</span>
                  <span className={`font-medium text-sm sm:text-base ${hsbcTotals.weeklyNet >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(hsbcTotals.weeklyNet)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Monthly Net Income:</span>
                  <span className={`font-medium text-sm sm:text-base ${hsbcTotals.monthlyNet >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(hsbcTotals.monthlyNet)}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground text-sm sm:text-base">Santander Overview</h3>
                <Button variant="ghost" size="sm" className="p-1 h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => setIsTransferEditOpen(true)}>
                  <Edit3 className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Weekly Net Income:</span>
                  <span className={`font-medium text-sm sm:text-base ${santanderTotals.weeklyNet >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(santanderTotals.weeklyNet)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Monthly Net Income:</span>
                  <span className={`font-medium text-sm sm:text-base ${santanderTotals.monthlyNet >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(santanderTotals.monthlyNet)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-border/40">
                  <span className="text-xs sm:text-sm text-muted-foreground">Weekly Transfer In:</span>
                  <span className="font-medium text-sm sm:text-base text-blue-400">{formatCurrency(weeklyTransferAmount)}</span>
                </div>
              </div>
            </Card>
          </div>
        
          <div className="space-y-4 sm:space-y-6">
            <div className="flex gap-1 p-1 bg-muted/30 rounded-2xl border border-border/50">
                {['income', 'expense', 'debt'].map(filter => (
                    <button
                        key={filter}
                        onClick={() => {
                            setActiveFilter(filter as 'income' | 'expense' | 'debt');
                            setActiveBankFilter(`all-${filter}`);
                        }}
                        className={`category-filter-btn flex items-center justify-center gap-2 flex-1 py-3 px-6 rounded-xl transition-all text-base ${
                            activeFilter === filter ? 'bg-card shadow-sm border border-border text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                    >
                        {filter === 'income' && <TrendingUp className="h-4 w-4" />}
                        {filter === 'expense' && <TrendingDown className="h-4 w-4" />}
                        {filter === 'debt' && <CreditCard className="h-4 w-4" />}
                        <span className="hidden xs:inline capitalize">{filter}</span>
                    </button>
                ))}
            </div>

            {banks.length > 0 && (
              <div className="overflow-x-auto">
                <div className="flex gap-2 pb-2 min-w-max">
                  <button onClick={() => setActiveBankFilter(`all-${activeFilter}`)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm ${activeBankFilter.startsWith('all-') ? 'bg-card border-border shadow-sm text-foreground' : 'bg-muted/20 border-muted text-muted-foreground hover:bg-muted/40'}`}>
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-green-400" />
                    <span>All Banks</span>
                  </button>
                  {banks.map((bank) => (
                    <button key={bank.id} onClick={() => setActiveBankFilter(bank.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm ${activeBankFilter === bank.id ? 'bg-card border-border shadow-sm text-foreground' : 'bg-muted/20 border-muted text-muted-foreground hover:bg-muted/40'}`}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: bank.color }} />
                      <span>{bank.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        
          <Card className="bg-card border-border overflow-hidden">
            <div className="table-container custom-scrollbar overflow-x-auto">
              <table className="sticky-table min-w-full">
                <thead>
                  <tr>
                    <th className="sortable text-muted-foreground text-left" onClick={() => handleSort('name')}><div className="flex items-center">Name{getSortIcon('name')}</div></th>
                    <th className="sortable text-muted-foreground text-left" onClick={() => handleSort('amount')}><div className="flex items-center">{activeFilter === 'debt' ? 'Payment' : 'Amount'}{getSortIcon('amount')}</div></th>
                    {activeFilter !== 'debt' && <>
                      <th className="sortable text-muted-foreground text-left" onClick={() => handleSort('frequency')}><div className="flex items-center">Frequency{getSortIcon('frequency')}</div></th>
                      <th className="sortable text-muted-foreground text-left" onClick={() => handleSort('monthlyAmount')}><div className="flex items-center">Monthly Amount{getSortIcon('monthlyAmount')}</div></th>
                    </>}
                    {activeFilter === 'debt' && <>
                      <th className="sortable text-muted-foreground text-left" onClick={() => handleSort('interest')}><div className="flex items-center">Monthly Interest{getSortIcon('interest')}</div></th>
                      <th className="sortable text-muted-foreground text-left" onClick={() => handleSort('remainingDebt')}><div className="flex items-center">Remaining Debt{getSortIcon('remainingDebt')}</div></th>
                      <th className="sortable text-muted-foreground text-left" onClick={() => handleSort('weeksUntilPaidOff')}><div className="flex items-center">Weeks Until Paid Off{getSortIcon('weeksUntilPaidOff')}</div></th>
                    </>}
                    <th className="sortable text-muted-foreground text-left" onClick={() => handleSort('dueDate')}><div className="flex items-center">Next Due Date{getSortIcon('dueDate')}</div></th>
                    <th className="sortable text-muted-foreground text-left" onClick={() => handleSort('bank')}><div className="flex items-center">Bank{getSortIcon('bank')}</div></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTransactions.map((t) => (
                    <tr key={t.id} className="cursor-pointer" onClick={() => handleTransactionClick(t)}>
                      <td className="font-medium text-foreground truncate max-w-xs">{t.title}</td>
                      <td className="text-foreground">{formatCurrency(t.amount)}</td>
                      {activeFilter !== 'debt' && <>
                        <td><Badge variant="outline" className={getFrequencyColor(t.frequency)}>{t.frequency}</Badge></td>
                        <td className="text-foreground">{formatCurrency(calculateMonthlyAmount(t.amount, t.frequency))}</td>
                      </>}
                      {activeFilter === 'debt' && <>
                        <td className="text-yellow-400">{t.monthlyInterest ? formatCurrency(t.monthlyInterest) : '£0.00'}</td>
                        <td className="text-orange-400">{formatCurrency(t.remainingBalance || 0)}</td>
                        <td className={t.amount === 0 ? 'text-muted-foreground' : calculateNetMonthlyDebtPayment(t) <= 0 ? 'text-red-400' : 'text-blue-400'}>{calculateWeeksUntilPaidOffDisplay(t)}</td>
                      </>}
                      <td>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span className={getNextDueDateColor(t.date, t.frequency)}>{formatDate(getNextDueDate(t.date, t.frequency))}</span>
                            <span className="text-xs text-muted-foreground">{formatNextDueDate(t.date, t.frequency)}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getBankColor(t.bankId) }}/>
                          <span className="text-foreground truncate max-w-xs">{getBankName(t.bankId)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {(activeFilter === 'income' || activeFilter === 'expense') && (
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <Card className="p-4 bg-card border-border text-center">
                <p className="text-sm text-muted-foreground mb-1">Weekly {getActiveFilterDisplayName()}</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(weeklyTotal)}</p>
              </Card>
              <Card className="p-4 bg-card border-border text-center">
                <p className="text-sm text-muted-foreground mb-1">Monthly {getActiveFilterDisplayName()}</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(monthlyTotal)}</p>
              </Card>
            </div>
          )}

          {activeFilter === 'debt' && (
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <Card className="p-4 bg-card border-border">
                <h3 className="font-semibold text-foreground">Total Monthly Debt Payments</h3>
                <p className="text-2xl font-bold text-orange-400">{formatCurrency(debtSummary.monthlyDebt)}</p>
              </Card>
              <Card className="p-4 bg-card border-border">
                <h3 className="font-semibold text-foreground">Total Monthly Interest</h3>
                <p className="text-2xl font-bold text-yellow-400">{formatCurrency(transactions.filter(t => t.type === 'debt' && t.monthlyInterest).reduce((sum, t) => sum + (t.monthlyInterest || 0), 0))}</p>
              </Card>
            </div>
          )}
        </>
      )}

      <BankManagementModal isOpen={isBankManagementOpen} onClose={() => setIsBankManagementOpen(false)} banks={banks} onAddBank={handleAddBank} onUpdateBank={handleUpdateBank} onDeleteBank={handleDeleteBank} />
      <TransactionModal isOpen={isTransactionModalOpen} onClose={handleCloseTransactionModal} onAddTransaction={editingTransaction ? handleUpdateTransaction : handleAddTransaction} banks={banks} editTransaction={editingTransaction} />
      <TransactionDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} transaction={selectedTransaction} banks={banks} onEdit={handleEditTransaction} onDelete={handleDeleteTransaction} />
      <TransferEditModal isOpen={isTransferEditOpen} onClose={() => setIsTransferEditOpen(false)} currentAmount={weeklyTransferAmount} onSave={handleSaveTransferAmount} />
    </div>
  );
}
