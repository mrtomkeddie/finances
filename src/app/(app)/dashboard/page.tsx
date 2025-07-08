
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, TrendingUp, TrendingDown, CreditCard, Loader2, Edit3 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { calculateSummary, calculateMonthlyAmount } from '@/lib/financial';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { WeeklyForecast } from '@/components/WeeklyForecast';
import { useUI } from '@/context/UIContext';

export default function DashboardPage() {
  const { 
    transactions,
    banks, 
    weeklyTransferAmount, 
    isInitialLoading, 
    error,
    setError
  } = useData();

  const { openTransferEditModal } = useUI();

  if (isInitialLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your financial data...</p>
        </div>
      </div>
    );
  }
  
  const getBankName = (bankId: string) => banks.find(b => b.id === bankId)?.name || 'Unknown Bank';

  const calculateBankTotals = (bankName: string) => {
    const normalizedBankName = bankName.toLowerCase();
    
    let bankTransactions = transactions.filter(t => 
      getBankName(t.bankId).toLowerCase().includes(normalizedBankName)
    );
    
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
  const santanderTotals = calculateBankTotals('santander');
  const hasData = banks.length > 0 || transactions.length > 0;

  return (
    <div className="space-y-4 sm:space-y-6">
       {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm whitespace-pre-line relative">
            <div className="font-bold mb-2">Error</div>
            {error}
            <button onClick={() => setError(null)} className="absolute top-2 right-2 text-red-300 hover:text-red-200">✕</button>
        </div>
      )}

      {!hasData && !isInitialLoading && (
        <Card className="text-center py-12">
          <CardContent>
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-6" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Welcome to Your Financial Tracker</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                It looks like you don't have any data yet. Head over to the <span className="font-semibold text-foreground">Settings</span> page to import your data or add banks and transactions manually.
              </p>
          </CardContent>
        </Card>
      )}

      {hasData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <Card className="p-4 sm:p-6 bg-card border-border card-interactive">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex-shrink-0">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Monthly Income</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground truncate"><AnimatedNumber value={allSummary.monthlyIncome} /></p>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 bg-card border-border card-interactive">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex-shrink-0">
                  <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Monthly Expenses</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground truncate"><AnimatedNumber value={totalExpenseAndDebt} /></p>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 bg-card border-border card-interactive">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 flex-shrink-0">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Debt Remaining</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground truncate"><AnimatedNumber value={allSummary.totalDebt} /></p>
                </div>
              </div>
            </Card>
          </div>
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <Card className="p-4 sm:p-6 bg-card border-border card-interactive">
              <h3 className="font-semibold mb-2 text-foreground text-sm sm:text-base">HSBC Overview</h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Weekly Net Income:</span>
                  <span className={`font-medium text-sm sm:text-base ${hsbcTotals.weeklyNet >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <AnimatedNumber value={hsbcTotals.weeklyNet} />
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Monthly Net Income:</span>
                  <span className={`font-medium text-sm sm:text-base ${hsbcTotals.monthlyNet >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <AnimatedNumber value={hsbcTotals.monthlyNet} />
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 bg-card border-border card-interactive">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground text-sm sm:text-base">Santander Overview</h3>
                <Button variant="ghost" size="sm" className="p-1 h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => openTransferEditModal()}>
                  <Edit3 className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Weekly Net Income:</span>
                  <span className={`font-medium text-sm sm:text-base ${santanderTotals.weeklyNet >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <AnimatedNumber value={santanderTotals.weeklyNet} />
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Monthly Net Income:</span>
                  <span className={`font-medium text-sm sm:text-base ${santanderTotals.monthlyNet >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <AnimatedNumber value={santanderTotals.monthlyNet} />
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-border/40">
                  <span className="text-xs sm:text-sm text-muted-foreground">Weekly Transfer In:</span>
                  <span className="font-medium text-sm sm:text-base text-blue-400"><AnimatedNumber value={weeklyTransferAmount} /></span>
                </div>
              </div>
            </Card>
          </div>

          <WeeklyForecast transactions={transactions} />
        </>
      )}
    </div>
  );
}
