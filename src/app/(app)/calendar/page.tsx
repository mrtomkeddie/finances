
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { Loader2, ChevronLeft, ChevronRight, CalendarCheck } from 'lucide-react';
import { CalendarDay } from '@/components/CalendarDay';
import { ForecastDayDetail } from '@/components/ForecastDayDetail';
import { getTransactionsDueOnDate } from '@/lib/dateUtils';
import type { Transaction } from '@/lib/types';

export default function CalendarPage() {
  const { transactions, isTransactionsLoading, loadTransactions } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const changeMonth = (amount: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
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

  const selectedDayTransactions = useMemo(() => {
    if (!selectedDate) return [];
    return getTransactionsDueOnDate(transactions, selectedDate);
  }, [selectedDate, transactions]);

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return currentDate.getMonth() === now.getMonth() && currentDate.getFullYear() === now.getFullYear();
  };

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
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <div className="flex items-center gap-2">
          {!isCurrentMonth() && (
            <Button variant="outline" size="sm" onClick={goToToday} className="gap-1.5">
              <CalendarCheck className="h-3.5 w-3.5" />
              Today
            </Button>
          )}
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
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`cursor-pointer rounded-md transition-colors ${isSelected ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''
                    }`}
                >
                  <CalendarDay
                    date={date}
                    transactions={dueTransactions}
                    isCurrentMonth={isCurrentMonth}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detail Panel */}
      {selectedDate && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              {selectedDate.toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ForecastDayDetail transactions={selectedDayTransactions} day={selectedDate} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
