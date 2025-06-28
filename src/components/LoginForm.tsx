
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, AlertCircle, Landmark, Lock, Mail } from 'lucide-react';
import { Separator } from './ui/separator';
import { useAuth } from '@/hooks/useAuth';

export function LoginForm() {
  const { signInWithEmail, signInWithGoogle, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (authError) {
      setError(authError);
      setIsLoading(false);
    }
  }, [authError]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    await signInWithEmail(email, password);
  };
  
  const handleGoogleSubmit = async () => {
    setError('');
    setIsLoading(true);
    await signInWithGoogle();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-card border-border shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 border border-primary/20 w-fit flex items-center justify-center">
              <Landmark className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Finance Port
            </CardTitle>
            <CardDescription>
              Sign in to access your financial dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-input border-border text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-input border-border text-foreground"
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

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !email || !password}
              >
                {isLoading ? 'Signing in...' : 'Sign In with Email'}
              </Button>
            </form>
            
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSubmit}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.5 173.5 58.1l-65.2 65.2C337 95.6 295.1 84.5 248 84.5c-81.6 0-148.2 66.6-148.2 148.2s66.6 148.2 148.2 148.2c87.9 0 129.2-60.1 133.7-91.2h-133.7v-73.2h255.4c1.5 12.6 2.4 25.4 2.4 41.5z"></path></svg>
              Sign in with Google
            </Button>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Secure access to your personal financial data
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
