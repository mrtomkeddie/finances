'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, CreditCard, Pencil, Clock, Landmark } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { format, parseISO, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import type { FinancialItem } from '@/lib/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
};

const bankColors: { [key: string]: string } = {
  HSBC: 'bg-red-500',
  Barclays: 'bg-blue-500',
  Santander: 'bg-orange-500',
  'Healthy Start': 'bg-green-500',
  'Universal Credit': 'bg-yellow-500',
};

export default function DashboardPage() {
  const { financialItems, bankOverviews, banks } = useAppContext();
  const [activeTab, setActiveTab] = useState<'income' | 'expense' | 'debt'>('income');
  const [activeFilters, setActiveFilters] = useState<string[]>(['All Banks']);

  const { totalMonthlyIncome, totalMonthlyExpenses, totalDebtRemaining } = useMemo(() => {
    const income = financialItems
      .filter((i) => i.type === 'income')
      .reduce((acc, item) => acc + item.monthlyAmount, 0);
    const expenses = financialItems
      .filter((i) => i.type === 'expense')
      .reduce((acc, item) => acc + item.monthlyAmount, 0);
    const debt = financialItems
        .filter((i) => i.type === 'debt')
        .reduce((acc, item) => acc + item.amount, 0);
    return { totalMonthlyIncome: 3195.89, totalMonthlyExpenses: 3024.45, totalDebtRemaining: 20425.73 };
  }, [financialItems]);

  const filteredItems = useMemo(() => {
    return financialItems.filter(item => {
      const tabMatch = item.type === activeTab;
      const filterMatch = activeFilters.includes('All Banks') || activeFilters.includes(item.bank);
      return tabMatch && filterMatch;
    }).sort((a,b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  }, [financialItems, activeTab, activeFilters]);

  const toggleFilter = (bank: string) => {
    if (bank === 'All Banks') {
      setActiveFilters(['All Banks']);
    } else {
      setActiveFilters(prev => {
        const newFilters = prev.filter(f => f !== 'All Banks');
        if (newFilters.includes(bank)) {
          const filtered = newFilters.filter(f => f !== bank);
          return filtered.length === 0 ? ['All Banks'] : filtered;
        } else {
          return [...newFilters, bank];
        }
      });
    }
  };
  
  const getDueDate = (date: string) => {
    const dueDate = parseISO(date);
    const days = differenceInDays(dueDate, new Date());
    if (days < 0) return `Overdue by ${Math.abs(days)} days`;
    if (days === 0) return 'Due today';
    return `Due in ${days} days`;
  }

  const weeklyIncome = useMemo(() => {
      return filteredItems.filter(i => i.frequency === 'weekly').reduce((sum, item) => sum + item.amount, 0)
  }, [filteredItems])

  const monthlyIncome = useMemo(() => {
    return filteredItems.reduce((sum, item) => sum + item.monthlyAmount, 0)
  }, [filteredItems])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Monthly Income</CardTitle>
            <div className="p-2 bg-green-500/20 rounded-md">
                <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalMonthlyIncome)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Monthly Expenses</CardTitle>
            <div className="p-2 bg-red-500/20 rounded-md">
                <TrendingDown className="h-5 w-5 text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalMonthlyExpenses)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Debt Remaining</CardTitle>
             <div className="p-2 bg-yellow-500/20 rounded-md">
                <CreditCard className="h-5 w-5 text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalDebtRemaining)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bankOverviews.map(overview => (
            <Card key={overview.name}>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>{overview.name} Overview</span>
                        {overview.name === 'Santander' && <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Weekly Net Income:</span> <span className="font-semibold text-green-400">{formatCurrency(overview.weeklyNet)}</span></div>
                    <div className="flex justify-between"><span>Monthly Net Income:</span> <span className="font-semibold text-green-400">{formatCurrency(overview.monthlyNet)}</span></div>
                    {overview.weeklyTransferIn && <div className="flex justify-between"><span>Weekly Transfer In:</span> <span className="font-semibold">{formatCurrency(overview.weeklyTransferIn)}</span></div>}
                </CardContent>
            </Card>
        ))}
      </div>

       <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'income' | 'expense' | 'debt')}>
          <TabsList className="grid h-auto w-full grid-cols-3 rounded-lg bg-card p-1">
            <TabsTrigger value="income" className="rounded-lg">
              <TrendingUp className="mr-2 h-4 w-4" />
              Income
            </TabsTrigger>
            <TabsTrigger value="expense" className="rounded-lg">
              <TrendingDown className="mr-2 h-4 w-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="debt" className="rounded-lg">
              <CreditCard className="mr-2 h-4 w-4" />
              Debt
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-wrap gap-2">
          {banks.map(bank => (
            <Button key={bank} onClick={() => toggleFilter(bank)} variant="outline" size="sm" className={cn("rounded-full border-white/20", activeFilters.includes(bank) ? "bg-white/20 text-white" : "text-muted-foreground")}>
              <div className={cn("w-2 h-2 rounded-full mr-2", bankColors[bank] || 'bg-gray-400')}></div>
              {bank}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow className="border-b-white/10">
              <TableHead>Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Monthly Amount</TableHead>
              <TableHead>Next Due Date</TableHead>
              <TableHead>Bank</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map(item => (
              <TableRow key={item.id} className="border-b-white/10">
                <TableCell>{item.name}</TableCell>
                <TableCell>{formatCurrency(item.amount)}</TableCell>
                <TableCell><Badge className="bg-blue-900/50 text-blue-300 border-blue-500/50">{item.frequency}</Badge></TableCell>
                <TableCell>{formatCurrency(item.monthlyAmount)}</TableCell>
                <TableCell className="text-yellow-400">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4"/>
                        <div>
                            <div>{format(parseISO(item.nextDueDate), 'dd/MM/yyyy')}</div>
                            <div className="text-xs text-muted-foreground">{getDueDate(item.nextDueDate)}</div>
                        </div>
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", bankColors[item.bank])}></div>
                        {item.bank}
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {activeTab === 'income' && (
            <CardFooter className="justify-end gap-8 pt-4">
                <div className="text-right">
                    <div className="text-sm text-muted-foreground">Weekly Income</div>
                    <div className="text-lg font-bold">{formatCurrency(weeklyIncome)}</div>
                </div>
                 <div className="text-right">
                    <div className="text-sm text-muted-foreground">Monthly Income</div>
                    <div className="text-lg font-bold">{formatCurrency(monthlyIncome)}</div>
                </div>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
