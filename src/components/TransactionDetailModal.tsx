import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Calendar, Percent, Banknote } from 'lucide-react';
import { Transaction, Bank } from '@/lib/types';
import { formatCurrency, calculateMonthlyAmount, calculateNetMonthlyDebtPayment, calculateWeeksUntilPaidOff, formatInterestRate, calculateMonthlyInterest } from '@/lib/financial';
import { formatDate } from '@/lib/dateUtils';
import { Separator } from '@/components/ui/separator';
import { useUI } from '@/context/UIContext';

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
  const { openConfirmationDialog } = useUI();
  if (!transaction) return null;

  const bank = banks.find(b => b.id === transaction.bankId);
  const isDebt = transaction.type === 'debt';
  const monthlyAmount = calculateMonthlyAmount(transaction.amount, transaction.frequency);

  const handleEdit = () => {
    onEdit(transaction);
  };

  const handleDelete = () => {
    openConfirmationDialog({
      title: 'Delete Transaction?',
      description: `Are you sure you want to delete "${transaction.title}"? This action cannot be undone.`,
      onConfirm: () => onDelete(transaction.id),
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'expense': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'debt': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
        case 'weekly': return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
        case 'bi-weekly': return 'bg-teal-500/10 text-teal-300 border-teal-500/20';
        case '4-weekly': return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';
        case 'monthly': return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
        case 'yearly': return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
        default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };
  
  const actualMonthlyInterest = isDebt ? calculateMonthlyInterest(transaction) : 0;
  const netMonthlyPayment = isDebt ? calculateNetMonthlyDebtPayment(transaction) : 0;
  const weeksUntilPaidOff = isDebt ? calculateWeeksUntilPaidOff(transaction) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-2xl mx-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">{transaction.title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Transaction Details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 sm:py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`${getTypeColor(transaction.type)} border`}>
              {transaction.type === 'debt' ? 'Debt Payment' : transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
            </Badge>
            <Badge variant="outline" className={`${getFrequencyColor(transaction.frequency)} border capitalize`}>
              {transaction.frequency}
            </Badge>
          </div>

          <Separator />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex-1 p-3 sm:p-4 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs sm:text-sm text-muted-foreground">{isDebt ? 'Payment' : 'Amount'}</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{formatCurrency(transaction.amount)}</p>
            </div>
            <div className="flex-1 p-3 sm:p-4 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs sm:text-sm text-muted-foreground">Monthly Equivalent</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{formatCurrency(monthlyAmount)}</p>
            </div>
          </div>

          {isDebt && (
            <div className="space-y-3 p-3 sm:p-4 bg-muted/30 rounded-lg border border-border/50">
              <h4 className="font-semibold text-sm sm:text-base text-foreground flex items-center gap-2">
                <Percent className="h-4 w-4" /> Debt Analysis
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Balance</p>
                  <p className="text-sm font-semibold text-orange-400">{formatCurrency(transaction.remainingBalance || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Interest</p>
                  <p className="text-sm font-semibold text-yellow-400">{formatCurrency(actualMonthlyInterest)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Net Payment</p>
                  <p className={`text-sm font-semibold ${netMonthlyPayment > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(netMonthlyPayment)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Est. Pay Off</p>
                  <p className={`text-sm font-semibold ${weeksUntilPaidOff === null ? 'text-muted-foreground' : 'text-blue-400'}`}>
                    {weeksUntilPaidOff === null 
                      ? (netMonthlyPayment <= 0 && transaction.amount > 0) ? 'Growing' : 'N/A'
                      : `${weeksUntilPaidOff} wks`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3 text-sm">
              <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Account:</p>
                  <div className="flex items-center gap-2">
                    {bank && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: bank.color }} />}
                    <p className="font-medium text-foreground">{bank?.name || 'Unknown'}</p>
                  </div>
              </div>
              <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Payment Date:</p>
                  <p className="font-medium text-foreground">{formatDate(transaction.date)}</p>
              </div>
          </div>
          
          {transaction.description && (
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Description</p>
              <p className="text-xs text-muted-foreground bg-muted/30 p-2 sm:p-3 rounded-lg border border-border/50">
                {transaction.description}
              </p>
            </div>
          )}
        </div>
        <Separator className="my-4" />
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={handleEdit} className="gap-2 sm:flex-1 md:flex-none"><Edit className="h-4 w-4" /> Edit</Button>
          <Button variant="destructive" onClick={handleDelete} className="gap-2 sm:flex-1 md:flex-none"><Trash2 className="h-4 w-4" /> Delete</Button>
          <Button onClick={onClose} className="sm:flex-1 md:flex-none">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
