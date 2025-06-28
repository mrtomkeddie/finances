import { Transaction, FinancialSummary, TransactionFrequency } from '../types/financial';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

export function calculateMonthlyAmount(amount: number, frequency: TransactionFrequency): number {
  switch (frequency) {
    case 'weekly':
      return amount * 4.33; // Average weeks per month
    case 'bi-weekly':
      return amount * 2.17; // Every 2 weeks
    case '4-weekly':
      return amount * 1.08; // Every 4 weeks
    case 'monthly':
      return amount;
    case 'yearly':
      return amount / 12;
    default:
      return amount;
  }
}

// Calculate the actual monthly interest amount based on input type
export function calculateMonthlyInterest(transaction: Transaction): number {
  if (!transaction.remainingBalance || transaction.remainingBalance <= 0) {
    return 0;
  }

  // If no interest type specified, fall back to direct monetary amount
  if (!transaction.interestType) {
    return transaction.monthlyInterest || 0;
  }

  if (transaction.interestType === 'monetary') {
    return transaction.monthlyInterest || 0;
  }

  if (transaction.interestType === 'percentage' && transaction.interestRate) {
    const rate = transaction.interestRate / 100; // Convert percentage to decimal
    
    if (transaction.rateFrequency === 'annual') {
      // Annual rate - divide by 12 for monthly
      return transaction.remainingBalance * (rate / 12);
    } else {
      // Monthly rate
      return transaction.remainingBalance * rate;
    }
  }

  return 0;
}

// Calculate net monthly payment after interest
export function calculateNetMonthlyDebtPayment(transaction: Transaction): number {
  if (transaction.type !== 'debt') return 0;
  
  const monthlyPayment = calculateMonthlyAmount(transaction.amount, transaction.frequency);
  const monthlyInterest = calculateMonthlyInterest(transaction);
  
  return monthlyPayment - monthlyInterest;
}

// Calculate weeks until debt is paid off
export function calculateWeeksUntilPaidOff(transaction: Transaction): number | null {
  if (transaction.type !== 'debt' || !transaction.remainingBalance || transaction.remainingBalance <= 0) {
    return null;
  }

  if (!transaction.amount || transaction.amount <= 0) {
    return null; // Not making payments
  }

  const monthlyPayment = calculateMonthlyAmount(transaction.amount, transaction.frequency);
  const monthlyInterest = calculateMonthlyInterest(transaction);
  const netMonthlyPayment = monthlyPayment - monthlyInterest;

  if (netMonthlyPayment <= 0) {
    return null; // Debt will grow or stay the same
  }

  // Calculate months to pay off
  const monthsToPayOff = transaction.remainingBalance / netMonthlyPayment;
  
  // Convert to weeks
  return Math.ceil(monthsToPayOff * 4.33);
}

export function calculateSummary(transactions: Transaction[]): FinancialSummary {
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const debtTransactions = transactions.filter(t => t.type === 'debt');

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalDebt = debtTransactions.reduce((sum, t) => sum + (t.remainingBalance || 0), 0);

  const monthlyIncome = incomeTransactions.reduce((sum, t) => sum + calculateMonthlyAmount(t.amount, t.frequency), 0);
  const monthlyExpenses = expenseTransactions.reduce((sum, t) => sum + calculateMonthlyAmount(t.amount, t.frequency), 0);
  const monthlyDebt = debtTransactions.reduce((sum, t) => sum + calculateMonthlyAmount(t.amount, t.frequency), 0);

  const weeklyIncome = monthlyIncome / 4.33;
  const weeklyExpenses = monthlyExpenses / 4.33;
  const weeklyDebt = monthlyDebt / 4.33;

  return {
    totalIncome,
    totalExpenses,
    totalDebt,
    weeklyIncome,
    weeklyExpenses,
    weeklyDebt,
    monthlyIncome,
    monthlyExpenses,
    monthlyDebt,
    netMonthly: monthlyIncome - monthlyExpenses - monthlyDebt,
    netWeekly: weeklyIncome - weeklyExpenses - weeklyDebt,
  };
}

// Format interest rate for display
export function formatInterestRate(transaction: Transaction): string {
  if (!transaction.interestType || transaction.interestType === 'monetary') {
    return formatCurrency(transaction.monthlyInterest || 0);
  }

  if (transaction.interestType === 'percentage' && transaction.interestRate) {
    const suffix = transaction.rateFrequency === 'annual' ? ' APR' : '/month';
    return `${transaction.interestRate}%${suffix}`;
  }

  return formatCurrency(0);
}

// Get display label for interest input
export function getInterestInputLabel(interestType: 'monetary' | 'percentage', rateFrequency?: 'monthly' | 'annual'): string {
  if (interestType === 'monetary') {
    return 'Monthly Interest Charged (£)';
  }
  
  if (rateFrequency === 'annual') {
    return 'Annual Interest Rate (%)';
  }
  
  return 'Monthly Interest Rate (%)';
}