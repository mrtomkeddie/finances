
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  onSnapshot,
  Unsubscribe,
  setDoc,
} from 'firebase/firestore';
import type { Transaction, Bank, Goal, UserProfile } from './types';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Helper function to convert Firestore doc to object with ID
const docToObj = (d: any) => ({ id: d.id, ...d.data() });

// Bank Operations
export const getBanks = async (userId: string): Promise<Bank[]> => {
  const q = query(collection(db, `users/${userId}/banks`));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToObj) as Bank[];
};

export const addBank = async (userId: string, bank: Omit<Bank, 'id'>): Promise<Bank> => {
  const docRef = await addDoc(collection(db, `users/${userId}/banks`), bank);
  return { id: docRef.id, ...bank };
};

export const updateBank = async (userId: string, bankId: string, updates: Partial<Bank>): Promise<Bank> => {
  const docRef = doc(db, `users/${userId}/banks`, bankId);
  await updateDoc(docRef, updates);
  const updatedDoc = await getDoc(docRef);
  return docToObj(updatedDoc) as Bank;
};

export const deleteBank = (userId: string, bankId: string) => {
  return deleteDoc(doc(db, `users/${userId}/banks`, bankId));
};


// Transaction Operations
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  const q = query(collection(db, `users/${userId}/transactions`));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToObj) as Transaction[];
};

export const addTransaction = async (userId: string, transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const docRef = await addDoc(collection(db, `users/${userId}/transactions`), transaction);
    return { id: docRef.id, ...transaction };
};
  
export const updateTransaction = async (userId: string, transactionId: string, updates: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const docRef = doc(db, `users/${userId}/transactions`, transactionId);
    await updateDoc(docRef, updates);
    const updatedDoc = await getDoc(docRef);
    return docToObj(updatedDoc) as Transaction;
};
  
export const deleteTransaction = (userId: string, transactionId: string) => {
    return deleteDoc(doc(db, `users/${userId}/transactions`, transactionId));
};


// Goal Operations
export const getGoals = (userId: string, callback: (goals: Goal[]) => void): Unsubscribe => {
    const q = query(collection(db, `users/${userId}/goals`));
    return onSnapshot(q, (querySnapshot) => {
        const goals = querySnapshot.docs.map(docToObj) as Goal[];
        callback(goals);
    });
};

export const addGoal = async (userId: string, goal: Omit<Goal, 'id'>): Promise<Goal> => {
    const docRef = await addDoc(collection(db, `users/${userId}/goals`), goal);
    return { id: docRef.id, ...goal };
};

export const updateGoal = async (userId: string, goalId: string, updates: Partial<Goal>): Promise<void> => {
    const docRef = doc(db, `users/${userId}/goals`, goalId);
    return updateDoc(docRef, updates);
};

export const deleteGoal = (userId: string, goalId: string) => {
    return deleteDoc(doc(db, `users/${userId}/goals`, goalId));
};

// User Profile Operations
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    const docRef = doc(db, `users/${userId}/profile`, 'main');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as UserProfile : null;
};

export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>): Promise<void> => {
    const docRef = doc(db, `users/${userId}/profile`, 'main');
    return setDoc(docRef, profile, { merge: true });
};


// Data Management
export const clearAllUserData = async (userId: string) => {
    const batch = writeBatch(db);

    const collections = ['transactions', 'banks', 'goals'];
    for (const col of collections) {
        const snapshot = await getDocs(collection(db, `users/${userId}/${col}`));
        snapshot.docs.forEach((d) => batch.delete(d.ref));
    }
    
    // Also delete the profile
    const profileDoc = doc(db, `users/${userId}/profile`, 'main');
    batch.delete(profileDoc);

    await batch.commit();
}


export { auth, db };
