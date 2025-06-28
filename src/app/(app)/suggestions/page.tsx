
'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getTransactions, getGoals, getUserProfile } from '@/lib/firebaseService';
import { smartFinancialSuggestions } from '@/ai/flows/smart-financial-suggestions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SuggestionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleGetSuggestions = () => {
    if (!user) return;

    setError(null);
    setSuggestions(null);
    startTransition(async () => {
      try {
        const [transactions, goals, userProfile] = await Promise.all([
          getTransactions(user.uid),
          getGoals(user.uid, () => {}), // Pass empty callback for non-realtime fetch
          getUserProfile(user.uid)
        ]);

        if (transactions.length === 0) {
          toast({
            variant: 'destructive',
            title: 'Not enough data',
            description: 'Please add some transactions before getting suggestions.',
          });
          return;
        }

        const transactionHistory = transactions.map(t =>
          `${t.date}: ${t.title} - ${t.type === 'income' ? '+' : '-'}${t.amount} [${t.type}]`
        ).join('\n');

        const financialGoals = goals.map(g =>
          `${g.name} (Target: ${g.targetAmount}, Current: ${g.currentAmount})`
        ).join(', ');
        
        const profile = `${userProfile?.name || 'User'}: ${userProfile?.description || 'No description'}`;

        const result = await smartFinancialSuggestions({
          transactionHistory,
          financialGoals,
          userProfile: profile,
        });

        if (result.suggestions) {
            setSuggestions(result.suggestions);
        } else {
            setError('The AI could not generate suggestions at this time. Please try again later.');
        }
      } catch (e: any) {
        console.error(e);
        setError(`An unexpected error occurred: ${e.message}`);
      }
    });
  };

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold">AI Suggestions</h1>
        <p className="text-muted-foreground">Get personalized tips to improve your spending habits.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Financial Suggestions</CardTitle>
          <CardDescription>
            Our AI will analyze your transactions and goals to help you reach your targets faster.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGetSuggestions} disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Get Smart Suggestions
          </Button>
        </CardContent>
      </Card>
      
      {isPending && (
         <Card>
            <CardContent className="p-6 flex items-center justify-center space-x-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Our AI is analyzing your finances...</p>
            </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {suggestions && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center"><Sparkles className="mr-2 text-yellow-400" /> Here are your suggestions:</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {suggestions}
            </CardContent>
        </Card>
      )}
    </div>
  );
}
