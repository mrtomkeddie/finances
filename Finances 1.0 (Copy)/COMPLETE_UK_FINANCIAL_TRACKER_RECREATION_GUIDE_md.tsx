# 🏦 UK Financial Tracker - Complete Recreation Guide

**Zero-interpretation recreation guide for the UK Financial Tracker application.**

This document contains everything needed to recreate the complete UK Financial Tracker application in any environment (Cursor, Replit, etc.) without requiring any additional files or explanations.

## 📋 Overview

A dark-themed financial dashboard for tracking UK income, expenses, and debt across multiple banks (HSBC, Barclays, Santander) with:
- Income/expense/debt tracking with frequency support
- Bank transfer tracking with linked transactions  
- Advanced debt analysis with interest tracking
- Financial charts and visualizations
- Google Sheets integration capability
- localStorage data persistence
- Complete responsive design
- Custom animations and styling effects
- Transaction management with modals
- Bank management functionality
- Custom styled confirmation dialogs

## 🚀 Quick Start Instructions

### Step 1: Create Project Structure
```bash
mkdir uk-financial-tracker
cd uk-financial-tracker
npm create react-app . --template typescript
```

### Step 2: Install Dependencies
```bash
npm install lucide-react@0.487.0 clsx tailwind-merge class-variance-authority@0.7.1 @radix-ui/react-slot@1.1.2 @radix-ui/react-dialog@1.1.6 @radix-ui/react-label@2.1.2 @radix-ui/react-select@2.1.6
```

### Step 3: Create File Structure
Create the following directories:
```
src/
├── components/
│   ├── ui/
│   └── figma/
├── types/
├── utils/
└── styles/
```

### Step 4: Copy Files (in order)
Copy each file below exactly as shown, in the order provided.

---

## 📁 COMPLETE FILE CONTENTS

### 1. Types Definition
**File: `src/types/financial.ts`**
```typescript
export type FrequencyType = 'weekly' | 'bi-weekly' | '4-weekly' | 'monthly' | 'yearly';

export type TransactionType = 'income' | 'expense' | 'debt' | 'transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  frequency: FrequencyType;
  bankId: string;
  date: string;
  description: string;
  remainingBalance?: number;
  monthlyInterestCharge?: number;
  transferLinkedId?: string;
}

export interface Bank {
  id: string;
  name: string;
  color: string;
  type: 'bank' | 'card';
}

export interface Summary {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalExpenses: number;
  weeklyExpenses: number;
  monthlyDebt: number;
  totalDebt: number;
  netIncome: number;
}

// Constants for form dropdowns and validation
export const FREQUENCIES: { value: FrequencyType; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-weekly' },
  { value: '4-weekly', label: '4-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export const BANK_TYPES: { value: 'bank' | 'card'; label: string }[] = [
  { value: 'bank', label: 'Bank Account' },
  { value: 'card', label: 'Credit Card' },
];

export const INCOME_CATEGORIES = [
  'Universal Credit',
  'PIP (Personal Independence Payment)',
  'Carers Allowance',
  'Child Benefit',
  'Housing Benefit',
  'Working Tax Credit',
  'Child Tax Credit',
  'Employment Support Allowance',
  'Jobseekers Allowance',
  'Pension Credit',
  'State Pension',
  'Attendance Allowance',
  'Disability Living Allowance',
  'Income Support',
  'Statutory Sick Pay',
  'Statutory Maternity Pay',
  'Council Tax Support',
  'Cold Weather Payment',
  'Winter Fuel Payment',
  'Warm Home Discount',
  'Salary/Wages',
  'Self Employment',
  'Freelance Income',
  'Investment Returns',
  'Rental Income',
  'Benefits',
  'Pension',
  'Other Income',
];

export const EXPENSE_CATEGORIES = [
  // Housing & Utilities
  'Rent/Mortgage',
  'Council Tax',
  'Electricity',
  'Gas',
  'Water',
  'Internet/Broadband',
  'Home Insurance',
  'Home Maintenance',
  
  // Transport
  'Car Insurance',
  'Car Maintenance/MOT',
  'Petrol/Diesel',
  'Public Transport',
  'Car Finance/Loan',
  'Parking',
  'Road Tax',
  
  // Living Expenses
  'Groceries/Shopping',
  'Clothing',
  'Personal Care',
  'Medical/Healthcare',
  'Prescriptions',
  'Dental Care',
  'Optical Care',
  
  // Communication & Technology
  'Mobile Phone',
  'TV License',
  'Streaming Services',
  'Software Subscriptions',
  'Cloud Storage',
  
  // Entertainment & Lifestyle
  'Dining Out',
  'Cinema/Entertainment',
  'Hobbies',
  'Gym/Fitness',
  'Books/Magazines',
  'Gaming',
  
  // Financial
  'Bank Charges',
  'Life Insurance',
  'Other Insurance',
  'Professional Services',
  
  // Family & Care
  'Childcare',
  'School Expenses',
  'Pet Care',
  'Care Home Fees',
  
  // Other
  'Gifts/Donations',
  'Travel/Holidays',
  'Other Expenses',
];

export const DEBT_CATEGORIES = [
  // Credit & Store Cards
  'Credit Card',
  'Store Card',
  'Catalogue Account',
  
  // Loans
  'Personal Loan',
  'Bank Loan',
  'Payday Loan',
  'Secured Loan',
  'Car Finance',
  'Hire Purchase',
  
  // Overdrafts
  'Bank Overdraft',
  'Arranged Overdraft',
  'Unarranged Overdraft',
  
  // Mortgage & Secured
  'Mortgage',
  'Second Mortgage',
  'Secured Loan',
  
  // Utilities & Bills
  'Council Tax Arrears',
  'Utility Arrears',
  'Rent Arrears',
  'Tax Debt',
  
  // Collections & Enforcement
  'Debt Collection Agency',
  'Court Judgment (CCJ)',
  'Bailiff Debt',
  'HMRC Debt',
  
  // Buy Now Pay Later
  'Klarna',
  'Clearpay',
  'PayPal Credit',
  'Buy Now Pay Later',
  
  // Other Financial
  'Student Loan',
  'Benefits Overpayment',
  'Family/Friend Loan',
  'Other Debt',
];
```

### 2. Utility Functions
**File: `src/utils/financial.ts`**
```typescript
import { Transaction } from '../types/financial';

export function calculateMonthlyAmount(amount: number, frequency: string): number {
  switch (frequency) {
    case 'weekly':
      return amount * 4.33;
    case 'bi-weekly':
      return amount * 2.167;
    case '4-weekly':
      return amount * (12 / 11);
    case 'monthly':
      return amount;
    case 'yearly':
      return amount / 12;
    default:
      return amount;
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

export function calculateSummary(transactions: Transaction[]) {
  const monthlyIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + calculateMonthlyAmount(t.amount, t.frequency), 0);

  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + calculateMonthlyAmount(t.amount, t.frequency), 0);

  const monthlyDebt = transactions
    .filter(t => t.type === 'debt')
    .reduce((sum, t) => sum + calculateMonthlyAmount(t.amount, t.frequency), 0);

  const totalDebt = transactions
    .filter(t => t.type === 'debt')
    .reduce((sum, t) => sum + (t.remainingBalance || 0), 0);

  return {
    monthlyIncome,
    monthlyExpenses: monthlyExpenses + monthlyDebt,
    monthlyDebt,
    totalDebt,
    weeklyIncome: monthlyIncome / 4.33,
    weeklyExpenses: (monthlyExpenses + monthlyDebt) / 4.33,
  };
}

export function analyzeDebt(debt: Transaction) {
  const monthlyPayment = calculateMonthlyAmount(debt.amount, debt.frequency);
  const interestCharge = debt.monthlyInterestCharge || 0;
  const netPayment = monthlyPayment - interestCharge;
  
  return {
    monthlyPayment,
    interestCharge,
    netPayment,
    isPayingOffDebt: netPayment > 0,
  };
}
```

**File: `src/utils/dateUtils.ts`**
```typescript
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function getNextPaymentDate(dateString: string, frequency: string): string {
  const date = new Date(dateString);
  const now = new Date();
  
  // If the date is in the future, return it as is
  if (date > now) {
    return dateString;
  }
  
  // Otherwise, calculate the next occurrence
  switch (frequency) {
    case 'weekly':
      while (date <= now) {
        date.setDate(date.getDate() + 7);
      }
      break;
    case 'bi-weekly':
      while (date <= now) {
        date.setDate(date.getDate() + 14);
      }
      break;
    case '4-weekly':
      while (date <= now) {
        date.setDate(date.getDate() + 28);
      }
      break;
    case 'monthly':
      while (date <= now) {
        date.setMonth(date.getMonth() + 1);
      }
      break;
    case 'yearly':
      while (date <= now) {
        date.setFullYear(date.getFullYear() + 1);
      }
      break;
    default:
      return dateString;
  }
  
  return date.toISOString().split('T')[0];
}

export function isOverdue(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Reset time to start of day
  return date < now;
}

export function getDaysUntil(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  const diffTime = date.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
```

**File: `src/utils/sampleData.ts`**
```typescript
import { Transaction, Bank } from '../types/financial';

export const sampleTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    title: 'Carers (Lydia £30)',
    amount: 81.90,
    frequency: 'weekly',
    bankId: 'barclays',
    date: '2025-01-16',
    description: 'Carers allowance'
  },
  {
    id: '2',
    type: 'income',
    title: 'Carers (Tom £68)',
    amount: 81.90,
    frequency: 'weekly',
    bankId: 'hsbc',
    date: '2025-01-16',
    description: 'Carers allowance'
  },
  {
    id: '3',
    type: 'income',
    title: 'Child Benefit',
    amount: 76.45,
    frequency: 'weekly',
    bankId: 'barclays',
    date: '2025-01-18',
    description: 'Child benefit payment'
  },
  {
    id: '4',
    type: 'income',
    title: 'Maximo Rent',
    amount: 150.00,
    frequency: 'weekly',
    bankId: 'hsbc',
    date: '2025-01-13',
    description: 'Rental income'
  },
  {
    id: '5',
    type: 'income',
    title: 'PIP (Lydia - £30)',
    amount: 380.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: '2025-07-02',
    description: 'Personal Independence Payment'
  },
  {
    id: '6',
    type: 'income',
    title: 'Transfer from Barclays (Carers Lydia)',
    amount: 81.90,
    frequency: 'weekly',
    bankId: 'hsbc',
    date: '2025-01-16',
    description: 'Bank transfer'
  },
  {
    id: '7',
    type: 'income',
    title: 'Transfer from Barclays (Child Benefit)',
    amount: 76.45,
    frequency: 'weekly',
    bankId: 'hsbc',
    date: '2025-01-18',
    description: 'Bank transfer'
  },
  {
    id: '8',
    type: 'income',
    title: 'Transfer from HSBC',
    amount: 60.00,
    frequency: 'weekly',
    bankId: 'santander',
    date: '2025-01-19',
    description: 'Bank transfer'
  },
  {
    id: '9',
    type: 'income',
    title: 'Universal Credit',
    amount: 1077.35,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: '2025-01-16',
    description: 'Universal Credit payment'
  },
  // Expenses
  {
    id: '10',
    type: 'expense',
    title: 'Amazon Prime',
    amount: 95.00,
    frequency: 'yearly',
    bankId: 'hsbc',
    date: '2025-10-23',
    description: 'Amazon Prime subscription'
  },
  {
    id: '11',
    type: 'expense',
    title: 'Apple One (Lydia)',
    amount: 36.95,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: '2025-01-18',
    description: 'Apple One subscription'
  },
  {
    id: '12',
    type: 'expense',
    title: 'Apple Storage (Lydia)',
    amount: 8.99,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: '2025-01-27',
    description: 'Apple iCloud storage'
  },
  {
    id: '13',
    type: 'expense',
    title: 'Apple Storage (Me)',
    amount: 26.99,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: '2025-01-14',
    description: 'Apple iCloud storage'
  },
  {
    id: '14',
    type: 'expense',
    title: 'Aviva (includes RAC)',
    amount: 48.57,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: '2025-01-13',
    description: 'Insurance payment'
  },
  {
    id: '15',
    type: 'expense',
    title: 'Bear Sweets',
    amount: 21.00,
    frequency: '4-weekly',
    bankId: 'hsbc',
    date: '2025-01-01',
    description: 'Sweet treats'
  },
  {
    id: '16',
    type: 'expense',
    title: 'Canva',
    amount: 10.99,
    frequency: 'monthly',
    bankId: 'santander',
    date: '2025-01-06',
    description: 'Canva subscription'
  },
  {
    id: '17',
    type: 'expense',
    title: 'CapCut',
    amount: 7.99,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: '2025-01-21',
    description: 'CapCut subscription'
  },
  {
    id: '18',
    type: 'expense',
    title: 'Card',
    amount: 15.00,
    frequency: 'yearly',
    bankId: 'santander',
    date: '2025-03-30',
    description: 'Card fee'
  },
  {
    id: '19',
    type: 'expense',
    title: 'Chat GPT (Lydia)',
    amount: 19.99,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: '2025-01-18',
    description: 'ChatGPT subscription'
  },
  // Debts
  {
    id: '20',
    type: 'debt',
    title: 'Avantis (Argos)',
    amount: 5.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: '2025-01-11',
    description: 'Argos credit card',
    remainingBalance: 3929.14
  },
  {
    id: '21',
    type: 'debt',
    title: 'B/Card Forward',
    amount: 40.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: '2025-01-15',
    description: 'Barclaycard',
    remainingBalance: 678.76
  },
  {
    id: '22',
    type: 'debt',
    title: 'Creation (PC World)',
    amount: 113.20,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: '2025-01-29',
    description: 'PC World credit',
    remainingBalance: 1460.44
  },
  {
    id: '23',
    type: 'debt',
    title: 'Freemans',
    amount: 250.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: '2025-01-26',
    description: 'Freemans catalogue',
    remainingBalance: 330.00
  },
  {
    id: '24',
    type: 'debt',
    title: 'HSBC Credit Card',
    amount: 31.63,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: '2025-01-21',
    description: 'HSBC credit card',
    remainingBalance: 733.48
  },
  {
    id: '25',
    type: 'debt',
    title: 'HSBC Loan',
    amount: 0.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: '2025-01-01',
    description: 'HSBC personal loan',
    remainingBalance: 0.00
  },
  {
    id: '26',
    type: 'debt',
    title: 'HSBC Overdraft',
    amount: 0.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: '2025-01-01',
    description: 'HSBC overdraft',
    remainingBalance: 1000.00
  },
  {
    id: '27',
    type: 'debt',
    title: 'Lowelf (Studio)',
    amount: 2.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: '2025-01-19',
    description: 'Studio catalogue',
    remainingBalance: 1355.39
  },
  {
    id: '28',
    type: 'debt',
    title: 'Motostrade (Next)',
    amount: 5.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: '2025-01-17',
    description: 'Next catalogue',
    remainingBalance: 5431.12
  },
  {
    id: '29',
    type: 'debt',
    title: 'Newday (AO)',
    amount: 149.60,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: '2025-01-23',
    description: 'AO credit account',
    remainingBalance: 2932.97
  }
];

export const sampleBanks: Bank[] = [
  { id: 'all-income', name: 'All Income', color: '#10b981', type: 'bank' },
  { id: 'all-expenses', name: 'All Expenses', color: '#ef4444', type: 'bank' },
  { id: 'all-debt', name: 'All Debt', color: '#f59e0b', type: 'bank' },
  { id: 'hsbc', name: 'HSBC', color: '#dc2626', type: 'bank' },
  { id: 'barclays', name: 'Barclays', color: '#2563eb', type: 'bank' },
  { id: 'santander', name: 'Santander', color: '#6b7280', type: 'bank' },
];
```

**File: `src/utils/googleSheetsService.ts`**
```typescript
import { Transaction, Bank } from '../types/financial';

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  apiKey: string;
  range: string;
}

export interface GoogleSheetsResponse {
  range: string;
  majorDimension: string;
  values: string[][];
}

export class GoogleSheetsService {
  private config: GoogleSheetsConfig;

  constructor(config: GoogleSheetsConfig) {
    this.config = config;
  }

  async readSheet(): Promise<GoogleSheetsResponse | null> {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${this.config.range}?key=${this.config.apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error reading Google Sheet:', error);
      return null;
    }
  }

  async writeSheet(values: string[][]): Promise<boolean> {
    try {
      // Note: Writing to sheets requires OAuth2 authentication
      // This is a placeholder for the write functionality
      console.warn('Writing to Google Sheets requires OAuth2 authentication');
      return false;
    } catch (error) {
      console.error('Error writing to Google Sheet:', error);
      return false;
    }
  }

  parseTransactionsFromSheet(data: GoogleSheetsResponse, banks: Bank[]): Transaction[] {
    if (!data.values || data.values.length < 2) {
      return [];
    }

    const [headers, ...rows] = data.values;
    const transactions: Transaction[] = [];

    rows.forEach((row, index) => {
      try {
        // Assuming column order: Type, Title, Amount, Frequency, Bank, Date, Description, RemainingBalance, InterestCharge
        const [type, title, amount, frequency, bankName, date, description, remainingBalance, interestCharge] = row;

        if (!type || !title || !amount || !frequency || !bankName) {
          console.warn(`Skipping row ${index + 2}: Missing required fields`);
          return;
        }

        const bank = banks.find(b => b.name.toLowerCase() === bankName.toLowerCase());
        if (!bank) {
          console.warn(`Skipping row ${index + 2}: Bank "${bankName}" not found`);
          return;
        }

        const transaction: Transaction = {
          id: `sheet-${Date.now()}-${index}`,
          type: type.toLowerCase() as TransactionType,
          title: title.trim(),
          amount: parseFloat(amount),
          frequency: frequency.toLowerCase() as any,
          bankId: bank.id,
          date: date || new Date().toISOString().split('T')[0],
          description: description || '',
          remainingBalance: remainingBalance ? parseFloat(remainingBalance) : undefined,
          monthlyInterestCharge: interestCharge ? parseFloat(interestCharge) : undefined,
        };

        transactions.push(transaction);
      } catch (error) {
        console.error(`Error parsing row ${index + 2}:`, error);
      }
    });

    return transactions;
  }

  formatTransactionsForSheet(transactions: Transaction[], banks: Bank[]): string[][] {
    const headers = [
      'Type', 'Title', 'Amount', 'Frequency', 'Bank', 'Date', 
      'Description', 'Remaining Balance', 'Interest Charge'
    ];

    const rows = transactions.map(transaction => {
      const bank = banks.find(b => b.id === transaction.bankId);
      return [
        transaction.type,
        transaction.title,
        transaction.amount.toString(),
        transaction.frequency,
        bank?.name || '',
        transaction.date,
        transaction.description || '',
        transaction.remainingBalance?.toString() || '',
        transaction.monthlyInterestCharge?.toString() || '',
      ];
    });

    return [headers, ...rows];
  }
}

// Helper function to validate Google Sheets configuration
export function validateGoogleSheetsConfig(config: Partial<GoogleSheetsConfig>): string[] {
  const errors: string[] = [];

  if (!config.spreadsheetId) {
    errors.push('Spreadsheet ID is required');
  } else if (!/^[a-zA-Z0-9-_]+$/.test(config.spreadsheetId)) {
    errors.push('Invalid Spreadsheet ID format');
  }

  if (!config.apiKey) {
    errors.push('API Key is required');
  } else if (config.apiKey.length < 30) {
    errors.push('API Key appears to be too short');
  }

  if (!config.range) {
    errors.push('Range is required');
  } else if (!/^[A-Z]+\d+:[A-Z]+\d+$/.test(config.range)) {
    errors.push('Invalid range format (expected format: A1:Z100)');
  }

  return errors;
}
```

### 3. UI Component Library
**File: `src/components/ui/utils.ts`**
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**File: `src/components/ui/card.tsx`**
```typescript
import * as React from "react";

import { cn } from "./utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <h4
      data-slot="card-title"
      className={cn("leading-none", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 [&:last-child]:pb-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
```

**File: `src/components/ui/button.tsx`**
```typescript
import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
```

**File: `src/components/ui/table.tsx`**
```typescript
"use client";

import * as React from "react";

import { cn } from "./utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
```

**File: `src/components/ui/badge.tsx`**
```typescript
import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
```

**File: `src/components/ui/dialog.tsx`**
```typescript
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog@1.1.6";
import { XIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
        <XIcon />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg leading-none font-semibold", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
```

**File: `src/components/ui/input.tsx`**
```typescript
import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
```

**File: `src/components/ui/label.tsx`**
```typescript
"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label@2.1.2";

import { cn } from "./utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
```

**File: `src/components/ui/select.tsx`**
```typescript
"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select@2.1.6";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react@0.487.0";

import { cn } from "./utils";

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default";
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
```

**File: `src/components/ui/textarea.tsx`**
```typescript
import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-input-background px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
```

### 4. Application Components
**File: `src/components/SummaryCards.tsx`**
```typescript
import { Card } from "./ui/card";
import { TrendingUp, TrendingDown, CreditCard } from "lucide-react";
import { formatCurrency } from "../utils/financial";

interface SummaryCardsProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalDebt: number;
  monthlyDebtPayments: number;
}

export function SummaryCards({ 
  monthlyIncome, 
  monthlyExpenses, 
  totalDebt, 
  monthlyDebtPayments 
}: SummaryCardsProps) {
  const weeklyIncome = monthlyIncome / 4.33;
  const weeklyExpenses = monthlyExpenses / 4.33;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      {/* Income Card */}
      <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-green-500/10 border border-green-500/20">
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
          <div className="flex-1">
            <p className="text-muted-foreground mb-1">Monthly Income</p>
            <p className="text-2xl font-bold text-green-500">{formatCurrency(monthlyIncome)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Weekly: {formatCurrency(weeklyIncome)}
            </p>
          </div>
        </div>
      </Card>

      {/* Expenses Card */}
      <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
            <TrendingDown className="h-6 w-6 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-muted-foreground mb-1">Monthly Expenses</p>
            <p className="text-2xl font-bold text-red-500">{formatCurrency(monthlyExpenses)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Weekly: {formatCurrency(weeklyExpenses)}
            </p>
          </div>
        </div>
      </Card>

      {/* Debt Card */}
      <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-orange-500/10 border border-orange-500/20">
            <CreditCard className="h-6 w-6 text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-muted-foreground mb-1">Total Debt</p>
            <p className="text-2xl font-bold text-orange-500">{formatCurrency(totalDebt)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Monthly payments: {formatCurrency(monthlyDebtPayments)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

**File: `src/components/ConfirmationDialog.tsx`**
```typescript
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className={`p-3 rounded-full w-fit mx-auto ${
              variant === 'destructive' 
                ? 'bg-red-500/10 border border-red-500/20' 
                : 'bg-orange-500/10 border border-orange-500/20'
            }`}>
              <AlertTriangle className={`h-6 w-6 ${
                variant === 'destructive' ? 'text-red-500' : 'text-orange-500'
              }`} />
            </div>
          </div>
          
          <DialogTitle className="text-lg font-semibold text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            className={`flex-1 ${
              variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                : 'bg-orange-600 hover:bg-orange-700 text-white border-orange-600'
            }`}
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**File: `src/components/BankManagementModal.tsx`**
```typescript
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Pencil, Trash2 } from 'lucide-react';
import { Bank, BankType } from '../types/financial';

interface BankManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  banks: Bank[];
  onAddBank: (bank: Omit<Bank, 'id'>) => void;
  onUpdateBank: (bankId: string, updates: Partial<Bank>) => void;
  onDeleteBank: (bankId: string) => void;
}

const colorOptions = [
  '#10b981', // emerald
  '#dc2626', // red
  '#2563eb', // blue
  '#f3f4f6', // gray-100
  '#059669', // emerald-600
  '#f59e0b', // amber
  '#7c3aed', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#84cc16', // lime
  '#f97316', // orange
];

export function BankManagementModal({
  isOpen,
  onClose,
  banks,
  onAddBank,
  onUpdateBank,
  onDeleteBank,
}: BankManagementModalProps) {
  const [newBankName, setNewBankName] = useState('');
  const [newBankType, setNewBankType] = useState<BankType>('bank');
  const [newBankColor, setNewBankColor] = useState(colorOptions[0]);
  const [editingBank, setEditingBank] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<BankType>('bank');
  const [editColor, setEditColor] = useState(colorOptions[0]);

  // Filter out the "All" category banks from the display
  const userBanks = banks.filter(bank => !bank.id.startsWith('all-'));

  const handleAddBank = () => {
    if (newBankName.trim()) {
      onAddBank({
        name: newBankName.trim(),
        type: newBankType,
        color: newBankColor,
      });
      setNewBankName('');
      setNewBankType('bank');
      setNewBankColor(colorOptions[0]);
    }
  };

  const handleStartEdit = (bank: Bank) => {
    setEditingBank(bank.id);
    setEditName(bank.name);
    setEditType(bank.type);
    setEditColor(bank.color);
  };

  const handleSaveEdit = () => {
    if (editingBank && editName.trim()) {
      onUpdateBank(editingBank, {
        name: editName.trim(),
        type: editType,
        color: editColor,
      });
      setEditingBank(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingBank(null);
    setEditName('');
    setEditType('bank');
    setEditColor(colorOptions[0]);
  };

  const getAccountTypeLabel = (type: BankType) => {
    switch (type) {
      case 'bank': return 'Bank Account';
      case 'card': return 'Credit Card';
      default: return 'Bank Account';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            Manage Banks & Credit Cards
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Add, edit or remove your bank accounts and credit cards
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Add New Account Section */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Add New Account</h3>
            <div className="space-y-4">
              {/* Account Name */}
              <div className="space-y-2">
                <Label htmlFor="account-name" className="text-sm font-medium text-foreground">
                  Account Name
                </Label>
                <Input
                  id="account-name"
                  placeholder="HSBC Current Account"
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              </div>

              {/* Account Type */}
              <div className="space-y-2">
                <Label htmlFor="account-type" className="text-sm font-medium text-foreground">
                  Account Type
                </Label>
                <Select value={newBankType} onValueChange={(value: BankType) => setNewBankType(value)}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="bank">Bank Account</SelectItem>
                    <SelectItem value="card">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Color</Label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewBankColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        newBankColor === color 
                          ? 'border-foreground scale-110' 
                          : 'border-border hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Add Account Button */}
              <Button 
                onClick={handleAddBank}
                disabled={!newBankName.trim()}
                className="w-full"
              >
                Add Account
              </Button>
            </div>
          </div>

          {/* Your Accounts Section */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Your Accounts</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {userBanks.map((bank) => (
                <div
                  key={bank.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                >
                  {editingBank === bank.id ? (
                    <div className="flex-1 space-y-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-input border-border text-foreground text-sm"
                      />
                      <div className="flex items-center gap-2">
                        <Select value={editType} onValueChange={(value: BankType) => setEditType(value)}>
                          <SelectTrigger className="bg-input border-border text-foreground text-sm h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="bank">Bank Account</SelectItem>
                            <SelectItem value="card">Credit Card</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex gap-1">
                          {colorOptions.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setEditColor(color)}
                              className={`w-4 h-4 rounded-full border ${
                                editColor === color 
                                  ? 'border-foreground' 
                                  : 'border-border'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: bank.color }}
                        />
                        <div>
                          <div className="font-medium text-foreground">{bank.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {getAccountTypeLabel(bank.type)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEdit(bank)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteBank(bank.id)}
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {userBanks.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No accounts added yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-center pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**File: `src/components/TransactionModal.tsx`**
```typescript
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Transaction, Bank, TransactionType, FrequencyType } from '../types/financial';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  banks: Bank[];
  editTransaction?: Transaction;
}

const categories = [
  // Income categories
  'Salary', 'Benefits', 'Rental Income', 'Investment Income', 'Freelance', 'Other Income',
  // Expense categories
  'Housing', 'Transportation', 'Food & Dining', 'Shopping', 'Entertainment', 'Bills & Utilities',
  'Healthcare', 'Education', 'Travel', 'Personal Care', 'Insurance', 'Subscriptions', 'Other Expenses',
  // Debt categories
  'Credit Card', 'Personal Loan', 'Mortgage', 'Student Loan', 'Other Debt'
];

export function TransactionModal({
  isOpen,
  onClose,
  onAddTransaction,
  banks,
  editTransaction,
}: TransactionModalProps) {
  const [formData, setFormData] = useState({
    type: 'income' as TransactionType,
    bankId: '',
    title: '',
    amount: '',
    frequency: 'monthly' as FrequencyType,
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    remainingBalance: '',
    monthlyInterestCharge: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when editTransaction changes
  useEffect(() => {
    if (editTransaction) {
      setFormData({
        type: editTransaction.type,
        bankId: editTransaction.bankId,
        title: editTransaction.title,
        amount: editTransaction.amount.toString(),
        frequency: editTransaction.frequency,
        category: editTransaction.description || '',
        date: editTransaction.date,
        description: editTransaction.description || '',
        remainingBalance: editTransaction.remainingBalance?.toString() || '',
        monthlyInterestCharge: editTransaction.monthlyInterestCharge?.toString() || '',
      });
    } else {
      // Reset form for new transaction
      setFormData({
        type: 'income',
        bankId: '',
        title: '',
        amount: '',
        frequency: 'monthly',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        remainingBalance: '',
        monthlyInterestCharge: '',
      });
    }
    // Clear errors when editTransaction changes
    setErrors({});
  }, [editTransaction]);

  // Filter banks to exclude category banks
  const availableBanks = banks.filter(bank => !bank.id.startsWith('all-'));

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.type) newErrors.type = 'Transaction type is required';
    if (!formData.bankId) newErrors.bankId = 'Bank account is required';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.frequency) newErrors.frequency = 'Frequency is required';
    if (!formData.date) newErrors.date = 'Date is required';

    // Validate debt-specific fields
    if (formData.type === 'debt') {
      if (!formData.remainingBalance || parseFloat(formData.remainingBalance) < 0) {
        newErrors.remainingBalance = 'Remaining balance is required for debt';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const transaction: Omit<Transaction, 'id'> = {
      type: formData.type,
      bankId: formData.bankId,
      title: formData.title.trim(),
      amount: parseFloat(formData.amount),
      frequency: formData.frequency,
      date: formData.date,
      description: formData.description.trim() || formData.category,
      ...(formData.type === 'debt' && {
        remainingBalance: parseFloat(formData.remainingBalance) || 0,
        monthlyInterestCharge: parseFloat(formData.monthlyInterestCharge) || 0,
      }),
    };

    onAddTransaction(transaction);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      type: 'income',
      bankId: '',
      title: '',
      amount: '',
      frequency: 'monthly',
      category: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      remainingBalance: '',
      monthlyInterestCharge: '',
    });
    setErrors({});
    onClose();
  };

  const getFilteredCategories = () => {
    if (formData.type === 'income') {
      return categories.filter(cat => 
        ['Salary', 'Benefits', 'Rental Income', 'Investment Income', 'Freelance', 'Other Income'].includes(cat)
      );
    } else if (formData.type === 'expense') {
      return categories.filter(cat => 
        !['Salary', 'Benefits', 'Rental Income', 'Investment Income', 'Freelance', 'Other Income', 'Credit Card', 'Personal Loan', 'Mortgage', 'Student Loan', 'Other Debt'].includes(cat)
      );
    } else {
      return ['Credit Card', 'Personal Loan', 'Mortgage', 'Student Loan', 'Other Debt'];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            {editTransaction ? 'Edit Transaction' : 'Add New Transaction'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Fill out the transaction details below
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Type and Bank Account Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: TransactionType) => handleInputChange('type', value)}
              >
                <SelectTrigger className={`bg-input border-border text-foreground ${errors.type ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="debt">Debt</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-red-400">{errors.type}</p>}
            </div>

            {/* Bank Account */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Bank Account</Label>
              <Select 
                value={formData.bankId} 
                onValueChange={(value) => handleInputChange('bankId', value)}
              >
                <SelectTrigger className={`bg-input border-border text-foreground ${errors.bankId ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {availableBanks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: bank.color }}
                        />
                        {bank.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bankId && <p className="text-xs text-red-400">{errors.bankId}</p>}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Title</Label>
            <Input
              placeholder="Enter transaction title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`bg-input border-border text-foreground ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && <p className="text-xs text-red-400">{errors.title}</p>}
          </div>

          {/* Amount and Frequency Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Amount (£)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="100"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={`bg-input border-border text-foreground ${errors.amount ? 'border-red-500' : ''}`}
              />
              {errors.amount && <p className="text-xs text-red-400">{errors.amount}</p>}
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Frequency</Label>
              <Select 
                value={formData.frequency} 
                onValueChange={(value: FrequencyType) => handleInputChange('frequency', value)}
              >
                <SelectTrigger className={`bg-input border-border text-foreground ${errors.frequency ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Monthly" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="4-weekly">4-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              {errors.frequency && <p className="text-xs text-red-400">{errors.frequency}</p>}
            </div>
          </div>

          {/* Category and Date Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {getFilteredCategories().map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`bg-input border-border text-foreground ${errors.date ? 'border-red-500' : ''}`}
              />
              {errors.date && <p className="text-xs text-red-400">{errors.date}</p>}
            </div>
          </div>

          {/* Debt-specific fields */}
          {formData.type === 'debt' && (
            <div className="grid grid-cols-2 gap-4">
              {/* Remaining Balance */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Remaining Balance (£)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.remainingBalance}
                  onChange={(e) => handleInputChange('remainingBalance', e.target.value)}
                  className={`bg-input border-border text-foreground ${errors.remainingBalance ? 'border-red-500' : ''}`}
                />
                {errors.remainingBalance && <p className="text-xs text-red-400">{errors.remainingBalance}</p>}
              </div>

              {/* Monthly Interest Charge */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Monthly Interest (£)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.monthlyInterestCharge}
                  onChange={(e) => handleInputChange('monthlyInterestCharge', e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Description (Optional)</Label>
            <Textarea
              placeholder="Enter additional details..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="bg-input border-border text-foreground resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editTransaction ? 'Update Transaction' : 'Add Transaction'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**File: `src/components/TransactionDetailModal.tsx`**
```typescript
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Calendar,
  CreditCard,
  Edit,
  Trash2,
  FileText,
} from "lucide-react";
import { Transaction, Bank } from "../types/financial";
import {
  formatCurrency,
  calculateMonthlyAmount,
} from "../utils/financial";
import {
  formatDate,
  getDaysUntil,
  isOverdue,
} from "../utils/dateUtils";
import { ConfirmationDialog } from "./ConfirmationDialog";

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  banks: Bank[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
}

export function TransactionDetailModal({
  isOpen,
  onClose,
  transaction,
  banks,
  onEdit,
  onDelete,
}: TransactionDetailModalProps) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] =
    useState(false);

  if (!transaction) return null;

  const bank = banks.find((b) => b.id === transaction.bankId);
  const bankName = bank?.name || "Unknown";
  const bankColor = bank?.color || "#6366f1";

  const getTypeColor = (type: string) => {
    switch (type) {
      case "income":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "expense":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "debt":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "transfer":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDueDate = (dateString: string) => {
    const daysUntil = getDaysUntil(dateString);
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString("en-GB", {
      weekday: "long",
    });
    const dayNum = date.getDate();
    const monthName = date.toLocaleDateString("en-GB", {
      month: "long",
    });
    const year = date.getFullYear();

    return `${dayName} ${dayNum} ${monthName} ${year}`;
  };

  const handleEdit = () => {
    onEdit(transaction);
    onClose();
  };

  const handleDeleteClick = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(transaction.id);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="max-w-lg bg-card border-border p-0"
          aria-describedby={undefined}
        >
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-xl font-semibold text-foreground">
              Transaction Details
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-6">
            {/* Transaction Title and Amount */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground mb-3 break-words">
                  {transaction.title}
                </h3>
                <Badge
                  variant="outline"
                  className={`${getTypeColor(transaction.type)} border w-fit`}
                >
                  {getTypeLabel(transaction.type)}
                </Badge>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-bold text-foreground mb-1">
                  {formatCurrency(transaction.amount)}
                </div>
                <div className="text-sm text-muted-foreground capitalize">
                  {transaction.frequency}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={handleEdit}
                className="flex items-center gap-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 h-10"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteClick}
                className="flex items-center gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 h-10"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>

            {/* Transaction Details */}
            <div className="space-y-6">
              {/* Next Due Date */}
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-2">
                    Next Due Date
                  </div>
                  <div className="font-semibold text-foreground">
                    {formatDueDate(transaction.date)}
                  </div>
                </div>
              </div>

              {/* Bank */}
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-2">
                    Bank
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: bankColor }}
                    />
                    <span className="font-semibold text-foreground">
                      {bankName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Details for Debt */}
              {transaction.type === "debt" && (
                <div className="space-y-4 pt-4 border-t border-border">
                  {transaction.remainingBalance && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">
                        Remaining Balance
                      </span>
                      <span className="font-semibold text-orange-400">
                        {formatCurrency(
                          transaction.remainingBalance,
                        )}
                      </span>
                    </div>
                  )}
                  {transaction.monthlyInterestCharge && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">
                        Monthly Interest
                      </span>
                      <span className="font-semibold text-red-400">
                        {formatCurrency(
                          transaction.monthlyInterestCharge,
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Monthly Amount */}
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  Monthly Amount
                </span>
                <span className="font-bold text-lg text-foreground">
                  {formatCurrency(
                    calculateMonthlyAmount(
                      transaction.amount,
                      transaction.frequency,
                    ),
                  )}
                </span>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <h4 className="font-semibold text-foreground">
                  Notes
                </h4>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 min-h-[100px] border border-border/30">
                {transaction.description ? (
                  <p className="text-sm text-foreground leading-relaxed font-medium">
                    {transaction.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No notes added yet. Click Edit to add notes
                    for this transaction.
                  </p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        description={`Are you sure you want to delete "${transaction.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
}
```

### 5. Styling Files
**File: `src/styles/globals.css`**
```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
  --font-size: 14px;
  --background: #ffffff;
  --foreground: oklch(0.145 0 0);
  --card: #ffffff;
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: #030213;
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.95 0.0058 264.53);
  --secondary-foreground: #030213;
  --muted: #ececf0;
  --muted-foreground: #717182;
  --accent: #e9ebef;
  --accent-foreground: #030213;
  --destructive: #d4183d;
  --destructive-foreground: #ffffff;
  --border: rgba(0, 0, 0, 0.1);
  --input: transparent;
  --input-background: #f3f3f5;
  --switch-background: #cbced4;
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: #030213;
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
  
  /* Text size variables */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  
  /* Subtle color variants */
  --success-subtle: #10b981;
  --success-muted: #6b7280;
  --warning-subtle: #fbbf24;
  --warning-muted: #9ca3af;
  --danger-subtle: #ef4444;
  --danger-muted: #9ca3af;
  --info-subtle: #3b82f6;
  --info-muted: #9ca3af;
}

.dark {
  --background: #191919;
  --foreground: oklch(0.985 0 0);
  --card: #242424;
  --card-foreground: oklch(0.985 0 0);
  --popover: #242424;
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: #2a2a2a;
  --secondary-foreground: oklch(0.985 0 0);
  --muted: #2a2a2a;
  --muted-foreground: oklch(0.708 0 0);
  --accent: #2a2a2a;
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: #333333;
  --input: #2a2a2a;
  --ring: oklch(0.439 0 0);
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: #2a2a2a;
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: #333333;
  --sidebar-ring: oklch(0.439 0 0);
  
  /* Subtle color variants for dark mode */
  --success-subtle: #10b981;
  --success-muted: #6b7280;
  --warning-subtle: #fbbf24;
  --warning-muted: #9ca3af;
  --danger-subtle: #ef4444;
  --danger-muted: #9ca3af;
  --info-subtle: #3b82f6;
  --info-muted: #9ca3af;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-input-background: var(--input-background);
  --color-switch-background: var(--switch-background);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  
  /* Add custom color utilities */
  --color-success-subtle: var(--success-subtle);
  --color-success-muted: var(--success-muted);
  --color-warning-subtle: var(--warning-subtle);
  --color-warning-muted: var(--warning-muted);
  --color-danger-subtle: var(--danger-subtle);
  --color-danger-muted: var(--danger-muted);
  --color-info-subtle: var(--info-subtle);
  --color-info-muted: var(--info-muted);
  
  /* Override orange with lighter version */
  --color-orange-500: #fbbf24;
  --color-orange-400: #fcd34d;
  --color-orange-600: #f59e0b;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground;
  }
}

/**
 * Base typography. This is not applied to elements which have an ancestor with a Tailwind text class.
 */
@layer base {
  :where(:not(:has([class*=" text-"]), :not(:has([class^="text-"])))) {
    h1 {
      font-size: var(--text-2xl);
      font-weight: var(--font-weight-medium);
      line-height: 1.4;
    }

    h2 {
      font-size: var(--text-xl);
      font-weight: var(--font-weight-medium);
      line-height: 1.4;
    }

    h3 {
      font-size: var(--text-lg);
      font-weight: var(--font-weight-medium);
      line-height: 1.4;
    }

    h4 {
      font-size: var(--text-base);
      font-weight: var(--font-weight-medium);
      line-height: 1.4;
    }

    p {
      font-size: var(--text-base);
      font-weight: var(--font-weight-normal);
      line-height: 1.5;
    }

    label {
      font-size: var(--text-base);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    button {
      font-size: var(--text-base);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      border-width: 2px;
      border-color: transparent;
    }

    button:hover:not(:disabled) {
      transform: translateY(-1px) rotate(-0.5deg);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: rgba(255, 255, 255, 0.1);
    }

    button:active:not(:disabled) {
      transform: translateY(0) rotate(0deg);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
    }

    input {
      font-size: var(--text-base);
      font-weight: var(--font-weight-normal);
      line-height: 1.5;
    }
  }
}

/* Enhanced button hover effects for dark mode */
@layer base {
  .dark button:hover:not(:disabled) {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.2);
    background-color: rgba(255, 255, 255, 0.03);
  }

  .dark button:active:not(:disabled) {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }

  /* Primary button effects */
  .dark button[class*="bg-primary"]:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.9);
    color: rgba(0, 0, 0, 0.9);
    border-color: rgba(255, 255, 255, 0.8);
  }

  /* Green button effects */
  .dark button[class*="bg-green"]:hover:not(:disabled) {
    background-color: rgba(34, 197, 94, 0.9);
    border-color: rgba(34, 197, 94, 0.6);
  }

  /* Destructive button effects */
  .dark button[class*="bg-red"]:hover:not(:disabled),
  .dark button[class*="bg-destructive"]:hover:not(:disabled) {
    background-color: rgba(239, 68, 68, 0.9);
    border-color: rgba(239, 68, 68, 0.6);
  }

  .dark button[class*="text-destructive"]:hover:not(:disabled) {
    background-color: rgba(239, 68, 68, 0.1);
    color: rgb(248, 113, 113);
    border-color: rgba(239, 68, 68, 0.3);
  }

  /* Ghost button effects */
  .dark button[class*="variant-ghost"]:hover:not(:disabled),
  .dark button[class*="bg-transparent"]:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

/* Light mode button effects */
@layer base {
  button:hover:not(:disabled) {
    background-color: rgba(0, 0, 0, 0.03);
  }

  /* Primary button effects */
  button[class*="bg-primary"]:hover:not(:disabled) {
    background-color: rgba(3, 2, 19, 0.9);
    border-color: rgba(3, 2, 19, 0.8);
  }

  /* Green button effects */
  button[class*="bg-green"]:hover:not(:disabled) {
    background-color: rgba(34, 197, 94, 0.9);
    border-color: rgba(34, 197, 94, 0.6);
  }

  /* Destructive button effects */
  button[class*="bg-red"]:hover:not(:disabled),
  button[class*="bg-destructive"]:hover:not(:disabled) {
    background-color: rgba(212, 24, 61, 0.9);
    border-color: rgba(212, 24, 61, 0.6);
  }

  button[class*="text-destructive"]:hover:not(:disabled) {
    background-color: rgba(212, 24, 61, 0.1);
    color: rgb(185, 28, 28);
    border-color: rgba(212, 24, 61, 0.3);
  }

  /* Ghost button effects */
  button[class*="variant-ghost"]:hover:not(:disabled),
  button[class*="bg-transparent"]:hover:not(:disabled) {
    background-color: rgba(0, 0, 0, 0.03);
    border-color: rgba(0, 0, 0, 0.08);
  }

  /* Secondary button effects */
  button[class*="bg-secondary"]:hover:not(:disabled) {
    background-color: rgba(233, 235, 239, 0.8);
    border-color: rgba(113, 113, 130, 0.3);
  }

  .dark button[class*="bg-secondary"]:hover:not(:disabled) {
    background-color: rgba(38, 38, 38, 0.9);
    border-color: rgba(115, 115, 115, 0.4);
  }
}

/* Bank tab button specific styling - More subtle */
@layer base {
  .bank-tab-button {
    /* Override default button hover transform for bank tabs */
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .bank-tab-button:hover:not(:disabled) {
    transform: translateY(-1px) scale(1.01);
    /* Reduced movement and scale for subtlety */
  }

  .bank-tab-button:active:not(:disabled) {
    transform: translateY(0) scale(1);
    transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Prevent stacking issues with tab buttons */
  .bank-tab-button {
    position: relative;
    z-index: 1;
  }

  .bank-tab-button:hover {
    z-index: 10;
  }

  /* Selected tab should stay above hover states */
  .bank-tab-button[class*="bg-slate"] {
    z-index: 20;
  }
}

/* Tab-specific hover and stacking fixes */
@layer base {
  /* Fix tab trigger stacking on hover */
  [role="tablist"] button {
    position: relative;
    z-index: 1;
  }

  [role="tablist"] button:hover {
    z-index: 10;
  }

  /* Active tab should stay above hover states */
  [role="tablist"] button[data-state="active"] {
    z-index: 20;
  }

  /* Reduce transform on tab hovers to prevent overlap */
  [role="tablist"] button:hover:not(:disabled) {
    transform: translateY(-1px) rotate(-0.3deg);
  }
}

/* Category filter button specific styling */
@layer base {
  .category-filter-btn {
    position: relative;
    z-index: 1;
  }

  /* Prevent transform on category filter buttons to avoid overlap */
  .category-filter-btn:hover:not(:disabled) {
    transform: none !important;
    box-shadow: none !important;
    border-color: transparent !important;
  }

  /* Override the global button hover effects for category filters */
  .category-filter-btn:active:not(:disabled) {
    transform: none !important;
    box-shadow: none !important;
    transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Ensure selected state stays above hover states */
  .category-filter-btn[class*="bg-card"] {
    z-index: 10;
  }
}

/* Icon background adjustments for better visibility */
@layer utilities {
  /* Override orange color backgrounds and borders with better transparency */
  .bg-orange-500\/10 {
    background-color: rgba(251, 191, 36, 0.15) !important;
  }
  
  .border-orange-500\/20 {
    border-color: rgba(251, 191, 36, 0.35) !important;
  }
  
  /* Also adjust green and red icon backgrounds for consistency */
  .bg-green-500\/10 {
    background-color: rgba(16, 185, 129, 0.15) !important;
  }
  
  .border-green-500\/20 {
    border-color: rgba(16, 185, 129, 0.35) !important;
  }
  
  .bg-red-500\/10 {
    background-color: rgba(239, 68, 68, 0.15) !important;
  }
  
  .border-red-500\/20 {
    border-color: rgba(239, 68, 68, 0.35) !important;
  }
}

/* Custom subtle color utilities */
@layer utilities {
  .text-success-subtle { color: var(--color-success-subtle); }
  .text-success-muted { color: var(--color-success-muted); }
  .text-warning-subtle { color: var(--color-warning-subtle); }
  .text-warning-muted { color: var(--color-warning-muted); }
  .text-danger-subtle { color: var(--color-danger-subtle); }
  .text-danger-muted { color: var(--color-danger-muted); }
  .text-info-subtle { color: var(--color-info-subtle); }
  .text-info-muted { color: var(--color-info-muted); }
  
  .bg-success-subtle { background-color: var(--color-success-subtle); }
  .bg-success-muted { background-color: var(--color-success-muted); }
  .bg-warning-subtle { background-color: var(--color-warning-subtle); }
  .bg-warning-muted { background-color: var(--color-warning-muted); }
  .bg-danger-subtle { background-color: var(--color-danger-subtle); }
  .bg-danger-muted { background-color: var(--color-danger-muted); }
  .bg-info-subtle { background-color: var(--color-info-subtle); }
  .bg-info-muted { background-color: var(--color-info-muted); }
  
  .border-success-subtle { border-color: var(--color-success-subtle); }
  .border-success-muted { border-color: var(--color-success-muted); }
  .border-warning-subtle { border-color: var(--color-warning-subtle); }
  .border-warning-muted { border-color: var(--color-warning-muted); }
  .border-danger-subtle { border-color: var(--color-danger-subtle); }
  .border-danger-muted { border-color: var(--color-danger-muted); }
  .border-info-subtle { border-color: var(--color-info-subtle); }
  .border-info-muted { border-color: var(--color-info-muted); }
}

html {
  font-size: var(--font-size);
}
```

### 6. Main Application File
**File: `src/App.tsx`**
```typescript
import React, { useState, useEffect } from 'react';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Settings, Plus, TrendingUp, TrendingDown, CreditCard, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { Badge } from './components/ui/badge';
import { BankManagementModal } from './components/BankManagementModal';
import { TransactionModal } from './components/TransactionModal';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { Transaction, Bank, TransactionType } from './types/financial';
import { calculateSummary, formatCurrency, calculateMonthlyAmount } from './utils/financial';
import { sampleTransactions, sampleBanks } from './utils/sampleData';
import { formatDate, getDaysUntil, isOverdue } from './utils/dateUtils';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(sampleTransactions);
  const [banks, setBanks] = useState<Bank[]>(sampleBanks);
  const [activeFilter, setActiveFilter] = useState<TransactionType | 'all'>('income');
  const [activeBankFilter, setActiveBankFilter] = useState('all-income');
  const [isBankManagementOpen, setIsBankManagementOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Apply dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('financial-tracker-transactions');
    const savedBanks = localStorage.getItem('financial-tracker-banks');
    
    if (savedTransactions) {
      try {
        setTransactions(JSON.parse(savedTransactions));
      } catch (error) {
        console.error('Error loading transactions:', error);
      }
    }
    
    if (savedBanks) {
      try {
        const loadedBanks = JSON.parse(savedBanks);
        // Ensure we always have the category banks
        const categoryBanks = sampleBanks.filter(bank => bank.id.startsWith('all-'));
        const userBanks = loadedBanks.filter((bank: Bank) => !bank.id.startsWith('all-'));
        setBanks([...categoryBanks, ...userBanks]);
      } catch (error) {
        console.error('Error loading banks:', error);
        setBanks(sampleBanks);
      }
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('financial-tracker-transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('financial-tracker-banks', JSON.stringify(banks));
  }, [banks]);

  // Bank management functions
  const handleAddBank = (newBank: Omit<Bank, 'id'>) => {
    const bank: Bank = {
      id: `bank-${Date.now()}`,
      ...newBank,
    };
    setBanks(prev => [...prev, bank]);
  };

  const handleUpdateBank = (bankId: string, updates: Partial<Bank>) => {
    setBanks(prev => 
      prev.map(bank => 
        bank.id === bankId ? { ...bank, ...updates } : bank
      )
    );
  };

  const handleDeleteBank = (bankId: string) => {
    // Don't allow deletion of category banks
    if (bankId.startsWith('all-')) return;
    
    // Check if bank has transactions
    const hasTransactions = transactions.some(t => t.bankId === bankId);
    if (hasTransactions) {
      alert('Cannot delete bank with existing transactions. Please move or delete transactions first.');
      return;
    }
    
    setBanks(prev => prev.filter(bank => bank.id !== bankId));
  };

  // Transaction management functions
  const handleAddTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      id: `transaction-${Date.now()}`,
      ...newTransaction,
    };
    setTransactions(prev => [...prev, transaction]);
  };

  const handleUpdateTransaction = (updatedTransaction: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      setTransactions(prev => 
        prev.map(t => 
          t.id === editingTransaction.id 
            ? { ...updatedTransaction, id: editingTransaction.id }
            : t
        )
      );
      setEditingTransaction(null);
    }
  };

  const handleDeleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
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

  // Filter transactions based on type and bank
  const filteredTransactions = transactions.filter(transaction => {
    // First filter by transaction type
    const typeMatches = activeFilter === 'all' || transaction.type === activeFilter;
    
    // Then filter by bank if a specific bank is selected
    if (activeBankFilter.startsWith('all-')) {
      const filterType = activeBankFilter.split('-')[1] as TransactionType;
      return typeMatches && (filterType === 'all' || transaction.type === filterType);
    }
    
    return typeMatches && transaction.bankId === activeBankFilter;
  });

  // Calculate summary statistics
  const allSummary = calculateSummary(transactions);
  const incomeSummary = calculateSummary(transactions.filter(t => t.type === 'income'));
  const expensesSummary = calculateSummary(transactions.filter(t => t.type === 'expense'));

  // Bank-specific summaries
  const hsbcTransactions = transactions.filter(t => t.bankId === 'hsbc');
  const santanderTransactions = transactions.filter(t => t.bankId === 'santander');
  const hsbcSummary = calculateSummary(hsbcTransactions);
  const santanderSummary = calculateSummary(santanderTransactions);

  // Calculate totals for bottom summary
  const weeklyTotal = filteredTransactions
    .filter(t => t.type === activeFilter || activeFilter === 'all')
    .reduce((sum, t) => sum + (t.amount / (t.frequency === 'weekly' ? 1 : t.frequency === 'monthly' ? 4.33 : t.frequency === 'yearly' ? 52 : 2.167)), 0);
  
  const monthlyTotal = filteredTransactions
    .filter(t => t.type === activeFilter || activeFilter === 'all')
    .reduce((sum, t) => sum + calculateMonthlyAmount(t.amount, t.frequency), 0);

  const getBankColor = (bankId: string) => {
    const bank = banks.find(b => b.id === bankId);
    return bank?.color || '#6366f1';
  };

  const getBankName = (bankId: string) => {
    const bank = banks.find(b => b.id === bankId);
    return bank?.name || 'Unknown';
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

  const formatDueDate = (date