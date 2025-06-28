import { Transaction, Bank } from './types';

const BASE_ID = 'appGr7teCGX1HtXQ7';
const API_TOKEN = 'patyWbrKiNVQumdCP.bda7401339e52ce3baeed0a3c8014a585e8e90b73280c48e303c9bb5c8a163df';

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

class AirtableService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${AIRTABLE_API_BASE}/${BASE_ID}/${endpoint}`;
    
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
        console.log(`✅ Found monthly interest field: "${name}"`);
        return name;
      }
    }
    
    console.log('⚠️ No monthly interest field found in:', Object.keys(fields));
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
      console.log('🏦 Raw Banks response:', JSON.stringify(response, null, 2));
      
      const banks = response.records.map((record: any) => {
        console.log('🏦 Processing bank record:', {
          id: record.id,
          fields: record.fields
        });
        
        return {
          id: record.id,
          name: record.fields.Name || '',
          type: record.fields.Type || 'bank',
          color: record.fields.Color || '#6366f1',
        };
      });
      
      console.log('🏦 Final processed banks:', banks);
      return banks;
    } catch (error) {
      console.error('Error fetching banks:', error);
      throw error;
    }
  }

  async createBank(bank: Bank): Promise<Bank> {
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
      console.log('💰 Raw Transactions response:', JSON.stringify(response, null, 2));
      
      // Filter and process transactions
      const validTransactions: Transaction[] = [];
      let transferCount = 0;
      let invalidCount = 0;
      
      response.records.forEach((record: any) => {
        console.log('💰 Processing transaction record:', {
          id: record.id,
          title: record.fields.Title,
          fields: record.fields,
          allFieldNames: Object.keys(record.fields)
        });
        
        // Check if this is a transfer transaction
        if (this.isTransferTransaction(record)) {
          console.log(`🔄 Skipping transfer transaction: "${record.fields.Title}"`);
          transferCount++;
          return;
        }
        
        // Check if this has a valid standard BankID
        if (!this.hasValidBankID(record)) {
          console.warn(`❌ Skipping transaction with invalid/missing BankID: "${record.fields.Title}"`, {
            BankID: record.fields.BankID,
            Bank: record.fields.Bank,
            FromBankID: record.fields.FromBankID,
            ToBankID: record.fields.ToBankID,
            allFields: Object.keys(record.fields)
          });
          invalidCount++;
          return;
        }
        
        // Process valid transaction
        let bankId = '';
        if (record.fields.BankID && Array.isArray(record.fields.BankID) && record.fields.BankID.length > 0) {
          bankId = record.fields.BankID[0];
          console.log(`✅ Found BankID as array: ${bankId}`);
        } else if (record.fields.Bank && Array.isArray(record.fields.Bank) && record.fields.Bank.length > 0) {
          bankId = record.fields.Bank[0];
          console.log(`✅ Found Bank as array: ${bankId}`);
        } else if (record.fields.BankID && typeof record.fields.BankID === 'string') {
          bankId = record.fields.BankID;
          console.log(`✅ Found BankID as string: ${bankId}`);
        } else if (record.fields.Bank && typeof record.fields.Bank === 'string') {
          bankId = record.fields.Bank;
          console.log(`✅ Found Bank as string: ${bankId}`);
        }
        
        console.log(`💰 Final bankId for "${record.fields.Title}": "${bankId}"`);
        
        // Get monthly interest using dynamic field name detection
        let monthlyInterest: number | undefined = undefined;
        const monthlyInterestField = this.getMonthlyInterestFieldName(record);
        if (monthlyInterestField && record.fields[monthlyInterestField]) {
          monthlyInterest = parseFloat(record.fields[monthlyInterestField]);
          console.log(`✅ Found monthly interest in field "${monthlyInterestField}": ${monthlyInterest}`);
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
      
      console.log(`💰 Transaction processing summary:`, {
        total: response.records.length,
        valid: validTransactions.length,
        transfers: transferCount,
        invalid: invalidCount
      });
      
      console.log('💰 Final processed transactions:', validTransactions);
      
      // Show detailed bank linking status
      validTransactions.forEach((t, index) => {
        const status = t.bankId ? '✅ LINKED' : '❌ NOT LINKED';
        console.log(`💰 Transaction ${index + 1}: "${t.title}" -> Bank ID: "${t.bankId}" (${status})`);
      });
      
      return validTransactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async createTransaction(transaction: Transaction): Promise<Transaction> {
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
      };

      console.log('🔄 Creating transaction with fields:', JSON.stringify(fields, null, 2));

      if (transaction.remainingBalance !== undefined) {
        fields.RemainingBalance = transaction.remainingBalance;
      }
      
      // Add interest fields based on type
      if (transaction.monthlyInterest !== undefined) {
        fields.MonthlyInterest = transaction.monthlyInterest;
      }
      
      if (transaction.interestRate !== undefined) {
        fields.InterestRate = transaction.interestRate;
      }
      
      if (transaction.interestType) {
        fields.InterestType = transaction.interestType;
      }
      
      if (transaction.rateFrequency) {
        fields.RateFrequency = transaction.rateFrequency;
      }
      
      if (transaction.description) {
        fields.Description = transaction.description;
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
      } else if (response.fields.Bank && Array.isArray(response.fields.Bank)) {
        bankId = response.fields.Bank[0] || '';
      } else if (response.fields.BankID && typeof response.fields.BankID === 'string') {
        bankId = response.fields.BankID;
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
      console.log('🔄 Starting transaction update:', {
        transactionId,
        updates: {
          title: updates.title,
          bankId: updates.bankId,
          amount: updates.amount,
          remainingBalance: updates.remainingBalance,
          monthlyInterest: updates.monthlyInterest,
          interestRate: updates.interestRate,
          interestType: updates.interestType
        }
      });

      // Validate bankId
      if (!updates.bankId || updates.bankId.trim() === '') {
        console.error('❌ Bank ID validation failed: empty or undefined', {
          bankId: updates.bankId,
          bankIdType: typeof updates.bankId
        });
        throw new Error('Bank ID is required for updating a transaction. Please select a bank.');
      }

      // Validate that bankId looks like an Airtable record ID
      if (!updates.bankId.startsWith('rec') || updates.bankId.length < 14) {
        console.error('❌ Bank ID format validation failed:', {
          bankId: updates.bankId,
          startsWithRec: updates.bankId.startsWith('rec'),
          length: updates.bankId.length
        });
        throw new Error(`Invalid Bank ID format: "${updates.bankId}". Expected Airtable record ID starting with "rec"`);
      }

      console.log('✅ Bank ID validation passed:', updates.bankId);

      const fields: any = {
        Title: updates.title,
        Amount: updates.amount,
        Type: updates.type,
        Frequency: updates.frequency,
        Category: updates.category,
        Date: updates.date,
        BankID: [updates.bankId],
      };

      console.log('🔄 Update fields being sent:', JSON.stringify(fields, null, 2));

      if (updates.remainingBalance !== undefined) {
        fields.RemainingBalance = updates.remainingBalance;
      }
      
      // Add interest fields based on type
      if (updates.monthlyInterest !== undefined) {
        fields.MonthlyInterest = updates.monthlyInterest;
      }
      
      if (updates.interestRate !== undefined) {
        fields.InterestRate = updates.interestRate;
      }
      
      if (updates.interestType) {
        fields.InterestType = updates.interestType;
      }
      
      if (updates.rateFrequency) {
        fields.RateFrequency = updates.rateFrequency;
      }
      
      if (updates.description) {
        fields.Description = updates.description;
      }

      const requestBody = {
        records: [{
          id: transactionId,
          fields,
        }],
      };

      console.log('🔄 Full request body:', JSON.stringify(requestBody, null, 2));

      const response = await this.makeRequest('Transactions', {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
      });

      console.log('✅ Update response received:', JSON.stringify(response, null, 2));

      const updatedRecord = response.records[0];
      
      // Use the same logic for processing the response
      let bankId = '';
      if (updatedRecord.fields.BankID && Array.isArray(updatedRecord.fields.BankID)) {
        bankId = updatedRecord.fields.BankID[0] || '';
      } else if (updatedRecord.fields.Bank && Array.isArray(updatedRecord.fields.Bank)) {
        bankId = updatedRecord.fields.Bank[0] || '';
      } else if (updatedRecord.fields.BankID && typeof updatedRecord.fields.BankID === 'string') {
        bankId = updatedRecord.fields.BankID;
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

      console.log('✅ Final processed result:', result);
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
