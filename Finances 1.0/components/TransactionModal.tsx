import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Transaction, Bank, TransactionType, TransactionFrequency, InterestType, RateFrequency } from '../types/financial';
import { calculateMonthlyInterest, formatCurrency, getInterestInputLabel } from '../utils/financial';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'userId'>) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  banks: Bank[];
  editTransaction?: Transaction | null;
}

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
  onUpdateTransaction,
  banks, 
  editTransaction 
}: TransactionModalProps) {
  const [formData, setFormData] = useState<Omit<Transaction, 'id' | 'userId'>>(getInitialFormData());

  function getInitialFormData(): Omit<Transaction, 'id' | 'userId'> {
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

  useEffect(() => {
    if (isOpen) {
      if (editTransaction) {
        setFormData({
          ...editTransaction,
          amount: editTransaction.amount || 0,
        });
      } else {
        setFormData(getInitialFormData());
      }
    }
  }, [isOpen, editTransaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.bankId) {
      alert('Please fill in title and select a bank.');
      return;
    }

    if (editTransaction) {
        onUpdateTransaction({ ...formData, id: editTransaction.id, userId: editTransaction.userId });
    } else {
        onAddTransaction(formData);
    }
    onClose();
  };

  const isDebt = formData.type === 'debt';
  const isPercentageType = formData.interestType === 'percentage';

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

            <div className="space-y-2">
              <Label htmlFor="bank" className="text-foreground">
                Bank Account
              </Label>
              <Select
                value={formData.bankId}
                onValueChange={(value) => {
                  setFormData({ ...formData, bankId: value });
                }}
              >
                <SelectTrigger className={`bg-input border-border text-foreground`}>
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
            </div>
          </div>

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
                  Set to £0 if not paying
                </p>
              )}
            </div>

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
            <Label htmlFor="date" className="text-foreground">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="bg-input border-border text-foreground"
            />
          </div>

          {isDebt && (
            <>
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
              </div>

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
                        monthlyInterest: checked ? undefined : formData.monthlyInterest,
                        interestRate: checked ? formData.interestRate : undefined,
                      })}
                    />
                    <span className={`text-sm ${isPercentageType ? 'text-foreground' : 'text-muted-foreground'}`}>
                      Percentage
                    </span>
                  </div>
                </div>

                {isPercentageType ? (
                  <div className="space-y-3">
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
                    </div>
                  </div>
                ) : (
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
                  </div>
                )}
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter additional details..."
              className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[80px]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editTransaction ? 'Update Transaction' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
