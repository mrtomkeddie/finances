
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Transaction } from '@/lib/types';
import { getNext7Days, getDayName, getDayOfMonth, isToday, calculateDayTotals, getTransactionsDueOnDate } from '@/lib/dateUtils';
import { formatCurrency } from '@/lib/financial';
import { cn } from '@/lib/utils';
import { ArrowUpCircle, ArrowDownCircle, CalendarDays, Loader2 } from 'lucide-react';
import { ForecastDayDetail } from './ForecastDayDetail';

interface WeeklyForecastProps {
  transactions: Transaction[];
}

interface DayForecast {
    date: Date;
    totals: {
        income: number;
        expenses: number;
        debts: number;
    };
    dueTransactions: Transaction[];
    isLoading: boolean;
}

export function WeeklyForecast({ transactions }: WeeklyForecastProps) {
  const [forecasts, setForecasts] = useState<DayForecast[]>([]);

  useEffect(() => {
    const next7Days = getNext7Days();
    const initialForecasts: DayForecast[] = next7Days.map(day => ({
        date: day,
        totals: { income: 0, expenses: 0, debts: 0 },
        dueTransactions: getTransactionsDueOnDate(transactions, day),
        isLoading: true,
    }));
    setForecasts(initialForecasts);

    const calculateAllTotals = async () => {
        const calculatedForecasts = await Promise.all(
            initialForecasts.map(async (forecast) => {
                const totals = await calculateDayTotals(forecast.dueTransactions, forecast.date);
                return { ...forecast, totals, isLoading: false };
            })
        );
        setForecasts(calculatedForecasts);
    };

    calculateAllTotals();
  }, [transactions]);


  return (
    <Card className="card-interactive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
          This Week's Outlook
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto custom-scrollbar pb-2">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center min-w-[500px] sm:min-w-full">
            {forecasts.map(({ date, totals, dueTransactions, isLoading }, index) => {
                const totalOut = totals.expenses + totals.debts;
                const hasActivity = totals.income > 0 || totalOut > 0;

                return (
                <Popover key={index}>
                    <PopoverTrigger asChild>
                    <div
                        className={cn(
                        'p-2 rounded-lg border flex flex-col items-center justify-between min-h-[100px] cursor-pointer transition-colors hover:bg-accent',
                        isToday(date) ? 'bg-accent border-primary/30' : 'bg-muted/20 border-transparent'
                        )}
                    >
                        <div className="flex-shrink-0">
                        <div className={cn(
                            'text-xs font-semibold',
                            isToday(date) ? 'text-primary' : 'text-muted-foreground'
                        )}>
                            {getDayName(date)}
                        </div>
                        <div className={cn(
                            'text-xl font-bold mt-1',
                            isToday(date) ? 'text-foreground' : 'text-muted-foreground'
                        )}>
                            {getDayOfMonth(date)}
                        </div>
                        </div>
                        <div className="mt-2 space-y-1 text-xs w-full">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <>
                                {totals.income > 0 && (
                                    <div className="flex items-center justify-center gap-1 text-green-500 bg-green-500/10 p-1 rounded-md text-[10px] sm:text-xs">
                                    <ArrowUpCircle className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{formatCurrency(totals.income)}</span>
                                    </div>
                                )}
                                {totalOut > 0 && (
                                    <div className="flex items-center justify-center gap-1 text-red-500 bg-red-500/10 p-1 rounded-md text-[10px] sm:text-xs">
                                    <ArrowDownCircle className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{formatCurrency(totalOut)}</span>
                                    </div>
                                )}
                                {!hasActivity && (
                                    <div className="h-[1px]"></div>
                                )}
                            </>
                        )}
                        </div>
                    </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-64" side="top" align="center">
                        <ForecastDayDetail transactions={dueTransactions} day={date} />
                    </PopoverContent>
                </Popover>
                );
            })}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
