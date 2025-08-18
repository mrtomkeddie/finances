
import { Transaction, FinancialSummary, TransactionFrequency, Currency } from './types';
import { getExchangeRate } from './currencyService';

export function formatCurrency(amount: number, currency: Currency = 'GBP'): string {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
  };

  // For USD, use en-US locale to get the correct symbol prefix
  let locale = 'en-GB';
  if (currency === 'USD') locale = 'en-US';
  if (currency === 'AUD') locale = 'en-AU';
  
  return new Intl.NumberFormat(locale, options).format(amount);
}

export async function getLiveRate(from: Currency, to: Currency): Promise<number> {
    return getExchangeRate(from, to);
}

export async function convertToGbp(amount: number, currency: Currency): Promise<number> {
  if (currency === 'GBP') {
    return amount;
  }
  if (currency === 'USD' || currency === 'AUD') {
    const rate = await getLiveRate(currency, 'GBP');
    return amount * rate;
  }
  return amount;
}


export function calculateMonthlyAmount(amount: number, frequency: TransactionFrequency): number {
  switch (frequency) {
    case 'weekly':
      return amount * 4.33; // Average weeks per month
    case 'bi-weekly':
      return amount * 2.17; // Every 2 weeks
    case '4-weekly':
      return amount * (13 / 12); // 13 4-week periods in a year
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

export function calculateSummary(transactions: Transaction[]) {
    const monthlyIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + calculateMonthlyAmount(t.amount, t.frequency), 0);
  
    const monthlyExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + calculateMonthlyAmount(t.amount, t.frequency), 0);
  
    const monthlyDebt = transactions
      .filter((t) => t.type === 'debt' && t.amount > 0) // Only count active payments
      .reduce((sum, t) => sum + calculateMonthlyAmount(t.amount, t.frequency), 0);
  
    const totalDebt = transactions
      .filter((t) => t.type === 'debt')
      .reduce((sum, t) => sum + (t.remainingBalance || 0), 0);
  
    const weeklyIncome = monthlyIncome / 4.33;
  
    return {
      monthlyIncome,
      monthlyExpenses,
      monthlyDebt,
      totalDebt,
      weeklyIncome,
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
