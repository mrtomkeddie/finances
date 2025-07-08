
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Transaction } from '@/lib/types';
import { getNext7Days, getDayName, getDayOfMonth, isToday, calculateDayTotals, getTransactionsDueOnDate } from '@/lib/dateUtils';
import { formatCurrency } from '@/lib/financial';
import { cn } from '@/lib/utils';
import { ArrowUpCircle, ArrowDownCircle, CalendarDays } from 'lucide-react';
import { ForecastDayDetail } from './ForecastDayDetail';

interface WeeklyForecastProps {
  transactions: Transaction[];
}

export function WeeklyForecast({ transactions }: WeeklyForecastProps) {
  const next7Days = getNext7Days();

  return (
    <Card className="card-interactive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
          This Week's Outlook
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
          {next7Days.map((day, index) => {
            const totals = calculateDayTotals(transactions, day);
            const dueTransactions = getTransactionsDueOnDate(transactions, day);
            const totalOut = totals.expenses + totals.debts;
            const hasActivity = totals.income > 0 || totalOut > 0;

            return (
              <Popover key={index}>
                <PopoverTrigger asChild>
                  <div
                    className={cn(
                      'p-2 rounded-lg border flex flex-col items-center justify-between min-h-[100px] cursor-pointer transition-colors hover:bg-accent',
                      isToday(day) ? 'bg-accent border-primary/30' : 'bg-muted/20 border-transparent'
                    )}
                  >
                    <div className="flex-shrink-0">
                      <div className={cn(
                        'text-xs font-semibold',
                        isToday(day) ? 'text-primary' : 'text-muted-foreground'
                      )}>
                        {getDayName(day)}
                      </div>
                      <div className={cn(
                        'text-xl font-bold mt-1',
                         isToday(day) ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {getDayOfMonth(day)}
                      </div>
                    </div>
                    <div className="mt-2 space-y-1 text-xs w-full">
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
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-64" side="top" align="center">
                    <ForecastDayDetail transactions={dueTransactions} day={day} />
                </PopoverContent>
              </Popover>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
