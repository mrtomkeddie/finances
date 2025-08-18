
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Transaction, Bank, TransactionType, TransactionFrequency, InterestType, RateFrequency, TransactionCategory, Currency } from '@/lib/types';
import { calculateMonthlyInterest, formatCurrency, getInterestInputLabel, convertToGbp } from '@/lib/financial';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format, parse } from 'date-fns';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>, transactionId?: string) => void;
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

const categories: { value: TransactionCategory; label: string }[] = [
    { value: 'Work', label: 'Work' },
    { value: 'Education', label: 'Education' },
    { value: 'Bills/Debt', label: 'Bills/Debt' },
    { value: 'Nice To Have', label: 'Nice To Have' },
    { value: 'Uncategorized', label: 'Uncategorized' },
];

const currencies: { value: Currency; label: string }[] = [
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'USD', label: 'USD ($)' },
];

type FormData = Omit<Transaction, 'id' | 'date'>;

function getInitialFormData(): FormData {
  return {
    title: '',
    amount: 0,
    originalAmount: 0,
    currency: 'GBP',
    type: 'income' as TransactionType,
    frequency: 'monthly' as TransactionFrequency,
    category: 'Uncategorized' as TransactionCategory,
    bankId: '',
    remainingBalance: null,
    monthlyInterest: null,
    interestRate: null,
    interestType: 'monetary' as InterestType,
    rateFrequency: 'monthly' as RateFrequency,
    description: '',
  };
}

export function TransactionModal({ 
  isOpen, 
  onClose, 
  onAddTransaction, 
  banks, 
  editTransaction 
}: TransactionModalProps) {
  const [formData, setFormData] = useState<FormData>(getInitialFormData());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (editTransaction) {
        const { date, ...rest } = editTransaction;
        setFormData({
            ...getInitialFormData(),
            ...rest,
            originalAmount: rest.originalAmount || rest.amount,
            currency: rest.currency || 'GBP',
            category: rest.category || 'Uncategorized'
        });
        setSelectedDate(date ? parse(date, 'yyyy-MM-dd', new Date()) : new Date());
      } else {
        setFormData(getInitialFormData());
        setSelectedDate(new Date());
      }
      setConvertedAmount(null);
      setIsConverting(false);
    }
  }, [isOpen, editTransaction]);
  
  const handleCurrencyChange = useCallback(async (amount: number, currency: Currency) => {
    if (currency === 'USD' && amount > 0) {
      setIsConverting(true);
      try {
        const gbpValue = await convertToGbp(amount, currency);
        setConvertedAmount(gbpValue);
      } catch (error) {
        console.error("Failed to fetch exchange rate", error);
        toast({
          variant: 'destructive',
          title: 'Conversion Error',
          description: 'Could not fetch the latest exchange rate. Please try again later.',
        });
        setConvertedAmount(null);
      } finally {
        setIsConverting(false);
      }
    } else {
      setConvertedAmount(null);
    }
  }, [toast]);
  
  useEffect(() => {
    const amount = formData.originalAmount || 0;
    const currency = formData.currency || 'GBP';
    handleCurrencyChange(amount, currency);
  }, [formData.originalAmount, formData.currency, handleCurrencyChange]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const showValidationError = (description: string) => {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: description,
      });
    };

    if (!formData.title.trim()) {
      showValidationError('Please enter a transaction title.');
      return;
    }
    
    const originalAmount = formData.originalAmount || 0;
    if (originalAmount < 0) {
        showValidationError('Please enter a valid amount (£0 or more).');
        return;
    }

    if (formData.type !== 'debt' && originalAmount <= 0) {
        showValidationError('Please enter an amount greater than £0.');
        return;
    }

    if (!formData.bankId) {
      showValidationError('Please select a bank account.');
      return;
    }

    if (formData.type === 'debt' && (!formData.remainingBalance || formData.remainingBalance <= 0)) {
      showValidationError('Please enter the remaining debt balance.');
      return;
    }

    if (formData.type === 'debt') {
      if (formData.interestType === 'monetary' && formData.monthlyInterest && formData.monthlyInterest < 0) {
        showValidationError('Monthly interest cannot be negative.');
        return;
      }
      
      if (formData.interestType === 'percentage') {
        if (!formData.interestRate || formData.interestRate < 0) {
          showValidationError('Please enter a valid interest rate (0% or higher).');
          return;
        }
        if (formData.interestRate > 100) {
          showValidationError('Interest rate seems unusually high. Please check the value.');
          return;
        }
      }
    }
    
    const currency = formData.currency || 'GBP';
    const finalAmount = currency === 'USD' 
      ? convertedAmount !== null ? convertedAmount : await convertToGbp(originalAmount, currency)
      : originalAmount;

    if (finalAmount === null) {
      showValidationError('Could not convert currency. Please check your connection or try again.');
      return;
    }

    const transaction: Omit<Transaction, 'id'> = {
      ...formData,
      amount: finalAmount,
      originalAmount: originalAmount,
      currency: currency,
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      title: formData.title.trim(),
      category: formData.category || 'Uncategorized',
      remainingBalance: formData.type === 'debt' ? formData.remainingBalance : null,
      monthlyInterest: formData.type === 'debt' ? calculateMonthlyInterest({ ...formData, amount: finalAmount, date: '' } as Transaction) : null,
      interestRate: formData.type === 'debt' ? formData.interestRate : null,
      interestType: formData.type === 'debt' ? formData.interestType : null,
      rateFrequency: formData.type === 'debt' ? formData.rateFrequency : null,
      description: formData.description || null,
    };

    onAddTransaction(transaction, editTransaction?.id);
    onClose();
  };

  const isDebt = formData.type === 'debt';
  const isPercentageType = formData.interestType === 'percentage';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-auto bg-card border-border max-h-[90vh] overflow-y-auto custom-scrollbar p-6">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-4">
            <DialogTitle className="text-foreground">
              {editTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {editTransaction ? 'Update the transaction details below' : 'Fill out the transaction details below'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 pt-2 pb-6 md:grid-cols-2 md:gap-x-6 md:gap-y-4">
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
            
            {/* Category */}
            <div className="space-y-2">
                <Label htmlFor="category" className="text-foreground">Category</Label>
                <Select
                    value={formData.category}
                    onValueChange={(value: TransactionCategory) => setFormData({ ...formData, category: value })}
                >
                    <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                        {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value} className="text-popover-foreground">
                                {cat.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            {/* Amount & Currency */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="amount" className="text-foreground">
                {isDebt ? 'Payment Amount' : 'Amount'}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.originalAmount || ''}
                  onChange={(e) => setFormData({ ...formData, originalAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
                <Select
                  value={formData.currency}
                  onValueChange={(value: Currency) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger className="w-[120px] bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {currencies.map((c) => (
                      <SelectItem key={c.value} value={c.value} className="text-popover-foreground">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {convertedAmount !== null && (
                <div className="text-xs text-muted-foreground pt-1 flex items-center gap-2">
                  {isConverting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <span>~ {formatCurrency(convertedAmount)} after conversion.</span>
                  )}
                </div>
              )}
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
              <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      "w-full justify-start text-left font-normal bg-input border-border text-foreground placeholder:text-muted-foreground",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-auto p-0 bg-card border-border">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setIsCalendarOpen(false);
                    }}
                    initialFocus
                  />
                </DialogContent>
              </Dialog>
            </div>

            {/* Debt-specific fields */}
            {isDebt && (
              <div className="p-4 space-y-4 border rounded-lg md:col-span-2 bg-muted/20 border-border">
                <h4 className="font-medium text-foreground">Debt Details</h4>
                {/* Remaining Balance */}
                <div className="space-y-2">
                  <Label htmlFor="remainingBalance" className="text-foreground">Remaining Debt Balance (in {formData.currency || 'GBP'})*</Label>
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
          </div>

          <Separator className="mt-4" />
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancel</Button>
            <Button type="submit" className="w-full sm:w-auto">{editTransaction ? 'Update Transaction' : 'Add Transaction'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
