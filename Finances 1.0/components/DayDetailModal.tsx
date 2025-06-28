import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { TrendingUp, TrendingDown, CreditCard, Calendar } from 'lucide-react';
import { Transaction } from '../types/financial';
import { getTransactionsByTypeOnDate, getDayName, formatCalendarDate } from '../utils/dateUtils';
import { formatCurrency } from '../utils/financial';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  transactions: Transaction[];
  banks: { id: string; name: string; color: string }[];
}

export function DayDetailModal({
  isOpen,
  onClose,
  selectedDate,
  transactions,
  banks,
}: DayDetailModalProps) {
  if (!selectedDate) return null;

  const { income, expenses } = getTransactionsByTypeOnDate(transactions, selectedDate);
  
  const getBankName = (bankId: string) => {
    const bank = banks.find(b => b.id === bankId);
    return bank?.name || 'Unknown Bank';
  };

  const getBankColor = (bankId: string) => {
    const bank = banks.find(b => b.id === bankId);
    return bank?.color || '#6366f1';
  };

  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const netAmount = totalIncome - totalExpenses;

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const dayName = getDayName(selectedDate);
  const dateStr = formatCalendarDate(selectedDate);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {dayName}, {dateStr}
            {isToday && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded border border-primary/30">
                Today
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Financial activity for this day
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg border border-border/50">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Income</div>
              <div className="font-semibold text-green-400">
                {formatCurrency(totalIncome)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Expenses</div>
              <div className="font-semibold text-red-400">
                {formatCurrency(totalExpenses)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Net</div>
              <div className={`font-semibold ${netAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(netAmount)}
              </div>
            </div>
          </div>

          {/* Income List */}
          {income.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <h3 className="font-medium text-foreground">Income ({income.length})</h3>
              </div>
              <div className="space-y-2">
                {income.map((transaction, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3 bg-green-500/5 rounded-lg border border-green-500/10"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{transaction.title}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getBankColor(transaction.bankId) }}
                        />
                        {getBankName(transaction.bankId)}
                      </div>
                    </div>
                    <div className="font-semibold text-green-400">
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expenses List */}
          {expenses.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-400" />
                <h3 className="font-medium text-foreground">Expenses ({expenses.length})</h3>
              </div>
              <div className="space-y-2">
                {expenses.map((transaction, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      transaction.type === 'debt' 
                        ? 'bg-orange-500/5 border-orange-500/10' 
                        : 'bg-red-500/5 border-red-500/10'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-foreground">{transaction.title}</div>
                        {transaction.type === 'debt' && (
                          <CreditCard className="h-3 w-3 text-orange-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getBankColor(transaction.bankId) }}
                        />
                        {getBankName(transaction.bankId)}
                        {transaction.type === 'debt' && (
                          <span className="text-orange-400">• Debt Payment</span>
                        )}
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      transaction.type === 'debt' ? 'text-orange-400' : 'text-red-400'
                    }`}>
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Activity */}
          {income.length === 0 && expenses.length === 0 && (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No financial activity on this day</p>
                <p className="text-xs mt-1">Based on your transaction frequencies</p>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="pt-4">
            <Button
              onClick={onClose}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}