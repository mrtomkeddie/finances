
'use client';
import { Transaction, Bank } from './types';

const BASE_ID = 'appGr7teCGX1HtXQ7';
const API_TOKEN = 'patyWbrKiNVQumdCP.bda7401339e52ce3baeed0a3c8014a585e8e90b73280c48e303c9bb5c8a163df';

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

class AirtableService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${AIRTABLE_API_BASE}/${BASE_ID}/${endpoint}`;
    
    if (!BASE_ID || !API_TOKEN) {
      const errorMsg = 'Airtable configuration missing. This service is for one-time import only.';
      console.error(`🚨 ${errorMsg}`);
      throw new Error(errorMsg);
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('🚨 Airtable API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        url,
        errorData,
        requestBody: options.body
      });
      throw new Error(`Airtable API Error: ${response.status} ${response.statusText}${errorData?.error?.message ? ` - ${errorData.error.message}` : ''}`);
    }

    return response.json();
  }

  // Helper function to get the correct field name for monthly interest
  private getMonthlyInterestFieldName(record: any): string | null {
    const fields = record.fields;
    const possibleNames = ['MonthlyInterest', 'Monthly Interest', 'Interest', 'MonthlyInterestRate', 'InterestRate'];
    for (const name of possibleNames) {
      if (name in fields) return name;
    }
    return null;
  }

  // Helper function to check if a record is a transfer transaction
  private isTransferTransaction(record: any): boolean {
    const fields = record.fields;
    const hasFromBankID = 'FromBankID' in fields;
    const hasToBankID = 'ToBankID' in fields;
    const hasTransferFields = hasFromBankID || hasToBankID;
    const titleSuggestsTransfer = fields.Title && 
      (fields.Title.toLowerCase().includes('transfer') || 
       fields.Title.toLowerCase().includes(' to ') ||
       fields.Title.toLowerCase().includes('from '));
    return hasTransferFields || titleSuggestsTransfer;
  }

  // Helper function to check if a record has a valid standard BankID
  private hasValidBankID(record: any): boolean {
    const fields = record.fields;
    const checkId = (id: any) => (Array.isArray(id) && id.length > 0 && id[0] && id[0].startsWith('rec')) || (typeof id === 'string' && id.startsWith('rec'));
    return checkId(fields.BankID) || checkId(fields.Bank);
  }

  // Bank operations
  async getBanks(): Promise<Bank[]> {
    const response = await this.makeRequest('Banks');
    return response.records.map((record: any) => ({
      id: record.id,
      name: record.fields.Name || '',
      type: record.fields.Type || 'bank',
      color: record.fields.Color || '#6366f1',
    }));
  }

  // Transaction operations
  async getTransactions(): Promise<Transaction[]> {
    const response = await this.makeRequest('Transactions');
    const validTransactions: Transaction[] = [];
    
    response.records.forEach((record: any) => {
      if (this.isTransferTransaction(record) || !this.hasValidBankID(record)) {
        return;
      }
      
      let bankId = '';
      const bankField = record.fields.BankID || record.fields.Bank;
      if (bankField) {
        bankId = Array.isArray(bankField) ? bankField[0] : bankField;
      }
      
      // Helper to safely parse numbers, returning null if invalid
      const safeParseFloat = (value: any): number | null => {
        if (value === undefined || value === null || value === '') return null;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
      };
      
      const transaction: Transaction = {
        id: record.id,
        title: record.fields.Title || '',
        amount: safeParseFloat(record.fields.Amount) || 0, // Amount should not be null
        type: (record.fields.Type || 'income').toLowerCase(),
        frequency: record.fields.Frequency || 'monthly',
        category: record.fields.Category || '',
        date: record.fields.Date || new Date().toISOString().split('T')[0],
        bankId: bankId,
        remainingBalance: safeParseFloat(record.fields.RemainingBalance),
        monthlyInterest: safeParseFloat(record.fields[this.getMonthlyInterestFieldName(record) || '']),
        interestRate: safeParseFloat(record.fields.InterestRate),
        interestType: record.fields.InterestType || null,
        rateFrequency: record.fields.RateFrequency || null,
        description: record.fields.Description || null,
      };
      
      validTransactions.push(transaction);
    });
    
    return validTransactions;
  }
}

export const airtableService = new AirtableService();
