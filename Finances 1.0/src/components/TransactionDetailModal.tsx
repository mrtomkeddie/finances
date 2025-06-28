import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Edit3, Trash2, X, Clock, CreditCard, TrendingUp, TrendingDown, Calendar, Building2 } from 'lucide-react';
import { Transaction, Bank } from '../types/financial';
import { formatCurrency, calculateMonthlyAmount, calculateWeeksUntilPaidOff, calculateNetMonthlyDebtPayment } from '../utils/financial';
import { formatDate, getNextDueDate, formatNextDueDate, getNextDueDateColor } from '../utils/dateUtils';

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
  onDelete 
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  const getBankName = (bankId: string) => {
    const bank = banks.find(b => b.id === bankId);
    return bank?.name || 'Unknown Bank';
  };

  const getBankColor = (bankId: string) => {
    const bank = banks.find(b => b.id === bankId);
    return bank?.color || '#6366f1';
  };

  const getTypeIcon = () => {
    switch (transaction.type) {
      case 'income':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'expense':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      case 'debt':
        return <CreditCard className="h-5 w-5 text-orange-500" />;
      default:
        return null;
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

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${transaction.title}"? This action cannot be undone.`)) {
      onDelete(transaction.id);
      onClose();
    }
  };

  const nextDueDate = getNextDueDate(transaction.date, transaction.frequency);
  const monthlyAmount = calculateMonthlyAmount(transaction.amount, transaction.frequency);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-foreground">
            {getTypeIcon()}
            <span className="truncate">{transaction.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Details */}
          <Card className="p-4 bg-muted/10 border-border/30">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Amount</p>
                <p className="font-semibold text-foreground">
                  {formatCurrency(transaction.amount)}
                  {transaction.amount === 0 && transaction.type === 'debt' && (
                    <span className="text-xs text-muted-foreground ml-1">(not paying)</span>
                  )}
                </p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-1">Type</p>
                <p className="font-semibold text-foreground capitalize">{transaction.type}</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-1">Frequency</p>
                <Badge variant="outline" className={`${getFrequencyColor(transaction.frequency)} border text-xs`}>
                  {transaction.frequency}
                </Badge>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-1">Monthly Amount</p>
                <p className="font-semibold text-foreground">{formatCurrency(monthlyAmount)}</p>
              </div>
            </div>
          </Card>

          {/* Schedule Information */}
          <Card className="p-4 bg-muted/10 border-border/30">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium text-foreground">Schedule</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                <p className="font-semibold text-foreground">{formatDate(new Date(transaction.date))}</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-1">Next Due Date</p>
                <div className="space-y-1">
                  <p className={`font-semibold ${getNextDueDateColor(transaction.date, transaction.frequency)}`}>
                    {formatDate(nextDueDate)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatNextDueDate(transaction.date, transaction.frequency)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Bank Information */}
          <Card className="p-4 bg-muted/10 border-border/30">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium text-foreground">Bank</h3>
            </div>
            
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: getBankColor(transaction.bankId) }}
              />
              <span className="font-semibold text-foreground">{getBankName(transaction.bankId)}</span>
            </div>
          </Card>

          {/* Debt-specific Information */}
          {transaction.type === 'debt' && (
            <Card className="p-4 bg-orange-500/5 border-orange-500/20">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-4 w-4 text-orange-500" />
                <h3 className="font-medium text-foreground">Debt Details</h3>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Remaining Balance</p>
                    <p className="font-semibold text-orange-400">
                      {formatCurrency(transaction.remainingBalance || 0)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Monthly Interest</p>
                    <p className="font-semibold text-yellow-400">
                      {transaction.monthlyInterest 
                        ? formatCurrency(transaction.monthlyInterest)
                        : '£0.00'
                      }
                    </p>
                  </div>
                </div>

                {transaction.interestRate && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Interest Rate</p>
                      <p className="font-semibold text-foreground">
                        {transaction.interestRate}
                        {transaction.interestType === 'percentage' ? '%' : '£'} 
                        <span className="text-xs text-muted-foreground ml-1">
                          ({transaction.rateFrequency})
                        </span>
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Time to Pay Off</p>
                      <p className={`font-semibold ${
                        transaction.amount === 0 
                          ? 'text-muted-foreground' 
                          : calculateNetMonthlyDebtPayment(transaction) <= 0 
                          ? 'text-red-400' 
                          : 'text-blue-400'
                      }`}>
                        {(() => {
                          if (!transaction.remainingBalance || transaction.remainingBalance <= 0) {
                            return 'Paid off';
                          }
                          
                          if (!transaction.amount || transaction.amount <= 0) {
                            return 'Not paying';
                          }
                          
                          const weeks = calculateWeeksUntilPaidOff(transaction);
                          
                          if (weeks === null) {
                            const netPayment = calculateNetMonthlyDebtPayment(transaction);
                            if (netPayment <= 0) {
                              return 'Debt growing';
                            }
                            return 'Never';
                          }
                          
                          return `${weeks} weeks`;
                        })()}
                      </p>
                    </div>
                  </div>
                )}

                {transaction.amount > 0 && transaction.monthlyInterest && (
                  <div className="pt-2 border-t border-border/40">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Principal Payment</p>
                        <p className="font-semibold text-green-400">
                          {formatCurrency(Math.max(0, monthlyAmount - (transaction.monthlyInterest || 0)))}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Interest Payment</p>
                        <p className="font-semibold text-yellow-400">
                          {formatCurrency(transaction.monthlyInterest)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button
              onClick={() => onEdit(transaction)}
              className="flex-1 gap-2"
              variant="default"
            >
              <Edit3 className="h-4 w-4" />
              Edit Transaction
            </Button>
            
            <Button
              onClick={handleDelete}
              variant="outline"
              className="gap-2 text-red-400 border-red-400/30 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            
            <Button
              onClick={onClose}
              variant="secondary"
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}