
'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, TrendingUp, TrendingDown, CreditCard, Loader2, Edit3, Banknote } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { calculateSummary, calculateMonthlyAmount, formatCurrency } from '@/lib/financial';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { WeeklyForecast } from '@/components/WeeklyForecast';
import { useUI } from '@/context/UIContext';
import { Separator } from '@/components/ui/separator';

export default function DashboardPage() {
  const { 
    transactions,
    banks, 
    weeklyTransferAmount, 
    isInitialLoading, 
    isTransactionsLoading,
    loadTransactions,
    error,
    setError
  } = useData();

  const { openTransferEditModal } = useUI();

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  if (isInitialLoading || isTransactionsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your financial data...</p>
        </div>
      </div>
    );
  }
  
  const getBank = (bankIdOrName: string) => {
    const normalizedName = bankIdOrName.toLowerCase();
    return banks.find(b => b.id === bankIdOrName || b.name.toLowerCase().includes(normalizedName));
  }
  
  const getBankName = (bankId: string) => banks.find(b => b.id === bankId)?.name || 'Unknown Bank';

  const calculateBankTotals = (bankName: string) => {
    const normalizedBankName = bankName.toLowerCase();
    
    let bankTransactions = transactions.filter(t => 
      getBankName(t.bankId).toLowerCase().includes(normalizedBankName)
    );
    
    // Special rule to combine HSBC and Barclays for main account overview
    if (normalizedBankName.includes('hsbc')) {
      bankTransactions = transactions.filter(t => {
        const transactionBankName = getBankName(t.bankId).toLowerCase();
        return transactionBankName.includes('hsbc') || transactionBankName.includes('barclays');
      });
    }
    
    const summary = calculateSummary(bankTransactions);
    
    const expenseAndDebt = bankTransactions
      .filter(t => t.type === 'expense' || (t.type === 'debt' && t.amount > 0))
      .reduce((sum, t) => sum + calculateMonthlyAmount(t.amount, t.frequency), 0);
    
    let adjustedWeeklyNet = summary.weeklyIncome - (expenseAndDebt / 4.33);
    let adjustedMonthlyNet = summary.monthlyIncome - expenseAndDebt;
    
    // Adjust for weekly transfers
    if (normalizedBankName.includes('hsbc')) {
      adjustedWeeklyNet -= weeklyTransferAmount;
      adjustedMonthlyNet -= (weeklyTransferAmount * 4.33);
    } else if (normalizedBankName.includes('santander')) {
      adjustedWeeklyNet += weeklyTransferAmount;
      adjustedMonthlyNet += (weeklyTransferAmount * 4.33);
    }
    
    return {
      weeklyNet: adjustedWeeklyNet,
      monthlyNet: adjustedMonthlyNet,
    };
  };

  const allSummary = calculateSummary(transactions);
  const totalExpenseAndDebt = transactions
    .filter(t => t.type === 'expense' || (t.type === 'debt' && t.amount > 0))
    .reduce((sum, t) => sum + calculateMonthlyAmount(t.amount, t.frequency), 0);
    
  const hsbcTotals = calculateBankTotals('hsbc');
  const hsbcBank = getBank('hsbc');

  const santanderTotals = calculateBankTotals('santander');
  const santanderBank = getBank('santander');
  
  const hasData = banks.length > 0 || transactions.length > 0;
  const netMonthlyCashflow = allSummary.monthlyIncome - totalExpenseAndDebt;

  return (
    <div className="space-y-6">
      {error && (
        <div className="relative rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-red-600 dark:text-red-400">
            <div className="font-bold mb-2">Error</div>
            <p className="whitespace-pre-line">{error}</p>
            <button onClick={() => setError(null)} className="absolute top-2 right-2 text-destructive/80 hover:text-destructive">✕</button>
        </div>
      )}

      {!hasData && !isInitialLoading && !isTransactionsLoading && (
        <Card className="text-center py-16">
          <CardContent>
              <Banknote className="mx-auto mb-6 h-16 w-16 text-muted-foreground" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Welcome to Your Financial Hub</h2>
              <p className="mx-auto max-w-md text-muted-foreground mb-6">
                Get started by adding bank accounts and transactions in the <span className="font-semibold text-foreground">Settings</span> page.
              </p>
          </CardContent>
        </Card>
      )}

      {hasData && (
        <>
          <Card className="w-full text-center p-6">
              <p className="text-sm text-muted-foreground mb-1">Net Monthly Cashflow</p>
              <p className={`text-4xl font-bold ${netMonthlyCashflow >= 0 ? 'text-primary' : 'text-destructive'}`}>
                <AnimatedNumber value={netMonthlyCashflow} />
              </p>
          </Card>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Monthly Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  <AnimatedNumber value={allSummary.monthlyIncome} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Monthly Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  <AnimatedNumber value={totalExpenseAndDebt} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Debt Remaining</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">
                  <AnimatedNumber value={allSummary.totalDebt} />
                </div>
              </CardContent>
            </Card>
          </div>
        
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-6">
            <Card className="relative overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">HSBC Overview</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                    <p className="text-sm text-muted-foreground">Weekly Net</p>
                    <p className={`text-xl font-bold ${hsbcTotals.weeklyNet >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        <AnimatedNumber value={hsbcTotals.weeklyNet} />
                    </p>
                    </div>
                    <div className="text-center">
                    <p className="text-sm text-muted-foreground">Monthly Net</p>
                    <p className={`text-xl font-bold ${hsbcTotals.monthlyNet >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        <AnimatedNumber value={hsbcTotals.monthlyNet} />
                    </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
                {santanderBank && <div className="h-1 absolute top-0 left-0 right-0" style={{ backgroundColor: santanderBank.color }} />}
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold">Santander Overview</CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => openTransferEditModal()}>
                    <Edit3 className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Weekly Net</p>
                            <p className={`text-xl font-bold ${santanderTotals.weeklyNet >= 0 ? 'text-primary' : 'text-destructive'}`}>
                            <AnimatedNumber value={santanderTotals.weeklyNet} />
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Monthly Net</p>
                            <p className={`text-xl font-bold ${santanderTotals.monthlyNet >= 0 ? 'text-primary' : 'text-destructive'}`}>
                            <AnimatedNumber value={santanderTotals.monthlyNet} />
                            </p>
                        </div>
                    </div>
                    {weeklyTransferAmount > 0 && (
                        <>
                            <Separator className="my-3" />
                            <div className="flex items-center justify-between px-2">
                                <span className="text-sm text-muted-foreground">Weekly Transfer In:</span>
                                <span className="text-base font-medium text-blue-500"><AnimatedNumber value={weeklyTransferAmount} /></span>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
          </div>

          <WeeklyForecast transactions={transactions} />
        </>
      )}
    </div>
  );
}
