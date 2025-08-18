
'use client';

import React, { useState, useEffect } from 'react';
import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/financial';
import { calculateDayTotals, isToday } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { ArrowUpCircle, ArrowDownCircle, Loader2 } from 'lucide-react';

interface CalendarDayProps extends React.HTMLAttributes<HTMLDivElement> {
  date: Date;
  transactions: Transaction[];
  isCurrentMonth: boolean;
}

export function CalendarDay({ date, transactions, isCurrentMonth, className, ...props }: CalendarDayProps) {
  const [totals, setTotals] = useState({ income: 0, expenses: 0, debts: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getTotals = async () => {
      setIsLoading(true);
      const calculatedTotals = await calculateDayTotals(transactions, date);
      setTotals(calculatedTotals);
      setIsLoading(false);
    };
    getTotals();
  }, [date, transactions]);
  
  const totalOut = totals.expenses + totals.debts;
  const hasActivity = totals.income > 0 || totalOut > 0;

  const dayIsToday = isToday(date);

  return (
    <div
      className={cn(
        'h-24 sm:h-32 p-2 rounded-lg border flex flex-col relative transition-colors cursor-pointer hover:bg-accent',
        isCurrentMonth ? 'bg-card' : 'bg-muted/20',
        dayIsToday ? 'border-primary/50 bg-accent' : 'border-border/50',
        !isCurrentMonth && 'text-muted-foreground',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'font-semibold text-sm',
          dayIsToday && 'text-primary'
        )}
      >
        {date.getDate()}
      </div>
      
      {isLoading ? (
        <div className="flex-grow flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : hasActivity && (
        <div className="flex-grow flex flex-col justify-end mt-1 space-y-1 text-xs">
          {totals.income > 0 && (
            <div className="flex items-center gap-1 text-green-500 bg-green-500/10 p-1 rounded-md text-[10px] sm:text-xs">
              <ArrowUpCircle className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{formatCurrency(totals.income)}</span>
            </div>
          )}
          {totalOut > 0 && (
            <div className="flex items-center gap-1 text-red-500 bg-red-500/10 p-1 rounded-md text-[10px] sm:text-xs">
              <ArrowDownCircle className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{formatCurrency(totalOut)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
