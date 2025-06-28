'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { smartFinancialSuggestions } from '@/ai/flows/smart-financial-suggestions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SuggestionsPage() {
  const { transactions, goals, userProfile } = useAppContext();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleGetSuggestions = () => {
    setError(null);
    setSuggestions(null);
    startTransition(async () => {
      if (transactions.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Not enough data',
          description: 'Please add some transactions before getting suggestions.',
        });
        return;
      }

      try {
        const transactionHistory = transactions.map(t =>
          `${t.date}: ${t.description} - ${t.type === 'income' ? '+' : '-'}$${t.amount} [${t.category}]`
        ).join('\n');

        const financialGoals = goals.map(g =>
          `${g.name} (Target: $${g.targetAmount}, Current: $${g.currentAmount})`
        ).join(', ');

        const profile = `${userProfile.name}: ${userProfile.description}`;

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
      } catch (e) {
        console.error(e);
        setError('An unexpected error occurred while generating suggestions.');
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Financial Suggestions</CardTitle>
          <CardDescription>
            Get personalized tips on how to improve your spending habits and reach your financial goals faster.
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
                <CardTitle className="flex items-center"><Sparkles className="mr-2 text-accent" /> Here are your suggestions:</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none whitespace-pre-wrap">
                {suggestions}
            </CardContent>
        </Card>
      )}
    </div>
  );
}
