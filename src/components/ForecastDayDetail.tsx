
'use client';

import React from 'react';
import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/financial';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface ForecastDayDetailProps {
  transactions: Transaction[];
  day: Date;
}

export function ForecastDayDetail({ transactions, day }: ForecastDayDetailProps) {
  const income = transactions.filter(t => t.type === 'income');
  const outgoing = transactions.filter(t => t.type === 'expense' || (t.type === 'debt' && t.amount > 0));

  if (transactions.length === 0) {
    return <p className="text-sm text-center text-muted-foreground p-4">No transactions scheduled for this day.</p>;
  }

  return (
    <div className="space-y-4">
      {income.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2 text-green-500">
            <ArrowUpCircle className="h-4 w-4" />
            Income
          </h4>
          <ul className="space-y-1 text-sm">
            {income.map(t => (
              <li key={t.id} className="flex justify-between items-center">
                <span className="text-foreground truncate pr-2">{t.title}</span>
                <span className="font-medium text-green-500 flex-shrink-0">{formatCurrency(t.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {outgoing.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2 text-red-500">
            <ArrowDownCircle className="h-4 w-4" />
            Outgoing
          </h4>
          <ul className="space-y-1 text-sm">
            {outgoing.map(t => (
              <li key={t.id} className="flex justify-between items-center">
                <span className="text-foreground truncate pr-2">{t.title}</span>
                <span className="font-medium text-red-500 flex-shrink-0">{formatCurrency(t.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
