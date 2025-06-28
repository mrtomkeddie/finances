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