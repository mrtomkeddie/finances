
import { Transaction, Currency } from './types';
import { getLiveRate } from './financial';

export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function getDaysUntil(dateString: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isOverdue(dateString: string): boolean {
  return getDaysUntil(dateString) < 0;
}

// NEW: Calculate the next due date based on frequency - never returns past dates
export function getNextDueDate(originalDateString: string, frequency: string): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const originalDate = new Date(originalDateString);
  originalDate.setHours(0, 0, 0, 0);
  
  // If original date is in the future, return it
  if (originalDate >= today) {
    return originalDate;
  }
  
  let nextDueDate = new Date(originalDate);
  
  switch (frequency) {
    case 'weekly':
      // Add weeks until we get a future date
      while (nextDueDate <= today) {
        nextDueDate.setDate(nextDueDate.getDate() + 7);
      }
      break;
      
    case 'bi-weekly':
      // Add 2-week periods until we get a future date
      while (nextDueDate <= today) {
        nextDueDate.setDate(nextDueDate.getDate() + 14);
      }
      break;
      
    case '4-weekly':
      // Add 4-week periods until we get a future date
      while (nextDueDate <= today) {
        nextDueDate.setDate(nextDueDate.getDate() + 28);
      }
      break;
      
    case 'monthly':
      // Add months until we get a future date
      while (nextDueDate <= today) {
        const originalDay = originalDate.getDate();
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        
        // Handle end-of-month dates (e.g., Jan 31 -> Feb 28)
        const daysInMonth = new Date(nextDueDate.getFullYear(), nextDueDate.getMonth() + 1, 0).getDate();
        const targetDay = Math.min(originalDay, daysInMonth);
        nextDueDate.setDate(targetDay);
      }
      break;
      
    case 'yearly':
      // Add years until we get a future date
      while (nextDueDate <= today) {
        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
      }
      break;
      
    default:
      // For unknown frequencies, just return tomorrow
      nextDueDate = new Date(today);
      nextDueDate.setDate(today.getDate() + 1);
  }
  
  return nextDueDate;
}

// UPDATED: Get days until next due date (always positive or zero)
export function getDaysUntilNext(originalDateString: string, frequency: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const nextDueDate = getNextDueDate(originalDateString, frequency);
  nextDueDate.setHours(0, 0, 0, 0);
  
  const diffTime = nextDueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// UPDATED: Format due date message for next due date (never shows past dates)
export function formatNextDueDate(originalDateString: string, frequency: string): string {
  const daysUntil = getDaysUntilNext(originalDateString, frequency);
  
  if (daysUntil === 0) {
    return 'Due today';
  } else if (daysUntil === 1) {
    return 'Due tomorrow';
  } else {
    return `Due in ${daysUntil} days`;
  }
}

// UPDATED: Get color for next due date (always future-focused)
export function getNextDueDateColor(originalDateString: string, frequency: string): string {
  const daysUntil = getDaysUntilNext(originalDateString, frequency);
  
  if (daysUntil <= 0) return 'text-red-400 font-bold'; // Due today
  if (daysUntil <= 3) return 'text-orange-400 font-semibold'; // Due in 1-3 days
  if (daysUntil <= 7) return 'text-yellow-400';  // Due within a week
  return 'text-foreground';
}

// Get the next 7 days starting from today
export function getNext7Days(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(date);
  }
  
  return days;
}

// Format date for display in calendar
export function formatCalendarDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
  });
}

// Get day name (Mon, Tue, etc.)
export function getDayName(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
  });
}

// Check if date is today
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

// Get the day of week (0 = Sunday, 1 = Monday, etc.)
export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

// Get the date of the month
export function getDayOfMonth(date: Date): number {
  return date.getDate();
}

// Check if a transaction is due on a specific date based on its frequency and original date
export function isTransactionDueOnDate(transaction: Transaction, targetDate: Date): boolean {
  const originalDate = new Date(transaction.date);
  const target = new Date(targetDate);
  
  // Normalize dates to midnight for comparison
  originalDate.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  
  // If target date is before original date, not due yet
  if (target < originalDate) {
    return false;
  }
  
  // Calculate days difference
  const daysDiff = Math.round((target.getTime() - originalDate.getTime()) / (1000 * 60 * 60 * 24));
  
  switch (transaction.frequency) {
    case 'weekly':
      return daysDiff % 7 === 0;
      
    case 'bi-weekly':
      return daysDiff % 14 === 0;
      
    case '4-weekly':
      return daysDiff % 28 === 0;
      
    case 'monthly':
      const originalDay = originalDate.getDate();
      const targetDay = target.getDate();
      
      if (originalDay > targetDay) return false;

      let tempDate = new Date(originalDate);
      while(tempDate < target) {
        tempDate.setMonth(tempDate.getMonth() + 1);
        if(tempDate.getTime() === target.getTime()) return true;
      }
      return tempDate.getTime() === target.getTime();

    case 'yearly':
      // Same month and day each year
      return target.getMonth() === originalDate.getMonth() && 
             target.getDate() === originalDate.getDate();
      
    default:
      return false;
  }
}

// Get all transactions due on a specific date
export function getTransactionsDueOnDate(transactions: Transaction[], targetDate: Date): Transaction[] {
  return transactions.filter(transaction => 
    isTransactionDueOnDate(transaction, targetDate)
  );
}

// Get transactions due on a specific date, grouped by type
export function getTransactionsByTypeOnDate(transactions: Transaction[], targetDate: Date): {
  income: Transaction[];
  expenses: Transaction[];
} {
  const dueTransactions = getTransactionsDueOnDate(transactions, targetDate);
  
  const income = dueTransactions.filter(t => t.type === 'income');
  const expenses = dueTransactions.filter(t => t.type === 'expense' || (t.type === 'debt' && t.amount > 0));
  
  return { income, expenses };
}

// Calculate total income and expenses for a specific date
export async function calculateDayTotals(
  transactions: Transaction[], 
  targetDate: Date
): Promise<{ income: number; expenses: number; debts: number; }> {
  const dueTransactions = getTransactionsDueOnDate(transactions, targetDate);
  
  let income = 0;
  let expenses = 0;
  let debts = 0;

  const today = new Date();
  today.setHours(0,0,0,0);
  const isFutureDate = targetDate > today;

  for (const transaction of dueTransactions) {
    let amount = transaction.amount;

    // If it's a future date and a foreign currency, use the live rate
    if (isFutureDate && transaction.currency !== 'GBP' && transaction.originalAmount) {
      try {
        const liveRate = await getLiveRate(transaction.currency as Currency, 'GBP');
        amount = transaction.originalAmount * liveRate;
      } catch (error) {
        console.error("Could not fetch live rate for forecast, using stored amount", error);
        // fallback to stored amount
        amount = transaction.amount;
      }
    }

    if (transaction.type === 'income') {
      income += amount;
    } else if (transaction.type === 'expense') {
      expenses += amount;
    } else if (transaction.type === 'debt' && amount > 0) {
      debts += amount;
    }
  }
  
  return { income, expenses, debts };
}
