# 🏦 UK Financial Tracker - Types & Utilities

**Document 1 of 5: Core type definitions and utility functions**

## 📁 File: `src/types/financial.ts`

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

## 📁 File: `src/utils/financial.ts`

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

## 📁 File: `src/utils/dateUtils.ts`

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

## 📁 File: `src/utils/sampleData.ts`

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

## 📁 File: `src/utils/googleSheetsService.ts`

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

---

**Continue with Document 2: UK_FINANCIAL_TRACKER_UI_COMPONENTS.md**