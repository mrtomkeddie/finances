
'use client';

import { useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { AuthContext, AuthContextType } from '@/hooks/useAuth';

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
            case 'auth/popup-closed-by-user':
                message = 'Sign-in process was cancelled.';
                break;
            default:
                message = err.message;
        }
    }
    setError(message);
  }

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

  const signInWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
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

  const value = { user, loading, error, signInWithEmail, signInWithGoogle, signOutUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
