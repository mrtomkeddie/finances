
'use client';

import { useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/hooks/useAuth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthError = (err: any) => {
    console.error(err);
    let message = 'An unknown error occurred.';
    if (err.code) {
        switch (err.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                message = 'Invalid email or password.';
                break;
            case 'auth/email-already-in-use':
                message = 'An account with this email already exists.';
                break;
            case 'auth/weak-password':
                message = 'Password is too weak. It must be at least 6 characters long.';
                break;
            case 'auth/popup-closed-by-user':
                message = 'Sign-in process was cancelled.';
                break;
            case 'auth/invalid-email':
                message = 'Please enter a valid email address.';
                break;
            default:
                message = err.message;
        }
    }
    setError(message);
    throw new Error(message);
  }

  const signUpWithEmail = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      router.push('/dashboard');
    } catch (err) {
      handleAuthError(err);
    } finally {
        setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      router.push('/dashboard');
    } catch (err) {
      handleAuthError(err);
    } finally {
        setLoading(false);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (err) {
        handleAuthError(err);
    }
  };

  const sendPasswordReset = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      handleAuthError(err);
    }
  };

  const value = { user, loading, error, signInWithEmail, signUpWithEmail, signOutUser, sendPasswordReset };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
