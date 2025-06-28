import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Transaction } from '../types/financial';
import { getNext7Days, formatCalendarDate, getDayName, isToday, calculateDayTotals } from '../utils/dateUtils';
import { formatCurrency } from '../utils/financial';

interface WeeklyCalendarViewProps {
  transactions: Transaction[];
  onDayClick: (date: Date) => void;
}

export function WeeklyCalendarView({ transactions, onDayClick }: WeeklyCalendarViewProps) {
  const next7Days = getNext7Days();

  return (
    <Card className="p-6 bg-card border-border">
      <div className="mb-4">
        <h2 className="font-semibold text-foreground mb-1">Next 7 Days</h2>
        <p className="text-sm text-muted-foreground">
          Click any day to see detailed transactions • Based on transaction frequencies
        </p>
      </div>
      
      <div className="grid grid-cols-7 gap-3">
        {next7Days.map((date, index) => {
          const dayTotals = calculateDayTotals(transactions, date);
          const isCurrentDay = isToday(date);
          const hasActivity = dayTotals.income > 0 || dayTotals.expenses > 0 || dayTotals.debts > 0;
          const totalOut = dayTotals.expenses + dayTotals.debts;
          
          return (
            <button
              key={index}
              onClick={() => onDayClick(date)}
              className={`p-3 rounded-lg border transition-all duration-200 text-left hover:scale-105 hover:shadow-lg ${
                isCurrentDay
                  ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/20 hover:bg-primary/15'
                  : hasActivity
                  ? 'bg-muted/30 border-border hover:bg-muted/50'
                  : 'bg-muted/10 border-border/50 hover:bg-muted/20'
              }`}
            >
              {/* Date and Day */}
              <div className="text-center mb-3">
                <div className={`text-xs font-medium ${
                  isCurrentDay ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {getDayName(date)}
                </div>
                <div className={`text-sm font-semibold ${
                  isCurrentDay ? 'text-primary' : 'text-foreground'
                }`}>
                  {formatCalendarDate(date)}
                </div>
                {isCurrentDay && (
                  <Badge variant="outline" className="text-xs mt-1 border-primary/30 text-primary">
                    Today
                  </Badge>
                )}
              </div>

              {/* Simple Totals */}
              <div className="space-y-2">
                {/* Income */}
                {dayTotals.income > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-400 flex-shrink-0" />
                      <span className="text-xs text-green-400">In</span>
                    </div>
                    <span className="text-xs text-green-400 font-medium">
                      {formatCurrency(dayTotals.income)}
                    </span>
                  </div>
                )}
                
                {/* Expenses */}
                {totalOut > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <TrendingDown className="h-3 w-3 text-red-400 flex-shrink-0" />
                      <span className="text-xs text-red-400">Out</span>
                    </div>
                    <span className="text-xs text-red-400 font-medium">
                      {formatCurrency(totalOut)}
                    </span>
                  </div>
                )}
                
                {/* No Activity */}
                {!hasActivity && (
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground">No activity</span>
                  </div>
                )}
              </div>

              {/* Net Amount (if there's activity) */}
              {hasActivity && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Net:</span>
                    <span className={`text-xs font-medium ${
                      (dayTotals.income - totalOut) >= 0 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      {formatCurrency(dayTotals.income - totalOut)}
                    </span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}