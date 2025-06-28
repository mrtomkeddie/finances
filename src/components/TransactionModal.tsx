import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Transaction, Bank, TransactionType, TransactionFrequency, InterestType, RateFrequency } from '@/lib/types';
import { calculateMonthlyInterest, formatCurrency, getInterestInputLabel } from '@/lib/financial';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  banks: Bank[];
  editTransaction?: Transaction | null;
}

// SIMPLIFIED: Only income, expense, and debt - NO TRANSFERS
const transactionTypes: { value: TransactionType; label: string }[] = [
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
  { value: 'debt', label: 'Debt Payment' },
];

const frequencies: { value: TransactionFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-weekly' },
  { value: '4-weekly', label: '4-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export function TransactionModal({ 
  isOpen, 
  onClose, 
  onAddTransaction, 
  banks, 
  editTransaction 
}: TransactionModalProps) {
  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>(getInitialFormData());

  function getInitialFormData(): Omit<Transaction, 'id'> {
    return {
      title: '',
      amount: 0,
      type: 'income' as TransactionType,
      frequency: 'monthly' as TransactionFrequency,
      category: '',
      date: new Date().toISOString().split('T')[0],
      bankId: '',
      remainingBalance: undefined,
      monthlyInterest: undefined,
      interestRate: undefined,
      interestType: 'monetary' as InterestType,
      rateFrequency: 'monthly' as RateFrequency,
      description: '',
    };
  }

  // Reset form when modal opens/closes or editTransaction changes
  useEffect(() => {
    if (isOpen) {
      if (editTransaction) {
        console.log('🔄 Loading transaction for editing:', {
          id: editTransaction.id,
          title: editTransaction.title,
          bankId: editTransaction.bankId,
          bankIdValid: editTransaction.bankId && editTransaction.bankId.startsWith('rec'),
          interestType: editTransaction.interestType,
          interestRate: editTransaction.interestRate,
          monthlyInterest: editTransaction.monthlyInterest
        });
        
        setFormData({
          title: editTransaction.title,
          amount: editTransaction.amount,
          type: editTransaction.type,
          frequency: editTransaction.frequency,
          category: editTransaction.category || '',
          date: editTransaction.date,
          bankId: editTransaction.bankId || '',
          remainingBalance: editTransaction.remainingBalance,
          monthlyInterest: editTransaction.monthlyInterest,
          interestRate: editTransaction.interestRate,
          interestType: editTransaction.interestType || 'monetary',
          rateFrequency: editTransaction.rateFrequency || 'monthly',
          description: editTransaction.description || '',
        });
        
        // Warn about missing bank
        if (!editTransaction.bankId || !editTransaction.bankId.startsWith('rec')) {
          console.warn('⚠️ Transaction has invalid or missing bank ID:', {
            bankId: editTransaction.bankId,
            transactionTitle: editTransaction.title
          });
        }
      } else {
        setFormData(getInitialFormData());
      }
    }
  }, [isOpen, editTransaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      alert('Please enter a transaction title');
      return;
    }
    
    // UPDATED: Allow £0 amounts for debt transactions (unpaid debts)
    if (formData.amount < 0) {
      alert('Please enter a valid amount (£0 or more)');
      return;
    }

    // For non-debt transactions, amount must be greater than 0
    if (formData.type !== 'debt' && formData.amount <= 0) {
      alert('Please enter an amount greater than £0');
      return;
    }

    if (!formData.bankId) {
      alert('Please select a bank');
      return;
    }

    // For debt transactions, remaining balance is required
    if (formData.type === 'debt' && (!formData.remainingBalance || formData.remainingBalance <= 0)) {
      alert('Please enter the remaining debt balance');
      return;
    }

    // Validate interest inputs for debt transactions
    if (formData.type === 'debt') {
      if (formData.interestType === 'monetary' && formData.monthlyInterest && formData.monthlyInterest < 0) {
        alert('Monthly interest cannot be negative');
        return;
      }
      
      if (formData.interestType === 'percentage') {
        if (!formData.interestRate || formData.interestRate < 0) {
          alert('Please enter a valid interest rate (0% or higher)');
          return;
        }
        if (formData.interestRate > 100) {
          alert('Interest rate seems unusually high. Please check the value.');
          return;
        }
      }
    }

    // Create transaction object with calculated monthly interest
    const transaction: Omit<Transaction, 'id'> = {
      title: formData.title.trim(),
      amount: formData.amount,
      type: formData.type,
      frequency: formData.frequency,
      category: formData.type, // Use transaction type as category
      date: formData.date,
      bankId: formData.bankId,
      remainingBalance: formData.type === 'debt' ? formData.remainingBalance : undefined,
      monthlyInterest: formData.type === 'debt' ? calculateMonthlyInterest(formData as Transaction) : undefined,
      interestRate: formData.type === 'debt' ? formData.interestRate : undefined,
      interestType: formData.type === 'debt' ? formData.interestType : undefined,
      rateFrequency: formData.type === 'debt' ? formData.rateFrequency : undefined,
      description: formData.description || undefined,
    };

    onAddTransaction(transaction);
    onClose();
  };

  const isDebt = formData.type === 'debt';
  const isPercentageType = formData.interestType === 'percentage';

  // Calculate net payment for debt (payment - interest)
  const calculatedMonthlyInterest = isDebt ? calculateMonthlyInterest(formData as Transaction) : 0;
  const netPayment = isDebt && formData.amount > 0 
    ? Math.max(0, formData.amount - calculatedMonthlyInterest)
    : formData.amount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {editTransaction ? 'Edit Transaction' : 'Add New Transaction'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {editTransaction ? 'Update the transaction details below' : 'Fill out the transaction details below'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Transaction Type */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-foreground">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: TransactionType) => {
                  setFormData({ ...formData, type: value });
                }}
              >
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {transactionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-popover-foreground">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bank Selection */}
            <div className="space-y-2">
              <Label htmlFor="bank" className="text-foreground">
                Bank Account
                {editTransaction && (!editTransaction.bankId || !editTransaction.bankId.startsWith('rec')) && (
                  <span className="text-red-400 text-xs ml-2">⚠️ Required - missing bank link</span>
                )}
              </Label>
              <Select
                value={formData.bankId}
                onValueChange={(value) => {
                  console.log('🔄 Bank selected:', value);
                  setFormData({ ...formData, bankId: value });
                }}
              >
                <SelectTrigger className={`bg-input border-border text-foreground ${
                  editTransaction && (!editTransaction.bankId || !editTransaction.bankId.startsWith('rec'))
                    ? 'border-red-400/50 bg-red-500/5'
                    : ''
                }`}>
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id} className="text-popover-foreground">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: bank.color }}
                        />
                        {bank.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {editTransaction && (!editTransaction.bankId || !editTransaction.bankId.startsWith('rec')) && (
                <p className="text-xs text-red-400">
                  This transaction has lost its bank connection. Please select a bank to continue.
                </p>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter transaction title"
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-foreground">
                {isDebt ? 'Payment Amount (£)' : 'Amount (£)'}
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder={isDebt ? '0.00 (£0 = not paying yet)' : '0.00'}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
              {isDebt && (
                <p className="text-xs text-muted-foreground">
                  Set to £0 if you're not making payments yet
                </p>
              )}
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-foreground">Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value: TransactionFrequency) => setFormData({ ...formData, frequency: value })}
              >
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {frequencies.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value} className="text-popover-foreground">
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            {/* Date */}
            <Label htmlFor="date" className="text-foreground">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="bg-input border-border text-foreground"
            />
          </div>

          {/* Debt-specific fields */}
          {isDebt && (
            <>
              {/* Remaining Balance */}
              <div className="space-y-2">
                <Label htmlFor="remainingBalance" className="text-foreground">Remaining Debt Balance (£) *</Label>
                <Input
                  id="remainingBalance"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.remainingBalance || ''}
                  onChange={(e) => setFormData({ ...formData, remainingBalance: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  The total amount you still owe on this debt
                </p>
              </div>

              {/* Interest Type Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">Interest Input Type</Label>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${!isPercentageType ? 'text-foreground' : 'text-muted-foreground'}`}>
                      Monetary
                    </span>
                    <Switch
                      checked={isPercentageType}
                      onCheckedChange={(checked) => setFormData({ 
                        ...formData, 
                        interestType: checked ? 'percentage' : 'monetary',
                        // Clear the other type's value when switching
                        monthlyInterest: checked ? undefined : formData.monthlyInterest,
                        interestRate: checked ? formData.interestRate : undefined,
                      })}
                    />
                    <span className={`text-sm ${isPercentageType ? 'text-foreground' : 'text-muted-foreground'}`}>
                      Percentage
                    </span>
                  </div>
                </div>

                {/* Interest Input - Changes based on type */}
                {isPercentageType ? (
                  <div className="space-y-3">
                    {/* Rate Frequency Selection */}
                    <div className="space-y-2">
                      <Label className="text-foreground">Rate Type</Label>
                      <Select
                        value={formData.rateFrequency}
                        onValueChange={(value: RateFrequency) => setFormData({ ...formData, rateFrequency: value })}
                      >
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="monthly" className="text-popover-foreground">Monthly Rate</SelectItem>
                          <SelectItem value="annual" className="text-popover-foreground">Annual Rate (APR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Percentage Rate Input */}
                    <div className="space-y-2">
                      <Label htmlFor="interestRate" className="text-foreground">
                        {getInterestInputLabel('percentage', formData.rateFrequency)}
                      </Label>
                      <Input
                        id="interestRate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.interestRate || ''}
                        onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) || undefined })}
                        placeholder="0.00"
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      />
                      <p className="text-xs text-muted-foreground">
                        {formData.rateFrequency === 'annual' 
                          ? 'Enter the annual percentage rate (APR) from your statement'
                          : 'Enter the monthly percentage rate'
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Monetary Interest Input */
                  <div className="space-y-2">
                    <Label htmlFor="monthlyInterest" className="text-foreground">
                      {getInterestInputLabel('monetary')}
                    </Label>
                    <Input
                      id="monthlyInterest"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.monthlyInterest || ''}
                      onChange={(e) => setFormData({ ...formData, monthlyInterest: parseFloat(e.target.value) || undefined })}
                      placeholder="0.00 (optional)"
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground">
                      Fixed interest amount added to the debt each month
                    </p>
                  </div>
                )}

                {/* Interest Calculation Preview */}
                {formData.remainingBalance && formData.remainingBalance > 0 && (
                  <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg border border-border/50">
                    <div className="space-y-1">
                      <p><strong>Interest Calculation:</strong></p>
                      <p>Monthly Interest: <span className="text-yellow-400 font-medium">{formatCurrency(calculatedMonthlyInterest)}</span></p>
                      {formData.amount > 0 && (
                        <>
                          <p className="text-foreground font-medium">Net payment towards debt: </p>
                          <p className={netPayment > 0 ? 'text-green-400' : 'text-red-400'}>
                            {formatCurrency(netPayment)}/month
                          </p>
                          {netPayment <= 0 && (
                            <p className="text-red-400 text-xs mt-1">
                              ⚠️ Interest exceeds payment - debt will grow
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter additional details..."
              className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[80px]"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-border text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {editTransaction ? 'Update Transaction' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
