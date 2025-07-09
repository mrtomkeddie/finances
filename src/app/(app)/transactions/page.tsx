
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/context/DataContext';
import { useUI } from '@/context/UIContext';
import { Transaction, TransactionFrequency } from '@/lib/types';
import { calculateSummary, formatCurrency, calculateMonthlyAmount, calculateWeeksUntilPaidOff, calculateNetMonthlyDebtPayment } from '@/lib/financial';
import { formatDate, formatNextDueDate, getNextDueDate } from '@/lib/dateUtils';
import { ArrowDown, ArrowUp, CreditCard, Calendar, Banknote, SearchX, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type SortColumn = 'name' | 'amount' | 'dueDate' | 'bank';
type SortDirection = 'asc' | 'desc';

const SortButton = ({ children, active, direction, onClick }: { children: React.ReactNode, active: boolean, direction: SortDirection, onClick: () => void }) => (
    <Button variant="ghost" onClick={onClick} className={cn("gap-1 text-muted-foreground", active && "text-primary")}>
        {children}
        {active && (direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
    </Button>
);

export default function TransactionsPage() {
    const { transactions, banks } = useData();
    const { openDetailModal } = useUI();
    
    const [activeFilter, setActiveFilter] = useState<'all' | 'income' | 'expense' | 'debt'>('all');
    const [activeBankFilter, setActiveBankFilter] = useState<string>('all');
    
    const [sortColumn, setSortColumn] = useState<SortColumn>('dueDate');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    useEffect(() => {
        setSortColumn('dueDate');
        setSortDirection('asc');
    }, [activeFilter, activeBankFilter]);

    const getBankName = (bankId: string) => banks.find(b => b.id === bankId)?.name || 'Unknown';
    const getBankColor = (bankId: string) => banks.find(b => b.id === bankId)?.color || '#6366f1';

    const handleSort = (column: SortColumn) => {
        setSortDirection(prevDir => (sortColumn === column && prevDir === 'asc' ? 'desc' : 'asc'));
        setSortColumn(column);
    };

    const sortedTransactions = useMemo(() => {
        const filtered = transactions.filter(t => {
            const typeMatches = activeFilter === 'all' || t.type === activeFilter || (activeFilter === 'expense' && t.type === 'debt');
            const bankMatches = activeBankFilter === 'all' || t.bankId === activeBankFilter;
            return typeMatches && bankMatches;
        });

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
    }, [transactions, activeFilter, activeBankFilter, sortColumn, sortDirection]);

    const totalSummary = useMemo(() => {
        const income = calculateSummary(transactions.filter(t => t.type === 'income')).monthlyIncome;
        const expenses = calculateSummary(transactions.filter(t => t.type === 'expense' || t.type === 'debt')).monthlyDebt;
        return { income, expenses };
    }, [transactions]);

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
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {['all', 'income', 'expense', 'debt'].map(filter => (
                            <Button key={filter} variant={activeFilter === filter ? 'default' : 'secondary'}
                                onClick={() => setActiveFilter(filter as any)}>
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </Button>
                        ))}
                    </div>

                    <Popover>
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
                                        onClick={() => setActiveBankFilter('all')}>All Banks</Button>
                                {banks.map(bank => (
                                    <Button key={bank.id} variant={activeBankFilter === bank.id ? 'secondary' : 'ghost'} 
                                            className="w-full justify-start gap-2"
                                            onClick={() => setActiveBankFilter(bank.id)}>
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: bank.color }} />
                                        {bank.name}
                                    </Button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <Card className="hidden sm:block">
                    <CardContent className="flex items-center justify-end gap-2 p-2">
                        <span className="text-sm text-muted-foreground">Sort by:</span>
                        <SortButton active={sortColumn === 'name'} direction={sortDirection} onClick={() => handleSort('name')}>Name</SortButton>
                        <SortButton active={sortColumn === 'amount'} direction={sortDirection} onClick={() => handleSort('amount')}>Amount</SortButton>
                        <SortButton active={sortColumn === 'dueDate'} direction={sortDirection} onClick={() => handleSort('dueDate')}>Due Date</SortButton>
                        <SortButton active={sortColumn === 'bank'} direction={sortDirection} onClick={() => handleSort('bank')}>Bank</SortButton>
                    </CardContent>
                </Card>
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
