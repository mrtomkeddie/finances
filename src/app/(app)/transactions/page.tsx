
'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useData } from '@/context/DataContext';
import { useUI } from '@/context/UIContext';
import { Transaction, TransactionFrequency } from '@/lib/types';
import { calculateSummary, formatCurrency, calculateMonthlyAmount, calculateNetMonthlyDebtPayment, calculateWeeksUntilPaidOff } from '@/lib/financial';
import { formatDate, getNextDueDate, formatNextDueDate, getNextDueDateColor } from '@/lib/dateUtils';
import { TrendingUp, TrendingDown, CreditCard, Clock, ChevronUp, ChevronDown, SearchX } from 'lucide-react';
import { AnimatedNumber } from '@/components/AnimatedNumber';

type SortColumn = 'name' | 'amount' | 'frequency' | 'monthlyAmount' | 'remainingDebt' | 'weeksUntilPaidOff' | 'dueDate' | 'bank' | 'interest';
type SortDirection = 'asc' | 'desc';

export default function TransactionsPage() {
  const { transactions, banks } = useData();
  const { openDetailModal } = useUI();
  
  const [activeFilter, setActiveFilter] = useState<'income' | 'expense' | 'debt'>('income');
  const [activeBankFilter, setActiveBankFilter] = useState('all-income');
  
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    setSortColumn('name');
    setSortDirection('asc');
  }, [activeFilter]);
  
  const getBankColor = (bankId: string) => banks.find(b => b.id === bankId)?.color || '#6366f1';
  const getBankName = (bankId: string) => banks.find(b => b.id === bankId)?.name || 'Unknown Bank';

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'monthly': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'yearly': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case '4-weekly': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'bi-weekly': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getActiveFilterDisplayName = () => {
    switch (activeFilter) {
      case 'income': return 'Income';
      case 'expense': return 'Expenses';
      case 'debt': return 'Debt Payments';
      default: return 'Transactions';
    }
  };

  const calculateWeeksUntilPaidOffDisplay = (transaction: Transaction) => {
    if (!transaction.remainingBalance || transaction.remainingBalance <= 0) return 'Never';
    if (!transaction.amount || transaction.amount <= 0) return 'Not paying';
    
    const weeks = calculateWeeksUntilPaidOff(transaction);
    if (weeks === null) {
      return calculateNetMonthlyDebtPayment(transaction) <= 0 ? 'Debt growing' : 'Never';
    }
    return `${weeks} weeks`;
  };

  const handleSort = (column: SortColumn) => {
    setSortColumn(prev => {
      if (prev === column) {
        setSortDirection(dir => (dir === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDirection('asc');
      return column;
    });
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  const filteredTransactions = transactions.filter(transaction => {
    const typeMatches = (activeFilter === 'income' && transaction.type === 'income') ||
                        (activeFilter === 'expense' && (transaction.type === 'expense' || transaction.type === 'debt')) ||
                        (activeFilter === 'debt' && transaction.type === 'debt');
    return typeMatches && (activeBankFilter.startsWith('all-') || transaction.bankId === activeBankFilter);
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aValue: any, bValue: any;
    switch (sortColumn) {
      case 'name': aValue = a.title.toLowerCase(); bValue = b.title.toLowerCase(); break;
      case 'amount': aValue = a.amount; bValue = b.amount; break;
      case 'frequency':
        const freqOrder: { [key in TransactionFrequency]: number } = { 'weekly': 1, 'bi-weekly': 2, '4-weekly': 3, 'monthly': 4, 'yearly': 5 };
        aValue = freqOrder[a.frequency] || 6; bValue = freqOrder[b.frequency] || 6; break;
      case 'monthlyAmount': aValue = calculateMonthlyAmount(a.amount, a.frequency); bValue = calculateMonthlyAmount(b.amount, b.frequency); break;
      case 'remainingDebt': aValue = a.remainingBalance || 0; bValue = b.remainingBalance || 0; break;
      case 'interest': aValue = a.monthlyInterest || 0; bValue = b.monthlyInterest || 0; break;
      case 'weeksUntilPaidOff':
        const getWeeks = (t: Transaction) => {
          const weeks = calculateWeeksUntilPaidOff(t);
          if (weeks === null) return calculateNetMonthlyDebtPayment(t) <= 0 ? Infinity : Infinity - 1;
          return weeks;
        };
        aValue = getWeeks(a); bValue = getWeeks(b); break;
      case 'dueDate': aValue = getNextDueDate(a.date, a.frequency).getTime(); bValue = getNextDueDate(b.date, b.frequency).getTime(); break;
      case 'bank': aValue = getBankName(a.bankId).toLowerCase(); bValue = getBankName(b.bankId).toLowerCase(); break;
      default: aValue = a.title.toLowerCase(); bValue = b.title.toLowerCase();
    }
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const debtSummary = calculateSummary(transactions.filter(t => t.type === 'debt' && t.amount > 0));
  
  const monthlyTotal = sortedTransactions
    .filter(t => t.type === 'income' || t.type === 'expense' || (t.type === 'debt' && t.amount > 0))
    .reduce((sum, t) => sum + calculateMonthlyAmount(t.amount, t.frequency), 0);
  const weeklyTotal = monthlyTotal / 4.33;
  
  const totalMonthlyInterest = transactions.filter(t => t.type === 'debt' && t.monthlyInterest).reduce((sum, t) => sum + (t.monthlyInterest || 0), 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex gap-1 p-1 bg-muted/30 rounded-2xl border border-border/50">
            {['income', 'expense', 'debt'].map(filter => (
                <button
                    key={filter}
                    onClick={() => {
                        setActiveFilter(filter as 'income' | 'expense' | 'debt');
                        setActiveBankFilter(`all-${filter}`);
                    }}
                    className={`category-filter-btn flex items-center justify-center gap-2 flex-1 py-3 px-6 rounded-xl transition-all text-base ${
                        activeFilter === filter ? 'bg-card shadow-sm border border-border text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                    {filter === 'income' && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {filter === 'expense' && <TrendingDown className="h-4 w-4 text-red-500" />}
                    {filter === 'debt' && <CreditCard className="h-4 w-4 text-orange-500" />}
                    <span className="hidden xs:inline capitalize">{filter}</span>
                </button>
            ))}
        </div>

        {banks.length > 0 && (
          <div className="overflow-x-auto custom-scrollbar">
            <div className="flex gap-2 pb-2 min-w-max">
              <button onClick={() => setActiveBankFilter(`all-${activeFilter}`)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm ${activeBankFilter.startsWith('all-') ? 'bg-card border-border shadow-sm text-foreground' : 'bg-muted/20 border-muted text-muted-foreground hover:bg-muted/40'}`}>
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-green-400" />
                <span>All Banks</span>
              </button>
              {banks.map((bank) => (
                <button key={bank.id} onClick={() => setActiveBankFilter(bank.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm ${activeBankFilter === bank.id ? 'bg-card border-border shadow-sm text-foreground' : 'bg-muted/20 border-muted text-muted-foreground hover:bg-muted/40'}`}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: bank.color }} />
                  <span>{bank.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    
      <Card className="bg-card border-border overflow-hidden card-interactive">
        <div className="table-container custom-scrollbar overflow-x-auto">
          <table className="sticky-table">
            <thead>
              <tr>
                <th className="sortable text-muted-foreground text-left" onClick={() => handleSort('name')}><div className="flex items-center">Name{getSortIcon('name')}</div></th>
                <th className="sortable text-muted-foreground text-left" onClick={() => handleSort('amount')}><div className="flex items-center">{activeFilter === 'debt' ? 'Payment' : 'Amount'}{getSortIcon('amount')}</div></th>
                {activeFilter !== 'debt' && <>
                  <th className="sortable text-muted-foreground text-left hidden md:table-cell" onClick={() => handleSort('frequency')}><div className="flex items-center">Frequency{getSortIcon('frequency')}</div></th>
                  <th className="sortable text-muted-foreground text-left hidden lg:table-cell" onClick={() => handleSort('monthlyAmount')}><div className="flex items-center">Monthly Amount{getSortIcon('monthlyAmount')}</div></th>
                </>}
                {activeFilter === 'debt' && <>
                  <th className="sortable text-muted-foreground text-left hidden lg:table-cell" onClick={() => handleSort('interest')}><div className="flex items-center">Monthly Interest{getSortIcon('interest')}</div></th>
                  <th className="sortable text-muted-foreground text-left hidden lg:table-cell" onClick={() => handleSort('remainingDebt')}><div className="flex items-center">Remaining Debt{getSortIcon('remainingDebt')}</div></th>
                  <th className="sortable text-muted-foreground text-left hidden md:table-cell" onClick={() => handleSort('weeksUntilPaidOff')}><div className="flex items-center">Weeks Until Paid Off{getSortIcon('weeksUntilPaidOff')}</div></th>
                </>}
                <th className="sortable text-muted-foreground text-left hidden sm:table-cell" onClick={() => handleSort('dueDate')}><div className="flex items-center">Next Due Date{getSortIcon('dueDate')}</div></th>
                <th className="sortable text-muted-foreground text-left hidden sm:table-cell" onClick={() => handleSort('bank')}><div className="flex items-center">Bank{getSortIcon('bank')}</div></th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                      <SearchX className="h-16 w-16" />
                      <h3 className="text-xl font-semibold text-foreground">No Transactions Found</h3>
                      <p>Try adjusting your filters or adding a new transaction.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedTransactions.map((t) => (
                  <tr key={t.id} className="cursor-pointer" onClick={() => openDetailModal(t)}>
                    <td className="font-medium text-foreground truncate max-w-xs">{t.title}</td>
                    <td className="text-foreground">{formatCurrency(t.amount)}</td>
                    {activeFilter !== 'debt' && <>
                      <td className="hidden md:table-cell"><Badge variant="outline" className={getFrequencyColor(t.frequency)}>{t.frequency}</Badge></td>
                      <td className="text-foreground hidden lg:table-cell">{formatCurrency(calculateMonthlyAmount(t.amount, t.frequency))}</td>
                    </>}
                    {activeFilter === 'debt' && <>
                      <td className="text-yellow-400 hidden lg:table-cell">{t.monthlyInterest ? formatCurrency(t.monthlyInterest) : '£0.00'}</td>
                      <td className="text-orange-400 hidden lg:table-cell">{formatCurrency(t.remainingBalance || 0)}</td>
                      <td className="w-48 hidden md:table-cell">
                        {(() => {
                          const display = calculateWeeksUntilPaidOffDisplay(t);
                          if (display.includes('weeks')) {
                            const weeks = calculateWeeksUntilPaidOff(t)!;
                            const maxWeeksForProgress = 104; // 2 years as baseline
                            const progressValue = Math.max(0, Math.min(100, ((maxWeeksForProgress - weeks) / maxWeeksForProgress) * 100));
                            return (
                              <div className="space-y-1.5">
                                <Progress value={progressValue} className="h-2 [&>div]:bg-blue-400" />
                                <span className="text-xs text-blue-400">{display}</span>
                              </div>
                            );
                          }
                          const textColor = t.amount === 0 ? 'text-muted-foreground' : (calculateNetMonthlyDebtPayment(t) <= 0 ? 'text-red-400' : 'text-blue-400');
                          return <span className={textColor}>{display}</span>;
                        })()}
                      </td>
                    </>}
                    <td className="hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className={getNextDueDateColor(t.date, t.frequency)}>{formatDate(getNextDueDate(t.date, t.frequency))}</span>
                          <span className="text-xs text-muted-foreground">{formatNextDueDate(t.date, t.frequency)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getBankColor(t.bankId) }}/>
                        <span className="text-foreground truncate max-w-xs">{getBankName(t.bankId)}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {(activeFilter === 'income' || activeFilter === 'expense') && (
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-4 bg-card border-border text-center card-interactive">
            <p className="text-sm text-muted-foreground mb-1">Weekly {getActiveFilterDisplayName()}</p>
            <p className="text-xl font-bold text-foreground"><AnimatedNumber value={weeklyTotal} /></p>
          </Card>
          <Card className="p-4 bg-card border-border text-center card-interactive">
            <p className="text-sm text-muted-foreground mb-1">Monthly {getActiveFilterDisplayName()}</p>
            <p className="text-xl font-bold text-foreground"><AnimatedNumber value={monthlyTotal} /></p>
          </Card>
        </div>
      )}

      {activeFilter === 'debt' && (
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-4 bg-card border-border card-interactive">
            <h3 className="font-semibold text-foreground">Total Monthly Debt Payments</h3>
            <p className="text-2xl font-bold text-orange-400"><AnimatedNumber value={debtSummary.monthlyDebt} /></p>
          </Card>
          <Card className="p-4 bg-card border-border card-interactive">
            <h3 className="font-semibold text-foreground">Total Monthly Interest</h3>
            <p className="text-2xl font-bold text-yellow-400"><AnimatedNumber value={totalMonthlyInterest} /></p>
          </Card>
        </div>
      )}
    </div>
  );
}
