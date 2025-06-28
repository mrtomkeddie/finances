import { Transaction, Bank } from '../types/financial';

const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const AIRTABLE_API_TOKEN = import.meta.env.VITE_AIRTABLE_API_TOKEN;

if (!AIRTABLE_BASE_ID || !AIRTABLE_API_TOKEN) {
  console.warn('Airtable configuration missing. Please check your environment variables.');
}

const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

async function airtableRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Airtable API error: ${response.status} ${error}`);
  }

  return response.json();
}

// Bank operations
export const airtableService = {
  async getBanks(): Promise<Bank[]> {
    try {
      const response = await airtableRequest('/Banks');
      return response.records.map((record: any) => ({
        id: record.id,
        name: record.fields.Name || '',
        color: record.fields.Color || '#6366f1',
      }));
    } catch (error) {
      console.error('Error fetching banks:', error);
      return [];
    }
  },

  async createBank(bank: Bank): Promise<Bank> {
    const response = await airtableRequest('/Banks', {
      method: 'POST',
      body: JSON.stringify({
        fields: {
          Name: bank.name,
          Color: bank.color,
        },
      }),
    });

    return {
      id: response.id,
      name: response.fields.Name,
      color: response.fields.Color,
    };
  },

  async updateBank(bankId: string, updates: Partial<Bank>): Promise<Bank> {
    const response = await airtableRequest(`/Banks/${bankId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        fields: {
          ...(updates.name && { Name: updates.name }),
          ...(updates.color && { Color: updates.color }),
        },
      }),
    });

    return {
      id: response.id,
      name: response.fields.Name,
      color: response.fields.Color,
    };
  },

  async deleteBank(bankId: string): Promise<void> {
    await airtableRequest(`/Banks/${bankId}`, {
      method: 'DELETE',
    });
  },

  // Transaction operations
  async getTransactions(): Promise<Transaction[]> {
    try {
      const response = await airtableRequest('/Transactions');
      return response.records.map((record: any) => ({
        id: record.id,
        title: record.fields.Title || '',
        amount: record.fields.Amount || 0,
        type: record.fields.Type || 'expense',
        frequency: record.fields.Frequency || 'monthly',
        date: record.fields.Date || new Date().toISOString().split('T')[0],
        bankId: record.fields.BankID?.[0] || '',
        remainingBalance: record.fields.RemainingBalance || 0,
        monthlyInterest: record.fields.MonthlyInterest || 0,
        interestRate: record.fields.InterestRate || 0,
        interestType: record.fields.InterestType || 'percentage',
        rateFrequency: record.fields.RateFrequency || 'annual',
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  },

  async createTransaction(transaction: Transaction): Promise<Transaction> {
    const response = await airtableRequest('/Transactions', {
      method: 'POST',
      body: JSON.stringify({
        fields: {
          Title: transaction.title,
          Amount: transaction.amount,
          Type: transaction.type,
          Frequency: transaction.frequency,
          Date: transaction.date,
          BankID: [transaction.bankId],
          ...(transaction.remainingBalance && { RemainingBalance: transaction.remainingBalance }),
          ...(transaction.monthlyInterest && { MonthlyInterest: transaction.monthlyInterest }),
          ...(transaction.interestRate && { InterestRate: transaction.interestRate }),
          ...(transaction.interestType && { InterestType: transaction.interestType }),
          ...(transaction.rateFrequency && { RateFrequency: transaction.rateFrequency }),
        },
      }),
    });

    return {
      id: response.id,
      title: response.fields.Title,
      amount: response.fields.Amount,
      type: response.fields.Type,
      frequency: response.fields.Frequency,
      date: response.fields.Date,
      bankId: response.fields.BankID?.[0] || '',
      remainingBalance: response.fields.RemainingBalance,
      monthlyInterest: response.fields.MonthlyInterest,
      interestRate: response.fields.InterestRate,
      interestType: response.fields.InterestType,
      rateFrequency: response.fields.RateFrequency,
    };
  },

  async updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<Transaction> {
    const response = await airtableRequest(`/Transactions/${transactionId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        fields: {
          ...(updates.title && { Title: updates.title }),
          ...(updates.amount !== undefined && { Amount: updates.amount }),
          ...(updates.type && { Type: updates.type }),
          ...(updates.frequency && { Frequency: updates.frequency }),
          ...(updates.date && { Date: updates.date }),
          ...(updates.bankId && { BankID: [updates.bankId] }),
          ...(updates.remainingBalance !== undefined && { RemainingBalance: updates.remainingBalance }),
          ...(updates.monthlyInterest !== undefined && { MonthlyInterest: updates.monthlyInterest }),
          ...(updates.interestRate !== undefined && { InterestRate: updates.interestRate }),
          ...(updates.interestType && { InterestType: updates.interestType }),
          ...(updates.rateFrequency && { RateFrequency: updates.rateFrequency }),
        },
      }),
    });

    return {
      id: response.id,
      title: response.fields.Title,
      amount: response.fields.Amount,
      type: response.fields.Type,
      frequency: response.fields.Frequency,
      date: response.fields.Date,
      bankId: response.fields.BankID?.[0] || '',
      remainingBalance: response.fields.RemainingBalance,
      monthlyInterest: response.fields.MonthlyInterest,
      interestRate: response.fields.InterestRate,
      interestType: response.fields.InterestType,
      rateFrequency: response.fields.RateFrequency,
    };
  },

  async deleteTransaction(transactionId: string): Promise<void> {
    await airtableRequest(`/Transactions/${transactionId}`, {
      method: 'DELETE',
    });
  },
};