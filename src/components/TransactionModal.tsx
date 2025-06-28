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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
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
      remainingBalance: null,
      monthlyInterest: null,
      interestRate: null,
      interestType: 'monetary' as InterestType,
      rateFrequency: 'monthly' as RateFrequency,
      description: '',
    };
  }

  useEffect(() => {
    if (isOpen) {
      if (editTransaction) {
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
      } else {
        setFormData(getInitialFormData());
      }
    }
  }, [isOpen, editTransaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a transaction title');
      return;
    }
    
    if (formData.amount < 0) {
      alert('Please enter a valid amount (£0 or more)');
      return;
    }

    if (formData.type !== 'debt' && formData.amount <= 0) {
      alert('Please enter an amount greater than £0');
      return;
    }

    if (!formData.bankId) {
      alert('Please select a bank');
      return;
    }

    if (formData.type === 'debt' && (!formData.remainingBalance || formData.remainingBalance <= 0)) {
      alert('Please enter the remaining debt balance');
      return;
    }

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

    const transaction: Omit<Transaction, 'id'> = {
      ...formData,
      title: formData.title.trim(),
      category: formData.type, // Use transaction type as category
      remainingBalance: formData.type === 'debt' ? formData.remainingBalance : null,
      monthlyInterest: formData.type === 'debt' ? calculateMonthlyInterest(formData as Transaction) : null,
      interestRate: formData.type === 'debt' ? formData.interestRate : null,
      interestType: formData.type === 'debt' ? formData.interestType : null,
      rateFrequency: formData.type === 'debt' ? formData.rateFrequency : null,
      description: formData.description || null,
    };

    onAddTransaction(transaction);
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
      <DialogContent className="max-w-2xl mx-auto bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {editTransaction ? 'Edit Transaction' : 'Add New Transaction'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {editTransaction ? 'Update the transaction details below' : 'Fill out the transaction details below'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2 md:gap-x-6 md:gap-y-4">
          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-foreground">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: TransactionType) => setFormData({ ...formData, type: value })}
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
            <Label htmlFor="bank" className="text-foreground">Bank Account</Label>
            <Select
              value={formData.bankId}
              onValueChange={(value) => setFormData({ ...formData, bankId: value })}
            >
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Select bank" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {banks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id} className="text-popover-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: bank.color }} />
                      {bank.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title" className="text-foreground">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Monthly Salary, Weekly Groceries, etc."
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

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
              placeholder={isDebt ? '0.00' : '0.00'}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
            {isDebt && <p className="text-xs text-muted-foreground">Set to £0 if not making payments yet.</p>}
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
          
          {/* Date */}
          <div className="space-y-2 md:col-span-2">
            <Label className="text-foreground">Date of First (or Next) Payment</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    "w-full justify-start text-left font-normal bg-input border-border text-foreground placeholder:text-muted-foreground",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(new Date(formData.date), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                <Calendar
                  mode="single"
                  selected={new Date(formData.date)}
                  onSelect={(date) => {
                    if (date) {
                      setFormData({ ...formData, date: date.toISOString().split('T')[0] });
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Debt-specific fields */}
          {isDebt && (
            <div className="p-4 space-y-4 border rounded-lg md:col-span-2 bg-muted/20 border-border">
              <h4 className="font-medium text-foreground">Debt Details</h4>
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
                  placeholder="e.g. 1500.00"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Interest Type Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">Interest Input Type</Label>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${!isPercentageType ? 'text-foreground' : 'text-muted-foreground'}`}>Monetary</span>
                    <Switch
                      checked={isPercentageType}
                      onCheckedChange={(checked) => setFormData({ 
                        ...formData, 
                        interestType: checked ? 'percentage' : 'monetary',
                        monthlyInterest: checked ? null : formData.monthlyInterest,
                        interestRate: checked ? formData.interestRate : null,
                      })}
                    />
                    <span className={`text-sm ${isPercentageType ? 'text-foreground' : 'text-muted-foreground'}`}>Percentage</span>
                  </div>
                </div>

                {isPercentageType ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-foreground">Rate Type</Label>
                      <Select
                        value={formData.rateFrequency}
                        onValueChange={(value: RateFrequency) => setFormData({ ...formData, rateFrequency: value })}
                      >
                        <SelectTrigger className="bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
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
                        onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) || null })}
                        placeholder="e.g. 2.5"
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="monthlyInterest" className="text-foreground">{getInterestInputLabel('monetary')}</Label>
                    <Input
                      id="monthlyInterest"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.monthlyInterest || ''}
                      onChange={(e) => setFormData({ ...formData, monthlyInterest: parseFloat(e.target.value) || null })}
                      placeholder="e.g. 25.00 (optional)"
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description" className="text-foreground">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter additional details..."
              className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[80px]"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 md:col-span-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1">{editTransaction ? 'Update Transaction' : 'Add Transaction'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
