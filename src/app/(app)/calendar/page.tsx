
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarDay } from '@/components/CalendarDay';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { ForecastDayDetail } from '@/components/ForecastDayDetail';
import { getTransactionsDueOnDate } from '@/lib/dateUtils';
import type { Transaction } from '@/lib/types';

interface SelectedDay {
  anchor: HTMLElement;
  transactions: Transaction[];
  date: Date;
}

export default function CalendarPage() {
  const { transactions, isTransactionsLoading, loadTransactions } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<SelectedDay | null>(null);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const changeMonth = (amount: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };

  const handleDayClick = (event: React.MouseEvent<HTMLDivElement>, date: Date, transactions: Transaction[]) => {
    setSelectedDay({
      anchor: event.currentTarget,
      transactions: transactions,
      date: date,
    });
  };

  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay();
    const dayOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const grid = [];
    
    for (let i = dayOffset - 1; i >= 0; i--) {
      const day = new Date(year, month, 0);
      day.setDate(day.getDate() - i);
      grid.push({ date: day, isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      grid.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    const gridEndOffset = 42 - grid.length;
    for (let i = 1; i <= gridEndOffset; i++) {
      grid.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return grid;
  }, [currentDate]);

  if (isTransactionsLoading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading calendar data...</p>
        </div>
      </div>
    );
  }

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Financial Calendar</h1>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-lg font-semibold text-center w-40">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>

      <Card>
        <CardContent className="p-2 sm:p-4">
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-muted-foreground text-sm mb-2">
                {weekdays.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 grid-rows-6 gap-1">
                {calendarGrid.map(({ date, isCurrentMonth }, index) => {
                    const dueTransactions = getTransactionsDueOnDate(transactions, date);
                    return (
                        <CalendarDay
                            key={index}
                            date={date}
                            transactions={dueTransactions}
                            isCurrentMonth={isCurrentMonth}
                            onClick={(e) => handleDayClick(e, date, dueTransactions)}
                        />
                    );
                })}
            </div>
        </CardContent>
      </Card>
      
      <Popover open={!!selectedDay} onOpenChange={(isOpen) => !isOpen && setSelectedDay(null)}>
        <PopoverContent 
            className="w-64" 
            side="top" 
            align="center"
            style={{
                position: 'absolute',
                left: selectedDay?.anchor.offsetLeft,
                top: selectedDay ? selectedDay.anchor.offsetTop - selectedDay.anchor.offsetHeight - 80 : 0,
            }}
            onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {selectedDay && (
            <ForecastDayDetail transactions={selectedDay.transactions} day={selectedDay.date} />
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
