
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function LoginForm() {
  const { signInWithEmail, sendPasswordReset, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (authError) {
      setError(authError);
      setIsLoading(false);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
        await signInWithEmail(email, password);
    } catch (err) {
        // Error is handled by the auth context hook
    }
    // isLoading is reset by the useEffect hook on authError or on navigation
  };

  const handlePasswordReset = async () => {
    setError('');
    setMessage('');
    if (!email) {
      setError('Please enter your email address to reset your password.');
      return;
    }
    try {
      await sendPasswordReset(email);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
            <img src="/white.png" alt="Finances App Logo" className="mx-auto h-auto w-40 mb-6" />
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-balance text-gray-400 mt-2">
              Sign in to access your financial hub.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
               <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <button 
                  type="button" 
                  onClick={handlePasswordReset} 
                  className="ml-auto inline-block text-sm text-gray-400 hover:text-white underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                  required 
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {message && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/20 border border-green-500/30">
                <p className="text-sm text-green-400">{message}</p>
              </div>
            )}

            <Button type="submit" className="w-full bg-white text-gray-900 hover:bg-gray-200" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
        </form>
      </div>
    </div>
  );
}
