import { Transaction, FinancialSummary } from '../types/financial';

export function calculateMonthlyAmount(amount: number, frequency: string): number {
  switch (frequency) {
    case 'weekly':
      return amount * 4.33; // Average weeks per month
    case 'bi-weekly':
      return amount * 2.17; // Every two weeks
    case '4-weekly':
      return amount * 1.08; // Every 4 weeks (roughly monthly)
    case 'monthly':
      return amount;
    case 'yearly':
      return amount / 12;
    default:
      return amount;
  }
}

export function calculateWeeklyAmount(amount: number, frequency: string): number {
  switch (frequency) {
    case 'weekly':
      return amount;
    case 'bi-weekly':
      return amount / 2;
    case '4-weekly':
      return amount / 4;
    case 'monthly':
      return amount / 4.33;
    case 'yearly':
      return amount / 52;
    default:
      return amount;
  }
}

export function calculateSummary(transactions: Transaction[]): FinancialSummary {
  let weeklyIncome = 0;
  let weeklyExpenses = 0;
  let weeklyDebt = 0;
  let totalDebt = 0;

  transactions.forEach(transaction => {
    const weeklyAmount = calculateWeeklyAmount(transaction.amount, transaction.frequency);
    
    switch (transaction.type) {
      case 'income':
        weeklyIncome += weeklyAmount;
        break;
      case 'expense':
        weeklyExpenses += weeklyAmount;
        break;
      case 'debt':
        // Only count debt payments that are actually being paid (amount > 0)
        if (transaction.amount > 0) {
          weeklyDebt += weeklyAmount;
        }
        // Always count remaining balance towards total debt
        totalDebt += transaction.remainingBalance || 0;
        break;
    }
  });

  const monthlyIncome = weeklyIncome * 4.33;
  const monthlyExpenses = weeklyExpenses * 4.33;
  const monthlyDebt = weeklyDebt * 4.33;
  const weeklyNet = weeklyIncome - weeklyExpenses - weeklyDebt;
  const monthlyNet = monthlyIncome - monthlyExpenses - monthlyDebt;

  return {
    weeklyIncome,
    monthlyIncome,
    weeklyExpenses,
    monthlyExpenses,
    weeklyDebt,
    monthlyDebt,
    totalDebt,
    weeklyNet,
    monthlyNet,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateNetMonthlyDebtPayment(transaction: Transaction): number {
  if (transaction.type !== 'debt') return 0;
  
  const monthlyPayment = calculateMonthlyAmount(transaction.amount, transaction.frequency);
  const monthlyInterest = transaction.monthlyInterest || 0;
  
  return monthlyPayment - monthlyInterest;
}

export function calculateWeeksUntilPaidOff(transaction: Transaction): number | null {
  if (transaction.type !== 'debt' || !transaction.remainingBalance || transaction.remainingBalance <= 0) {
    return null;
  }
  
  if (!transaction.amount || transaction.amount <= 0) {
    return null; // Not paying anything
  }
  
  const monthlyPayment = calculateMonthlyAmount(transaction.amount, transaction.frequency);
  const monthlyInterest = transaction.monthlyInterest || 0;
  const netMonthlyPayment = monthlyPayment - monthlyInterest;
  
  if (netMonthlyPayment <= 0) {
    return null; // Debt is growing or staying the same
  }
  
  const monthsUntilPaidOff = transaction.remainingBalance / netMonthlyPayment;
  const weeksUntilPaidOff = Math.ceil(monthsUntilPaidOff * 4.33);
  
  return weeksUntilPaidOff;
}

export function getInterestCalculation(transaction: Transaction): {
  monthlyInterest: number;
  annualInterest: number;
} {
  if (transaction.type !== 'debt' || !transaction.remainingBalance) {
    return { monthlyInterest: 0, annualInterest: 0 };
  }

  if (transaction.interestType === 'monetary') {
    // Interest is a fixed monetary amount
    const monthlyInterest = transaction.rateFrequency === 'annual' 
      ? (transaction.interestRate || 0) / 12 
      : (transaction.interestRate || 0);
    
    return {
      monthlyInterest,
      annualInterest: monthlyInterest * 12,
    };
  } else {
    // Interest is a percentage
    const annualRate = transaction.rateFrequency === 'monthly' 
      ? (transaction.interestRate || 0) * 12 
      : (transaction.interestRate || 0);
    
    const monthlyRate = annualRate / 12 / 100; // Convert to decimal
    const monthlyInterest = transaction.remainingBalance * monthlyRate;
    
    return {
      monthlyInterest,
      annualInterest: monthlyInterest * 12,
    };
  }
}

export function calculateDebtProjection(transaction: Transaction, months: number): {
  monthlyPayments: number[];
  remainingBalances: number[];
  interestPaid: number[];
  totalInterestPaid: number;
} {
  if (transaction.type !== 'debt' || !transaction.remainingBalance) {
    return {
      monthlyPayments: [],
      remainingBalances: [],
      interestPaid: [],
      totalInterestPaid: 0,
    };
  }

  const monthlyPayments: number[] = [];
  const remainingBalances: number[] = [];
  const interestPaid: number[] = [];
  
  let currentBalance = transaction.remainingBalance;
  let totalInterestPaid = 0;
  
  const monthlyPayment = calculateMonthlyAmount(transaction.amount, transaction.frequency);
  
  for (let month = 0; month < months; month++) {
    const { monthlyInterest } = getInterestCalculation({
      ...transaction,
      remainingBalance: currentBalance,
    });
    
    const principalPayment = Math.min(monthlyPayment - monthlyInterest, currentBalance);
    currentBalance = Math.max(0, currentBalance - principalPayment);
    
    monthlyPayments.push(monthlyPayment);
    remainingBalances.push(currentBalance);
    interestPaid.push(monthlyInterest);
    totalInterestPaid += monthlyInterest;
    
    if (currentBalance <= 0) break;
  }
  
  return {
    monthlyPayments,
    remainingBalances,
    interestPaid,
    totalInterestPaid,
  };
}