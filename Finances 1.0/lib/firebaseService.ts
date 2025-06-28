import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
import { Transaction, Bank, BankType, TransactionType, TransactionFrequency } from './types';

const banksCollection = collection(db, 'banks');
const transactionsCollection = collection(db, 'transactions');

export const firebaseService = {
  // Bank operations
  async getBanks(userId: string): Promise<Bank[]> {
    const q = query(banksCollection, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bank));
  },

  async addBank(userId: string, bankData: Omit<Bank, 'id' | 'userId'>): Promise<Bank> {
    const docRef = await addDoc(banksCollection, { ...bankData, userId });
    return { id: docRef.id, userId, ...bankData };
  },

  async updateBank(bankId: string, updates: Partial<Bank>): Promise<Bank> {
    const bankDoc = doc(db, 'banks', bankId);
    await updateDoc(bankDoc, updates);
    return { id: bankId, ...updates } as Bank; // This is a partial return, might need to fetch the full doc
  },

  async deleteBank(bankId: string): Promise<void> {
    const bankDoc = doc(db, 'banks', bankId);
    await deleteDoc(bankDoc);
  },

  // Transaction operations
  async getTransactions(userId: string): Promise<Transaction[]> {
    const q = query(transactionsCollection, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      // Convert Firestore Timestamp to ISO string if necessary
      const date = data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date;
      return { id: doc.id, ...data, date } as Transaction;
    });
  },

  async addTransaction(userId: string, transactionData: Omit<Transaction, 'id' | 'userId'>): Promise<Transaction> {
    const docRef = await addDoc(transactionsCollection, { ...transactionData, userId });
    return { id: docRef.id, userId, ...transactionData };
  },

  async updateTransaction(transactionId: string, updates: Omit<Transaction, 'id' | 'userId'>): Promise<Transaction> {
    const transactionDoc = doc(db, 'transactions', transactionId);
    await updateDoc(transactionDoc, updates);
    return { id: transactionId, ...updates } as Transaction;
  },

  async deleteTransaction(transactionId: string): Promise<void> {
    const transactionDoc = doc(db, 'transactions', transactionId);
    await deleteDoc(transactionDoc);
  },
};
