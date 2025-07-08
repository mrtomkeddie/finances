
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Calendar, DollarSign, CreditCard, Percent } from 'lucide-react';
import { Transaction, Bank } from '@/lib/types';
import { formatCurrency, calculateMonthlyAmount, calculateNetMonthlyDebtPayment, calculateWeeksUntilPaidOff, formatInterestRate, calculateMonthlyInterest } from '@/lib/financial';
import { formatDate } from '@/lib/dateUtils';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  banks: Bank[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
}

export function TransactionDetailModal({
  isOpen,
  onClose,
  transaction,
  banks,
  onEdit,
  onDelete,
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  const bank = banks.find(b => b.id === transaction.bankId);
  const isDebt = transaction.type === 'debt';
  const monthlyAmount = calculateMonthlyAmount(transaction.amount, transaction.frequency);

  const handleEdit = () => {
    onEdit(transaction);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${transaction.title}"?`)) {
      onDelete(transaction.id);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'expense': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'debt': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'monthly': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'yearly': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case '4-weekly': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'bi-weekly': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Calculate net payment for debt (payment - interest) using the enhanced calculation
  const actualMonthlyInterest = isDebt ? calculateMonthlyInterest(transaction) : 0;
  const netMonthlyPayment = isDebt ? calculateNetMonthlyDebtPayment(transaction) : 0;
  const weeksUntilPaidOff = isDebt ? calculateWeeksUntilPaidOff(transaction) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Transaction Details
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            View and manage details for "{transaction.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title and Type */}
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{transaction.title}</h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={`${getTypeColor(transaction.type)} border`}>
                  {transaction.type === 'debt' ? 'Debt Payment' : transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </Badge>
                <Badge variant="outline" className={`${getFrequencyColor(transaction.frequency)} border`}>
                  {transaction.frequency}
                </Badge>
              </div>
            </div>
          </div>

          {/* Amount and Monthly Equivalent */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {isDebt ? 'Payment Amount' : 'Amount'}
              </p>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(transaction.amount)}
                {transaction.amount === 0 && isDebt && (
                  <span className="text-xs text-muted-foreground ml-2">(not paying)</span>
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Monthly Equivalent</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(monthlyAmount)}</p>
            </div>
          </div>

          {/* Interest Information for Debt */}
          {isDebt && (
            <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border/50">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Debt Details
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Monthly Interest</p>
                  <p className="font-semibold text-yellow-400">
                    {formatCurrency(actualMonthlyInterest)}
                  </p>
                  {/* Show interest calculation method */}
                  {transaction.interestType === 'percentage' && transaction.interestRate && (
                    <p className="text-xs text-muted-foreground">
                      ({formatInterestRate(transaction)})
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Remaining Balance</p>
                  <p className="font-semibold text-orange-400">
                    {formatCurrency(transaction.remainingBalance || 0)}
                  </p>
                </div>
              </div>

              {/* Interest Input Method Display */}
              {transaction.interestType && (
                <div className="text-xs text-muted-foreground">
                  <strong>Interest Method:</strong> {
                    transaction.interestType === 'percentage' 
                      ? `${transaction.interestRate}% ${transaction.rateFrequency === 'annual' ? 'APR' : 'monthly'}`
                      : 'Fixed monthly amount'
                  }
                </div>
              )}

              {/* Net Payment Calculation */}
              {transaction.amount > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Net Payment (after interest)</p>
                  <p className={`font-semibold ${netMonthlyPayment > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(netMonthlyPayment)}/month
                  </p>
                  {netMonthlyPayment <= 0 && (
                    <p className="text-xs text-red-400">
                      ⚠️ Interest exceeds payment - debt will grow
                    </p>
                  )}
                </div>
              )}

              {/* Payoff Timeline */}
              {transaction.remainingBalance && transaction.remainingBalance > 0 && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Time to Pay Off</p>
                  <p className={`font-semibold ${
                    weeksUntilPaidOff === null 
                      ? netMonthlyPayment <= 0 
                        ? 'text-red-400' 
                        : 'text-muted-foreground'
                      : 'text-blue-400'
                  }`}>
                    {weeksUntilPaidOff === null 
                      ? netMonthlyPayment <= 0 
                        ? 'Debt growing' 
                        : transaction.amount === 0 
                          ? 'Not paying' 
                          : 'Never'
                      : `${weeksUntilPaidOff} weeks`
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Bank and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Bank</p>
              <div className="flex items-center gap-2">
                {bank && (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: bank.color }}
                  />
                )}
                <p className="font-medium text-foreground">{bank?.name || 'Unknown Bank'}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium text-foreground">{formatDate(transaction.date)}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {transaction.description && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-foreground bg-muted/20 p-3 rounded border border-border/50">
                {transaction.description}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleEdit}
              className="flex-1 gap-2 border-border text-foreground hover:bg-accent"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="flex-1 gap-2 text-red-400 border-red-400/30 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
