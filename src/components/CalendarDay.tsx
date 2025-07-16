
'use client';

import React from 'react';
import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/financial';
import { calculateDayTotals, isToday } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface CalendarDayProps extends React.HTMLAttributes<HTMLDivElement> {
  date: Date;
  transactions: Transaction[];
  isCurrentMonth: boolean;
  disabled?: boolean;
}

export function CalendarDay({ date, transactions, isCurrentMonth, disabled, className, ...props }: CalendarDayProps) {
  const totals = calculateDayTotals(transactions, date);
  const totalOut = totals.expenses + totals.debts;
  const hasActivity = totals.income > 0 || totalOut > 0;

  const dayIsToday = isToday(date);

  return (
    <div
      className={cn(
        'h-24 sm:h-32 p-2 rounded-lg border flex flex-col relative transition-colors',
        isCurrentMonth ? 'bg-card' : 'bg-muted/20',
        !disabled && 'cursor-pointer hover:bg-accent',
        disabled && 'cursor-default opacity-50',
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
      
      {hasActivity && (
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
