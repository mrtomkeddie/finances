
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
    <div className="w-full lg:grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-6">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Sign In</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
               <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <button 
                  type="button" 
                  onClick={handlePasswordReset} 
                  className="ml-auto inline-block text-sm underline text-muted-foreground hover:text-foreground"
                >
                  Forgot your password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required 
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {message && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-500">{message}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
      <div className="hidden bg-primary lg:flex items-center justify-center p-12 text-center">
        <div className="flex flex-col items-center gap-6 text-primary-foreground">
          <img src="/white.png" alt="Finances App Logo" width={200} height={200} className="w-48 h-auto" />
          <div className="space-y-2">
            <h2 className="text-4xl font-bold">Welcome Back</h2>
            <p className="text-lg text-primary-foreground/80">Your personal finance hub, always at your fingertips.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
