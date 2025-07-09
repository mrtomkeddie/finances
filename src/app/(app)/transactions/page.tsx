
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/context/DataContext';
import { useUI } from '@/context/UIContext';
import { Transaction, TransactionFrequency } from '@/lib/types';
import { calculateSummary, formatCurrency, calculateMonthlyAmount, calculateWeeksUntilPaidOff, calculateNetMonthlyDebtPayment } from '@/lib/financial';
import { formatDate, formatNextDueDate, getNextDueDate } from '@/lib/dateUtils';
import { ArrowDown, ArrowUp, CreditCard, Calendar, Banknote, SearchX, ChevronUp, ChevronDown, Check, ArrowUpDown, Loader2 } from 'lucide-react';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type SortColumn = 'name' | 'amount' | 'dueDate' | 'bank';
type SortDirection = 'asc' | 'desc';

const sortOptions: { value: string; label: string }[] = [
    { value: 'dueDate_asc', label: 'Due Date (Soonest)' },
    { value: 'dueDate_desc', label: 'Due Date (Latest)' },
    { value: 'amount_desc', label: 'Amount (High-Low)' },
    { value: 'amount_asc', label: 'Amount (Low-High)' },
    { value: 'name_asc', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
];

export default function TransactionsPage() {
    const { 
      transactions, 
      banks, 
      weeklyTransferAmount, 
      isInitialLoading, 
      isTransactionsLoading, 
      loadTransactions 
    } = useData();
    const { openDetailModal } = useUI();
    
    const [activeFilter, setActiveFilter] = useState<'all' | 'income' | 'expense' | 'debt'>('all');
    const [activeBankFilter, setActiveBankFilter] = useState<string>('all');
    const [isBankPopoverOpen, setBankPopoverOpen] = useState(false);
    
    const [sort, setSort] = useState<string>('dueDate_asc');

    useEffect(() => {
        loadTransactions();
    }, [loadTransactions]);

    const getBankName = (bankId: string) => banks.find(b => b.id === bankId)?.name || 'Unknown';
    const getBankColor = (bankId: string) => banks.find(b => b.id === bankId)?.color || '#6366f1';

    const sortedTransactions = useMemo(() => {
        const filtered = transactions.filter(t => {
            const typeMatches = activeFilter === 'all' || t.type === activeFilter || (activeFilter === 'expense' && t.type === 'debt');
            const bankMatches = activeBankFilter === 'all' || t.bankId === activeBankFilter;
            return typeMatches && bankMatches;
        });

        const [sortColumn, sortDirection] = sort.split('_') as [SortColumn, SortDirection];

        return [...filtered].sort((a, b) => {
            let aValue: any, bValue: any;
            switch (sortColumn) {
                case 'name': aValue = a.title.toLowerCase(); bValue = b.title.toLowerCase(); break;
                case 'amount': aValue = a.amount; bValue = b.amount; break;
                case 'dueDate': aValue = getNextDueDate(a.date, a.frequency).getTime(); bValue = getNextDueDate(b.date, b.frequency).getTime(); break;
                case 'bank': aValue = getBankName(a.bankId).toLowerCase(); bValue = getBankName(b.bankId).toLowerCase(); break;
                default: aValue = 0; bValue = 0;
            }
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [transactions, activeFilter, activeBankFilter, sort, banks]);

    const totalSummary = useMemo(() => {
        const filteredTxs = transactions.filter(t => 
            activeBankFilter === 'all' || t.bankId === activeBankFilter
        );

        const summary = calculateSummary(filteredTxs);
        
        let income = summary.monthlyIncome;
        const outgoings = summary.monthlyExpenses + summary.monthlyDebt;

        // If filtering by Santander, add the weekly transfer amount
        if (activeBankFilter !== 'all') {
            const bankName = getBankName(activeBankFilter).toLowerCase();
            if (bankName.includes('santander')) {
                income += weeklyTransferAmount * 4.33;
            }
        }
        
        return { income, expenses: outgoings };
    }, [transactions, activeBankFilter, banks, weeklyTransferAmount]);

    if (isInitialLoading || isTransactionsLoading) {
        return (
          <div className="flex h-full items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          </div>
        );
    }

    const TransactionIcon = ({ type }: { type: string }) => {
        if (type === 'income') return <ArrowUp className="h-5 w-5 text-green-500" />;
        if (type === 'expense') return <ArrowDown className="h-5 w-5 text-red-500" />;
        if (type === 'debt') return <CreditCard className="h-5 w-5 text-orange-500" />;
        return <Banknote className="h-5 w-5 text-muted-foreground" />;
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="grid grid-cols-2 gap-4 p-4 text-center">
                    <div>
                        <p className="text-sm text-muted-foreground">Monthly Income</p>
                        <p className="text-lg font-bold text-green-500"><AnimatedNumber value={totalSummary.income} /></p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Monthly Outgoings</p>
                        <p className="text-lg font-bold text-red-500"><AnimatedNumber value={totalSummary.expenses} /></p>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {['all', 'income', 'expense', 'debt'].map(filter => (
                        <Button key={filter} variant={activeFilter === filter ? 'default' : 'secondary'}
                            onClick={() => setActiveFilter(filter as any)}>
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </Button>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                     <Popover open={isBankPopoverOpen} onOpenChange={setBankPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto">
                                <Banknote className="mr-2 h-4 w-4" />
                                {activeBankFilter === 'all' ? 'All Banks' : getBankName(activeBankFilter)}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-0">
                            <div className="p-2 space-y-1">
                                <Button variant={activeBankFilter === 'all' ? 'secondary' : 'ghost'} 
                                        className="w-full justify-start"
                                        onClick={() => { setActiveBankFilter('all'); setBankPopoverOpen(false); }}>All Banks</Button>
                                {banks.map(bank => (
                                    <Button key={bank.id} variant={activeBankFilter === bank.id ? 'secondary' : 'ghost'} 
                                            className="w-full justify-start gap-2"
                                            onClick={() => { setActiveBankFilter(bank.id); setBankPopoverOpen(false); }}>
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: bank.color }} />
                                        {bank.name}
                                    </Button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Select value={sort} onValueChange={setSort}>
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Sort by..." />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-3">
                {sortedTransactions.length === 0 ? (
                    <div className="py-20 text-center">
                        <SearchX className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Transactions Found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters.</p>
                    </div>
                ) : (
                    sortedTransactions.map(t => (
                        <Card key={t.id} className="cursor-pointer transition-all hover:bg-accent" onClick={() => openDetailModal(t)}>
                            <CardContent className="flex items-center gap-4 p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                    <TransactionIcon type={t.type} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">{t.title}</p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getBankColor(t.bankId) }} />
                                            <span>{getBankName(t.bankId)}</span>
                                        </div>
                                        &bull;
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>{formatNextDueDate(t.date, t.frequency)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${t.type === 'income' ? 'text-green-500' : 'text-foreground'}`}>
                                        {t.type === 'income' ? '+' : ''}{formatCurrency(t.amount)}
                                    </p>
                                    <p className="text-xs text-muted-foreground capitalize">{t.frequency}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
