import React, { useState, useEffect } from 'react';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Settings, Plus, TrendingUp, TrendingDown, CreditCard, Clock, LogOut, ChevronUp, ChevronDown, Loader2, Edit3 } from 'lucide-react';
import { Badge } from './components/ui/badge';
import { BankManagementModal } from './components/BankManagementModal';
import { TransactionModal } from './components/TransactionModal';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { TransferEditModal } from './components/TransferEditModal';
import { LoginForm } from './components/LoginForm';
import { Transaction, Bank, TransactionType } from './types/financial';
import { calculateSummary, formatCurrency, calculateMonthlyAmount, calculateNetMonthlyDebtPayment, calculateWeeksUntilPaidOff } from './utils/financial';
import { airtableService } from './utils/airtableService';
import { formatDate, getDaysUntil, isOverdue, getNextDueDate, formatNextDueDate, getNextDueDateColor } from './utils/dateUtils';
import logoIcon from 'figma:asset/f37b117da20b0b73f1b52001c4536e9241827875.png';

type SortColumn = 'name' | 'amount' | 'frequency' | 'monthlyAmount' | 'remainingDebt' | 'weeksUntilPaidOff' | 'dueDate' | 'bank' | 'interest';
type SortDirection = 'asc' | 'desc';

export default function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Data state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  
  // Transfer state - simple weekly amount stored in localStorage
  const [weeklyTransferAmount, setWeeklyTransferAmount] = useState(0);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state - REMOVED 'transfer' completely
  const [activeFilter, setActiveFilter] = useState<'income' | 'expense' | 'debt'>('income');
  const [activeBankFilter, setActiveBankFilter] = useState('all-income');
  const [isBankManagementOpen, setIsBankManagementOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isTransferEditOpen, setIsTransferEditOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Sorting state
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Utility functions
  const getBankColor = (bankId: string) => {
    const bank = banks.find(b => b.id === bankId);
    return bank?.color || '#6366f1';
  };

  const getBankName = (bankId: string) => {
    const bank = banks.find(b => b.id === bankId);
    return bank?.name || 'Unknown Bank';
  };

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

  // UPDATED: Use next due date calculation instead of showing past dates
  const formatDueDate = (dateString: string, frequency: string) => {
    return formatNextDueDate(dateString, frequency);
  };

  // UPDATED: Use next due date color calculation
  const getDueDateColor = (dateString: string, frequency: string) => {
    return getNextDueDateColor(dateString, frequency);
  };

  const getActiveFilterDisplayName = () => {
    switch (activeFilter) {
      case 'income': return 'Income';
      case 'expense': return 'Expenses';
      case 'debt': return 'Debt Payments';
      default: return 'Transactions';
    }
  };

  // UPDATED: Calculate weeks until paid off using new utility function
  const calculateWeeksUntilPaidOffDisplay = (transaction: Transaction) => {
    if (!transaction.remainingBalance || transaction.remainingBalance <= 0) {
      return 'Never';
    }
    
    if (!transaction.amount || transaction.amount <= 0) {
      return 'Not paying';
    }
    
    const weeks = calculateWeeksUntilPaidOff(transaction);
    
    if (weeks === null) {
      const netPayment = calculateNetMonthlyDebtPayment(transaction);
      if (netPayment <= 0) {
        return 'Debt growing';
      }
      return 'Never';
    }
    
    return `${weeks} weeks`;
  };

  // NEW: Simplified bank calculations with automatic transfer
  const calculateBankTotals = (bankName: string) => {
    const normalizedBankName = bankName.toLowerCase();
    
    // Get transactions for this bank
    let bankTransactions = transactions.filter(t => 
      getBankName(t.bankId).toLowerCase().includes(normalizedBankName)
    );
    
    // SPECIAL: HSBC includes both HSBC and Barclays transactions
    if (normalizedBankName.includes('hsbc')) {
      bankTransactions = transactions.filter(t => {
        const transactionBankName = getBankName(t.bankId).toLowerCase();
        return transactionBankName.includes('hsbc') || transactionBankName.includes('barclays');
      });
    }
    
    const summary = calculateSummary(bankTransactions);
    
    // UPDATED: Only include debt payments that have amount > 0 (actually being paid)
    const expenseAndDebt = bankTransactions
      .filter(t => {
        if (t.type === 'expense') return true;
        if (t.type === 'debt') return t.amount > 0; // Only count debts being paid
        return false;
      })
      .reduce((sum, t) => sum + calculateMonthlyAmount(t.amount, t.frequency), 0);
    
    let adjustedWeeklyNet = summary.weeklyIncome - (expenseAndDebt / 4.33);
    let adjustedMonthlyNet = summary.monthlyIncome - expenseAndDebt;
    
    // Apply automatic transfer
    if (normalizedBankName.includes('hsbc')) {
      // HSBC loses the transfer amount
      adjustedWeeklyNet -= weeklyTransferAmount;
      adjustedMonthlyNet -= (weeklyTransferAmount * 4.33);
    } else if (normalizedBankName.includes('santander')) {
      // Santander gains the transfer amount
      adjustedWeeklyNet += weeklyTransferAmount;
      adjustedMonthlyNet += (weeklyTransferAmount * 4.33);
    }
    
    return {
      weeklyNet: adjustedWeeklyNet,
      monthlyNet: adjustedMonthlyNet,
      weeklyIncome: summary.weeklyIncome,
      monthlyIncome: summary.monthlyIncome,
      weeklyExpenses: expenseAndDebt / 4.33,
      monthlyExpenses: expenseAndDebt,
    };
  };

  // Transfer amount management
  const handleSaveTransferAmount = (amount: number) => {
    setWeeklyTransferAmount(amount);
    localStorage.setItem('weekly-transfer-amount', amount.toString());
  };

  // Load transfer amount from localStorage
  useEffect(() => {
    const savedAmount = localStorage.getItem('weekly-transfer-amount');
    if (savedAmount) {
      setWeeklyTransferAmount(parseFloat(savedAmount) || 0);
    }
  }, []);

  // Apply dark mode and check authentication on mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    // Set favicon
    const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
    favicon.setAttribute('rel', 'icon');
    favicon.setAttribute('href', logoIcon);
    if (!document.querySelector('link[rel="icon"]')) {
      document.head.appendChild(favicon);
    }
    
    // Check if user is already authenticated
    const authStatus = localStorage.getItem('financial-tracker-auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsInitialLoading(false);
    }
  }, []);

  // Load data from Airtable when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadData = async () => {
      try {
        setIsInitialLoading(true);
        setError(null);
        
        console.log('🔄 Loading data from Airtable...');
        
        // Load existing data from Airtable
        const [airtableBanks, airtableTransactions] = await Promise.all([
          airtableService.getBanks(),
          airtableService.getTransactions(),
        ]);
        
        console.log(`📊 Loaded ${airtableBanks.length} banks and ${airtableTransactions.length} transactions from Airtable`);
        
        setBanks(airtableBanks);
        // Filter out any transfer transactions that might exist
        setTransactions(airtableTransactions.filter(t => t.type !== 'transfer'));
        
      } catch (err) {
        console.error('Error loading data from Airtable:', err);
        setError(`Failed to load data from Airtable: ${err.message}`);
        
        // Start with empty data on error
        setBanks([]);
        setTransactions([]);
      } finally {
        setIsInitialLoading(false);
      }
    };
    
    loadData();
  }, [isAuthenticated]);

  // Reset sorting when changing transaction type filters
  useEffect(() => {
    setSortColumn('name');
    setSortDirection('asc');
  }, [activeFilter]);

  // Authentication functions
  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('financial-tracker-auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('financial-tracker-auth');
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Show initial loading screen
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your financial data...</p>
          <p className="text-xs text-muted-foreground">Connecting to Airtable...</p>
        </div>
      </div>
    );
  }

  // Bank management functions
  const handleAddBank = async (newBank: Omit<Bank, 'id'>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Adding bank:', newBank.name);
      
      // Create bank in Airtable (ID will be auto-generated)
      const createdBank = await airtableService.createBank({
        id: '', // Will be ignored by Airtable
        ...newBank,
      });
      
      setBanks(prev => [...prev, createdBank]);
      console.log('✅ Bank added successfully:', createdBank.name);
      
    } catch (err) {
      console.error('Error adding bank:', err);
      setError(`Failed to add bank: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBank = async (bankId: string, updates: Partial<Bank>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedBank = await airtableService.updateBank(bankId, updates);
      setBanks(prev => 
        prev.map(bank => 
          bank.id === bankId ? updatedBank : bank
        )
      );
    } catch (err) {
      console.error('Error updating bank:', err);
      setError(`Failed to update bank: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBank = async (bankId: string) => {
    // Check if bank has transactions
    const hasTransactions = transactions.some(t => t.bankId === bankId);
    if (hasTransactions) {
      alert('Cannot delete bank with existing transactions. Please move or delete transactions first.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      await airtableService.deleteBank(bankId);
      setBanks(prev => prev.filter(bank => bank.id !== bankId));
    } catch (err) {
      console.error('Error deleting bank:', err);
      setError(`Failed to delete bank: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Transaction management functions
  const handleAddTransaction = async (newTransaction: Omit<Transaction, 'id'>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Adding transaction:', newTransaction.title);
      
      // Create transaction in Airtable (ID will be auto-generated)
      const createdTransaction = await airtableService.createTransaction({
        id: '', // Will be ignored by Airtable
        ...newTransaction,
      });
      
      setTransactions(prev => [...prev, createdTransaction]);
      console.log('✅ Transaction added successfully:', createdTransaction.title);
      
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError(`Failed to add transaction: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTransaction = async (updatedTransaction: Omit<Transaction, 'id'>) => {
    if (!editingTransaction) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const updated = await airtableService.updateTransaction(editingTransaction.id, updatedTransaction);
      setTransactions(prev => 
        prev.map(t => 
          t.id === editingTransaction.id ? updated : t
        )
      );
      setEditingTransaction(null);
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError(`Failed to update transaction: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await airtableService.deleteTransaction(transactionId);
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
    } catch (err) {
      console.error('Error deleting transaction:', err);
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

  // Sorting functions
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return null;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4 ml-1" /> : 
      <ChevronDown className="h-4 w-4 ml-1" />;
  };

  // Filter transactions - SIMPLIFIED: No transfers
  const filteredTransactions = transactions.filter(transaction => {
    let typeMatches = false;
    
    if (activeFilter === 'income') {
      typeMatches = transaction.type === 'income';
    } else if (activeFilter === 'expense') {
      typeMatches = transaction.type === 'expense' || transaction.type === 'debt';
    } else if (activeFilter === 'debt') {
      typeMatches = transaction.type === 'debt';
    }
    
    // Bank filtering
    if (activeBankFilter.startsWith('all-')) {
      return typeMatches;
    }
    
    return typeMatches && transaction.bankId === activeBankFilter;
  });

  // Sort the filtered transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortColumn) {
      case 'name':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'amount':
        aValue = a.amount;
        bValue = b.amount;
        break;
      case 'frequency':
        const frequencyOrder = { 'weekly': 1, 'bi-weekly': 2, '4-weekly': 3, 'monthly': 4, 'yearly': 5 };
        aValue = frequencyOrder[a.frequency as keyof typeof frequencyOrder] || 6;
        bValue = frequencyOrder[b.frequency as keyof typeof frequencyOrder] || 6;
        break;
      case 'monthlyAmount':
        aValue = calculateMonthlyAmount(a.amount, a.frequency);
        bValue = calculateMonthlyAmount(b.amount, b.frequency);
        break;
      case 'remainingDebt':
        aValue = a.remainingBalance || 0;
        bValue = b.remainingBalance || 0;
        break;
      case 'interest':
        aValue = a.monthlyInterest || 0;
        bValue = b.monthlyInterest || 0;
        break;
      case 'weeksUntilPaidOff':
        // UPDATED: Handle zero payments and interest in sorting
        const getWeeksForSorting = (t: Transaction) => {
          const weeks = calculateWeeksUntilPaidOff(t);
          if (weeks === null) {
            const netPayment = calculateNetMonthlyDebtPayment(t);
            if (netPayment <= 0) return Number.MAX_SAFE_INTEGER - 2; // "Debt growing"
            if (!t.amount || t.amount <= 0) return Number.MAX_SAFE_INTEGER - 1; // "Not paying"
            return Number.MAX_SAFE_INTEGER; // "Never"
          }
          return weeks;
        };
        aValue = getWeeksForSorting(a);
        bValue = getWeeksForSorting(b);
        break;
      case 'dueDate':
        // UPDATED: Sort by next due date instead of original date
        aValue = getNextDueDate(a.date, a.frequency).getTime();
        bValue = getNextDueDate(b.date, b.frequency).getTime();
        break;
      case 'bank':
        aValue = getBankName(a.bankId).toLowerCase();
        bValue = getBankName(b.bankId).toLowerCase();
        break;
      default:
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
    }

    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Calculate summary statistics - NO TRANSFERS
  const allSummary = calculateSummary(transactions);
  
  // UPDATED: Only include debt payments that have amount > 0 (actually being paid)
  const debtSummary = calculateSummary(transactions.filter(t => t.type === 'debt' && t.amount > 0));
  
  // Calculate total expenses including debt payments (only ones being paid)
  const totalExpenseAndDebt = transactions
    .filter(t => {
      if (t.type === 'expense') return true;
      if (t.type === 'debt') return t.amount > 0; // Only count debts being paid
      return false;
    })
    .reduce((sum, t) => sum + calculateMonthlyAmount(t.amount, t.frequency), 0);

  // Bank-specific calculations with automatic transfer
  const hsbcTotals = calculateBankTotals('hsbc'); // Includes HSBC + Barclays
  const santanderTotals = calculateBankTotals('santander');

  // Calculate totals for bottom summary (only paid transactions)
  const weeklyTotal = sortedTransactions
    .filter(t => {
      if (t.type === 'income' || t.type === 'expense') return true;
      if (t.type === 'debt') return t.amount > 0; // Only count debts being paid
      return false;
    })
    .reduce((sum, t) => sum + (calculateMonthlyAmount(t.amount, t.frequency) / 4.33), 0);
  
  const monthlyTotal = sortedTransactions
    .filter(t => {
      if (t.type === 'income' || t.type === 'expense') return true;
      if (t.type === 'debt') return t.amount > 0; // Only count debts being paid
      return false;
    })
    .reduce((sum, t) => sum + calculateMonthlyAmount(t.amount, t.frequency), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Mobile responsive with improved spacing */}
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src={logoIcon} 
                alt="Financial Tracker" 
                className="h-5 w-5 sm:h-6 sm:w-6 opacity-80"
              />
              <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">
                <span className="hidden sm:inline">Finances Dashboard</span>
                <span className="sm:hidden">Finances</span>
              </h1>
              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
            </div>
            
            {/* Header buttons - increased spacing for better visual separation */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Button 
                variant="secondary" 
                size="sm" 
                className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                onClick={() => setIsBankManagementOpen(true)}
                disabled={isLoading}
              >
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Manage</span>
                <span className="xs:hidden">Banks</span>
              </Button>
              
              {/* Mobile: Clean circular plus button, Desktop: Normal button with text */}
              <Button 
                size="sm" 
                className="mobile-add-btn sm:gap-2 sm:text-sm sm:px-3"
                onClick={() => setIsTransactionModalOpen(true)}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Add Transaction</span>
              </Button>

              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 sm:gap-2 text-red-400 border-red-400/30 hover:bg-red-500/10 text-xs sm:text-sm px-2 sm:px-3"
                onClick={handleLogout}
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm whitespace-pre-line">
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-red-300 hover:text-red-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Added bottom padding for mobile */}
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-20 sm:pb-8 space-y-4 sm:space-y-6">
        {/* Empty State */}
        {banks.length === 0 && transactions.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto px-4">
              <div className="mb-6">
                <CreditCard className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Welcome to Your Financial Tracker</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6">
                Get started by adding your first bank and then start tracking your financial transactions.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setIsBankManagementOpen(true)} className="gap-2 text-sm">
                  <Settings className="h-4 w-4" />
                  Add Your First Bank
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards - Mobile responsive */}
        {(banks.length > 0 || transactions.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Total Monthly Income */}
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

            {/* Total Monthly Expenses */}
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

            {/* Total Debt Remaining */}
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
        )}

        {/* Bank Overview Cards - Mobile responsive */}
        {transactions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* HSBC Overview */}
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

            {/* Santander Overview - Added Weekly Transfer Amount */}
            <Card className="p-4 sm:p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground text-sm sm:text-base">Santander Overview</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsTransferEditOpen(true)}
                >
                  <Edit3 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
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
                {/* NEW: Show weekly transfer amount */}
                <div className="flex justify-between items-center pt-1 border-t border-border/40">
                  <span className="text-xs sm:text-sm text-muted-foreground">Weekly Transfer In:</span>
                  <span className="font-medium text-sm sm:text-base text-blue-400">
                    {formatCurrency(weeklyTransferAmount)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Category Filter Buttons - Mobile responsive */}
        {transactions.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex gap-1 p-1 bg-muted/30 rounded-2xl border border-border/50">
              <button
                onClick={() => {
                  setActiveFilter('income');
                  setActiveBankFilter('all-income');
                }}
                className={`category-filter-btn flex items-center justify-center gap-1 sm:gap-2 flex-1 py-2.5 sm:py-3 px-3 sm:px-6 rounded-xl transition-all duration-200 text-sm sm:text-base ${
                  activeFilter === 'income'
                    ? 'bg-card shadow-sm border border-border text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Income</span>
              </button>
              
              <button
                onClick={() => {
                  setActiveFilter('expense');
                  setActiveBankFilter('all-expenses');
                }}
                className={`category-filter-btn flex items-center justify-center gap-1 sm:gap-2 flex-1 py-2.5 sm:py-3 px-3 sm:px-6 rounded-xl transition-all duration-200 text-sm sm:text-base ${
                  activeFilter === 'expense'
                    ? 'bg-card shadow-sm border border-border text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Expenses</span>
              </button>
              
              <button
                onClick={() => {
                  setActiveFilter('debt');
                  setActiveBankFilter('all-debt');
                }}
                className={`category-filter-btn flex items-center justify-center gap-1 sm:gap-2 flex-1 py-2.5 sm:py-3 px-3 sm:px-6 rounded-xl transition-all duration-200 text-sm sm:text-base ${
                  activeFilter === 'debt'
                    ? 'bg-card shadow-sm border border-border text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Debt</span>
              </button>
            </div>

            {/* Bank Filter Pills - Mobile horizontal scrolling */}
            {banks.length > 0 && (
              <div className="overflow-x-auto">
                <div className="flex gap-2 pb-2 min-w-max">
                  {/* "All Banks" option */}
                  {(activeFilter === 'income' || activeFilter === 'expense') && (
                    <button
                      onClick={() => setActiveBankFilter(activeFilter === 'income' ? 'all-income' : 'all-expenses')}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border transition-all duration-200 text-sm whitespace-nowrap ${
                        activeBankFilter === (activeFilter === 'income' ? 'all-income' : 'all-expenses')
                          ? 'bg-card border-border shadow-sm text-foreground'
                          : 'bg-muted/20 border-muted text-muted-foreground hover:bg-muted/40 hover:text-foreground hover:border-border/60'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-green-400" />
                      <span>All Banks</span>
                    </button>
                  )}

                  {/* Individual bank filters */}
                  {banks.map((bank) => (
                    <button
                      key={bank.id}
                      onClick={() => setActiveBankFilter(bank.id)}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border transition-all duration-200 text-sm whitespace-nowrap ${
                        activeBankFilter === bank.id
                          ? 'bg-card border-border shadow-sm text-foreground'
                          : 'bg-muted/20 border-muted text-muted-foreground hover:bg-muted/40 hover:text-foreground hover:border-border/60'
                      }`}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: bank.color }}
                      />
                      <span>{bank.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transactions Table - Mobile responsive with horizontal scroll */}
        {transactions.length > 0 && (
          <>
            <Card className="bg-card border-border overflow-hidden">
              <div className="table-container custom-scrollbar overflow-x-auto">
                <table className="sticky-table min-w-full">
                  <thead>
                    <tr>
                      <th 
                        className="sortable text-muted-foreground text-left hover:text-foreground transition-colors whitespace-nowrap"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          Name
                          {getSortIcon('name')}
                        </div>
                      </th>
                      <th 
                        className="sortable text-muted-foreground text-left hover:text-foreground transition-colors whitespace-nowrap"
                        onClick={() => handleSort('amount')}
                      >
                        <div className="flex items-center">
                          {activeFilter === 'debt' ? 'Payment' : 'Amount'}
                          {getSortIcon('amount')}
                        </div>
                      </th>
                      {/* Hide Frequency and Monthly Amount columns for debt */}
                      {activeFilter !== 'debt' && (
                        <>
                          <th 
                            className="sortable text-muted-foreground text-left hover:text-foreground transition-colors whitespace-nowrap"
                            onClick={() => handleSort('frequency')}
                          >
                            <div className="flex items-center">
                              Frequency
                              {getSortIcon('frequency')}
                            </div>
                          </th>
                          <th 
                            className="sortable text-muted-foreground text-left hover:text-foreground transition-colors whitespace-nowrap"
                            onClick={() => handleSort('monthlyAmount')}
                          >
                            <div className="flex items-center">
                              Monthly Amount
                              {getSortIcon('monthlyAmount')}
                            </div>
                          </th>
                        </>
                      )}
                      {activeFilter === 'debt' && (
                        <>
                          <th 
                            className="sortable text-muted-foreground text-left hover:text-foreground transition-colors whitespace-nowrap"
                            onClick={() => handleSort('interest')}
                          >
                            <div className="flex items-center">
                              Monthly Interest
                              {getSortIcon('interest')}
                            </div>
                          </th>
                          <th 
                            className="sortable text-muted-foreground text-left hover:text-foreground transition-colors whitespace-nowrap"
                            onClick={() => handleSort('remainingDebt')}
                          >
                            <div className="flex items-center">
                              Remaining Debt
                              {getSortIcon('remainingDebt')}
                            </div>
                          </th>
                          <th 
                            className="sortable text-muted-foreground text-left hover:text-foreground transition-colors whitespace-nowrap"
                            onClick={() => handleSort('weeksUntilPaidOff')}
                          >
                            <div className="flex items-center">
                              Weeks Until Paid Off
                              {getSortIcon('weeksUntilPaidOff')}
                            </div>
                          </th>
                        </>
                      )}
                      <th 
                        className="sortable text-muted-foreground text-left hover:text-foreground transition-colors whitespace-nowrap"
                        onClick={() => handleSort('dueDate')}
                      >
                        <div className="flex items-center">
                          Next Due Date
                          {getSortIcon('dueDate')}
                        </div>
                      </th>
                      <th 
                        className="sortable text-muted-foreground text-left hover:text-foreground transition-colors whitespace-nowrap"
                        onClick={() => handleSort('bank')}
                      >
                        <div className="flex items-center">
                          Bank
                          {getSortIcon('bank')}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTransactions.map((transaction) => (
                      <tr 
                        key={transaction.id} 
                        className="cursor-pointer transition-colors"
                        onClick={() => handleTransactionClick(transaction)}
                      >
                        <td className="font-medium text-foreground whitespace-nowrap">
                          <div className="max-w-[150px] sm:max-w-none truncate">
                            {transaction.title}
                          </div>
                        </td>
                        <td className="text-foreground whitespace-nowrap">
                          <span className={transaction.amount === 0 && transaction.type === 'debt' ? 'text-muted-foreground' : ''}>
                            {formatCurrency(transaction.amount)}
                            {transaction.amount === 0 && transaction.type === 'debt' && (
                              <span className="text-xs ml-1 hidden sm:inline">(not paying)</span>
                            )}
                          </span>
                        </td>
                        {/* Hide Frequency and Monthly Amount columns for debt */}
                        {activeFilter !== 'debt' && (
                          <>
                            <td className="whitespace-nowrap">
                              <Badge variant="outline" className={`${getFrequencyColor(transaction.frequency)} border text-xs`}>
                                {transaction.frequency}
                              </Badge>
                            </td>
                            <td className="text-foreground whitespace-nowrap">
                              {formatCurrency(calculateMonthlyAmount(transaction.amount, transaction.frequency))}
                            </td>
                          </>
                        )}
                        {activeFilter === 'debt' && (
                          <>
                            <td className="text-yellow-400 whitespace-nowrap">
                              {transaction.monthlyInterest 
                                ? formatCurrency(transaction.monthlyInterest)
                                : <span className="text-muted-foreground">£0.00</span>
                              }
                            </td>
                            <td className="text-orange-400 whitespace-nowrap">{formatCurrency(transaction.remainingBalance || 0)}</td>
                            <td className={`whitespace-nowrap ${transaction.amount === 0 ? 'text-muted-foreground' : calculateNetMonthlyDebtPayment(transaction) <= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                              {calculateWeeksUntilPaidOffDisplay(transaction)}
                            </td>
                          </>
                        )}
                        <td className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                              <span className={`${getDueDateColor(transaction.date, transaction.frequency)} text-xs sm:text-sm`}>
                                {formatDate(getNextDueDate(transaction.date, transaction.frequency))}
                              </span>
                              <div className="text-xs text-muted-foreground">
                                {formatDueDate(transaction.date, transaction.frequency)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: getBankColor(transaction.bankId) }}
                            />
                            <span className="text-foreground text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">
                              {getBankName(transaction.bankId)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Bottom Summary - Mobile responsive */}
            {(activeFilter === 'income' || activeFilter === 'expense') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Card className="p-3 sm:p-4 bg-card border-border">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                      Weekly {getActiveFilterDisplayName()}
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-foreground">{formatCurrency(weeklyTotal)}</p>
                  </div>
                </Card>
                
                <Card className="p-3 sm:p-4 bg-card border-border">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                      Monthly {getActiveFilterDisplayName()}
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-foreground">{formatCurrency(monthlyTotal)}</p>
                  </div>
                </Card>
              </div>
            )}

            {/* Debt Information - Mobile responsive */}
            {activeFilter === 'debt' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <Card className="p-4 sm:p-6 bg-card border-border">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">Total Monthly Debt Payments</h3>
                    <p className="text-xl sm:text-2xl font-bold text-orange-400">{formatCurrency(debtSummary.monthlyDebt)}</p>
                    <p className="text-xs text-muted-foreground">Monthly amount paid towards debt (active payments only)</p>
                  </div>
                </Card>
                <Card className="p-4 sm:p-6 bg-card border-border">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">Total Monthly Interest</h3>
                    <p className="text-xl sm:text-2xl font-bold text-yellow-400">
                      {formatCurrency(
                        transactions
                          .filter(t => t.type === 'debt' && t.monthlyInterest)
                          .reduce((sum, t) => sum + (t.monthlyInterest || 0), 0)
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">Interest charges across all debts</p>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer with Logo - Mobile focused */}
      <footer className="border-t border-border bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 sm:gap-2">
            {/* Logo and App Name */}
            <div className="flex items-center gap-3 opacity-60">
              <img 
                src={logoIcon} 
                alt="Financial Tracker" 
                className="h-5 w-5 sm:h-4 sm:w-4"
              />
              <span className="text-sm sm:text-xs text-muted-foreground">
                Financial Tracker
              </span>
            </div>
            
            {/* Optional additional footer content */}
            <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
              <span>Made with ❤️ for better financial planning</span>
            </div>

            {/* Mobile: Just a simple divider */}
            <div className="sm:hidden w-full max-w-xs h-px bg-border opacity-30"></div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BankManagementModal
        isOpen={isBankManagementOpen}
        onClose={() => setIsBankManagementOpen(false)}
        banks={banks}
        onAddBank={handleAddBank}
        onUpdateBank={handleUpdateBank}
        onDeleteBank={handleDeleteBank}
      />

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={handleCloseTransactionModal}
        onAddTransaction={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
        banks={banks}
        editTransaction={editingTransaction}
      />

      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        transaction={selectedTransaction}
        banks={banks}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
      />

      <TransferEditModal
        isOpen={isTransferEditOpen}
        onClose={() => setIsTransferEditOpen(false)}
        currentAmount={weeklyTransferAmount}
        onSave={handleSaveTransferAmount}
      />
    </div>
  );
}