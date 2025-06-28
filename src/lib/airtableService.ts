
'use client';
import { Transaction, Bank } from './types';

const BASE_ID = 'appGr7teCGX1HtXQ7';
const API_TOKEN = 'patyWbrKiNVQumdCP.bda7401339e52ce3baeed0a3c8014a585e8e90b73280c48e303c9bb5c8a163df';

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

class AirtableService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${AIRTABLE_API_BASE}/${BASE_ID}/${endpoint}`;
    
    if (!BASE_ID || !API_TOKEN) {
      const errorMsg = 'Airtable configuration missing. Please check your environment variables.';
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
    
    // Check possible field names for monthly interest
    const possibleNames = [
      'MonthlyInterest',
      'Monthly Interest',
      'Interest',
      'MonthlyInterestRate',
      'InterestRate'
    ];
    
    for (const name of possibleNames) {
      if (name in fields) {
        return name;
      }
    }
    
    return null;
  }

  // Helper function to check if a record is a transfer transaction
  private isTransferTransaction(record: any): boolean {
    const fields = record.fields;
    
    // Check if it has transfer-specific fields
    const hasFromBankID = 'FromBankID' in fields;
    const hasToBankID = 'ToBankID' in fields;
    const hasTransferFields = hasFromBankID || hasToBankID;
    
    // Check if title suggests it's a transfer
    const titleSuggestsTransfer = fields.Title && 
      (fields.Title.toLowerCase().includes('transfer') || 
       fields.Title.toLowerCase().includes(' to ') ||
       fields.Title.toLowerCase().includes('from '));
    
    return hasTransferFields || titleSuggestsTransfer;
  }

  // Helper function to check if a record has a valid standard BankID
  private hasValidBankID(record: any): boolean {
    const fields = record.fields;
    
    // Check for standard BankID field (array or string)
    if (fields.BankID) {
      if (Array.isArray(fields.BankID) && fields.BankID.length > 0) {
        return fields.BankID[0] && fields.BankID[0].startsWith('rec');
      }
      if (typeof fields.BankID === 'string') {
        return fields.BankID.startsWith('rec');
      }
    }
    
    // Check for alternative Bank field
    if (fields.Bank) {
      if (Array.isArray(fields.Bank) && fields.Bank.length > 0) {
        return fields.Bank[0] && fields.Bank[0].startsWith('rec');
      }
      if (typeof fields.Bank === 'string') {
        return fields.Bank.startsWith('rec');
      }
    }
    
    return false;
  }

  // Bank operations
  async getBanks(): Promise<Bank[]> {
    try {
      const response = await this.makeRequest('Banks');
      
      const banks = response.records.map((record: any) => {
        return {
          id: record.id,
          name: record.fields.Name || '',
          type: record.fields.Type || 'bank',
          color: record.fields.Color || '#6366f1',
        };
      });
      
      return banks;
    } catch (error) {
      console.error('Error fetching banks:', error);
      throw error;
    }
  }

  async createBank(bank: Omit<Bank, 'id'>): Promise<Bank> {
    try {
      const response = await this.makeRequest('Banks', {
        method: 'POST',
        body: JSON.stringify({
          fields: {
            Name: bank.name,
            Type: bank.type,
            Color: bank.color,
          },
        }),
      });

      return {
        id: response.id,
        name: response.fields.Name || '',
        type: response.fields.Type || 'bank',
        color: response.fields.Color || '#6366f1',
      };
    } catch (error) {
      console.error('Error creating bank:', error);
      throw error;
    }
  }

  async updateBank(bankId: string, updates: Partial<Bank>): Promise<Bank> {
    try {
      const fields: any = {};
      if (updates.name !== undefined) fields.Name = updates.name;
      if (updates.type !== undefined) fields.Type = updates.type;
      if (updates.color !== undefined) fields.Color = updates.color;

      const response = await this.makeRequest('Banks', {
        method: 'PATCH',
        body: JSON.stringify({
          records: [{
            id: bankId,
            fields,
          }],
        }),
      });

      const updatedRecord = response.records[0];
      return {
        id: updatedRecord.id,
        name: updatedRecord.fields.Name || '',
        type: updatedRecord.fields.Type || 'bank',
        color: updatedRecord.fields.Color || '#6366f1',
      };
    } catch (error) {
      console.error('Error updating bank:', error);
      throw error;
    }
  }

  async deleteBank(bankId: string): Promise<void> {
    try {
      await this.makeRequest(`Banks/${bankId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting bank:', error);
      throw error;
    }
  }

  // Transaction operations
  async getTransactions(): Promise<Transaction[]> {
    try {
      const response = await this.makeRequest('Transactions');
      
      // Filter and process transactions
      const validTransactions: Transaction[] = [];
      
      response.records.forEach((record: any) => {
        
        // Check if this is a transfer transaction
        if (this.isTransferTransaction(record)) {
          return;
        }
        
        // Check if this has a valid standard BankID
        if (!this.hasValidBankID(record)) {
          console.warn(`❌ Skipping transaction with invalid/missing BankID: "${record.fields.Title}"`, {
            BankID: record.fields.BankID,
          });
          return;
        }
        
        // Process valid transaction
        let bankId = '';
        if (record.fields.BankID && Array.isArray(record.fields.BankID) && record.fields.BankID.length > 0) {
          bankId = record.fields.BankID[0];
        } else if (record.fields.Bank && Array.isArray(record.fields.Bank) && record.fields.Bank.length > 0) {
          bankId = record.fields.Bank[0];
        } else if (record.fields.BankID && typeof record.fields.BankID === 'string') {
          bankId = record.fields.BankID;
        }
        
        // Get monthly interest using dynamic field name detection
        let monthlyInterest: number | undefined = undefined;
        const monthlyInterestField = this.getMonthlyInterestFieldName(record);
        if (monthlyInterestField && record.fields[monthlyInterestField]) {
          monthlyInterest = parseFloat(record.fields[monthlyInterestField]);
        }
        
        const transaction: Transaction = {
          id: record.id,
          title: record.fields.Title || '',
          amount: parseFloat(record.fields.Amount) || 0,
          type: (record.fields.Type || 'income').toLowerCase(),
          frequency: record.fields.Frequency || 'monthly',
          category: record.fields.Category || '',
          date: record.fields.Date || new Date().toISOString().split('T')[0],
          bankId: bankId,
          remainingBalance: record.fields.RemainingBalance ? parseFloat(record.fields.RemainingBalance) : undefined,
          monthlyInterest: monthlyInterest,
          interestRate: record.fields.InterestRate ? parseFloat(record.fields.InterestRate) : undefined,
          interestType: record.fields.InterestType || (monthlyInterest ? 'monetary' : undefined),
          rateFrequency: record.fields.RateFrequency || 'monthly',
          description: record.fields.Description || undefined,
        };
        
        validTransactions.push(transaction);
      });
      
      return validTransactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    try {
      // Validate bankId
      if (!transaction.bankId || transaction.bankId.trim() === '') {
        throw new Error('Bank ID is required for creating a transaction');
      }

      // Validate that bankId looks like an Airtable record ID
      if (!transaction.bankId.startsWith('rec') || transaction.bankId.length < 14) {
        throw new Error(`Invalid Bank ID format: "${transaction.bankId}". Expected Airtable record ID starting with "rec"`);
      }

      const fields: any = {
        Title: transaction.title,
        Amount: transaction.amount,
        Type: transaction.type,
        Frequency: transaction.frequency,
        Category: transaction.category,
        Date: transaction.date,
        BankID: [transaction.bankId],
        Description: transaction.description
      };
      
      if(transaction.type === 'debt') {
        fields.RemainingBalance = transaction.remainingBalance;
        fields.MonthlyInterest = transaction.monthlyInterest;
        fields.InterestRate = transaction.interestRate;
        fields.InterestType = transaction.interestType;
        fields.RateFrequency = transaction.rateFrequency;
      }


      const response = await this.makeRequest('Transactions', {
        method: 'POST',
        body: JSON.stringify({
          fields,
        }),
      });

      // Use the same logic for processing the response
      let bankId = '';
      if (response.fields.BankID && Array.isArray(response.fields.BankID)) {
        bankId = response.fields.BankID[0] || '';
      }

      // Get monthly interest using dynamic field name detection
      let monthlyInterest: number | undefined = undefined;
      const monthlyInterestField = this.getMonthlyInterestFieldName(response);
      if (monthlyInterestField && response.fields[monthlyInterestField]) {
        monthlyInterest = parseFloat(response.fields[monthlyInterestField]);
      }

      return {
        id: response.id,
        title: response.fields.Title || '',
        amount: parseFloat(response.fields.Amount) || 0,
        type: (response.fields.Type || 'income').toLowerCase(),
        frequency: response.fields.Frequency || 'monthly',
        category: response.fields.Category || '',
        date: response.fields.Date || new Date().toISOString().split('T')[0],
        bankId: bankId,
        remainingBalance: response.fields.RemainingBalance ? parseFloat(response.fields.RemainingBalance) : undefined,
        monthlyInterest: monthlyInterest,
        interestRate: response.fields.InterestRate ? parseFloat(response.fields.InterestRate) : undefined,
        interestType: response.fields.InterestType || undefined,
        rateFrequency: response.fields.RateFrequency || 'monthly',
        description: response.fields.Description || undefined,
      };
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async updateTransaction(transactionId: string, updates: Omit<Transaction, 'id'>): Promise<Transaction> {
    try {
      
      // Validate bankId
      if (!updates.bankId || updates.bankId.trim() === '') {
        throw new Error('Bank ID is required for updating a transaction. Please select a bank.');
      }

      // Validate that bankId looks like an Airtable record ID
      if (!updates.bankId.startsWith('rec') || updates.bankId.length < 14) {
        throw new Error(`Invalid Bank ID format: "${updates.bankId}". Expected Airtable record ID starting with "rec"`);
      }

      const fields: any = {
        Title: updates.title,
        Amount: updates.amount,
        Type: updates.type,
        Frequency: updates.frequency,
        Category: updates.category,
        Date: updates.date,
        BankID: [updates.bankId],
        Description: updates.description
      };
      
      if(updates.type === 'debt') {
        fields.RemainingBalance = updates.remainingBalance;
        fields.MonthlyInterest = updates.monthlyInterest;
        fields.InterestRate = updates.interestRate;
        fields.InterestType = updates.interestType;
        fields.RateFrequency = updates.rateFrequency;
      }
      
      const requestBody = {
        records: [{
          id: transactionId,
          fields,
        }],
      };

      const response = await this.makeRequest('Transactions', {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
      });

      const updatedRecord = response.records[0];
      
      // Use the same logic for processing the response
      let bankId = '';
      if (updatedRecord.fields.BankID && Array.isArray(updatedRecord.fields.BankID)) {
        bankId = updatedRecord.fields.BankID[0] || '';
      }

      // Get monthly interest using dynamic field name detection
      let monthlyInterest: number | undefined = undefined;
      const monthlyInterestField = this.getMonthlyInterestFieldName(updatedRecord);
      if (monthlyInterestField && updatedRecord.fields[monthlyInterestField]) {
        monthlyInterest = parseFloat(updatedRecord.fields[monthlyInterestField]);
      }

      const result = {
        id: updatedRecord.id,
        title: updatedRecord.fields.Title || '',
        amount: parseFloat(updatedRecord.fields.Amount) || 0,
        type: (updatedRecord.fields.Type || 'income').toLowerCase(),
        frequency: updatedRecord.fields.Frequency || 'monthly',
        category: updatedRecord.fields.Category || '',
        date: updatedRecord.fields.Date || new Date().toISOString().split('T')[0],
        bankId: bankId,
        remainingBalance: updatedRecord.fields.RemainingBalance ? parseFloat(updatedRecord.fields.RemainingBalance) : undefined,
        monthlyInterest: monthlyInterest,
        interestRate: updatedRecord.fields.InterestRate ? parseFloat(updatedRecord.fields.InterestRate) : undefined,
        interestType: updatedRecord.fields.InterestType || undefined,
        rateFrequency: updatedRecord.fields.RateFrequency || 'monthly',
        description: updatedRecord.fields.Description || undefined,
      };

      return result;
    } catch (error) {
      console.error('❌ Error updating transaction:', error);
      throw error;
    }
  }

  async deleteTransaction(transactionId: string): Promise<void> {
    try {
      await this.makeRequest(`Transactions/${transactionId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }
}

export const airtableService = new AirtableService();

    